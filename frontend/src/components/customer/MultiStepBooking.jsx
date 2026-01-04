import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { availabilityAPI, bookingAPI, adminBlockAPI, layananAPI } from '../../services/api';

const MultiStepBooking = () => {
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get('package') || 'couple';
  const selectedPackageLabel = isNaN(selectedPackage)
    ? selectedPackage.toUpperCase()
    : `Paket ${selectedPackage}`;
  const [packageName, setPackageName] = useState(selectedPackageLabel);
  const [packageDuration, setPackageDuration] = useState(30);
  const [pricingType, setPricingType] = useState('per_session');

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    additional_person: 0,
    background_choice: '',
    payment_method: 'cash',
    notes: ''
  });

  const packagePrices = {
    couple: 40000,
    group: 15000,
    photobox: 25000
  };

  const backgroundOptions = ['White Thematic', 'Grey Roll', 'White Roll'];

  const timeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const getPackageSlug = useCallback(() => {
    const lowerParam = (selectedPackage || '').toLowerCase();
    if (['couple', 'group', 'photobox'].includes(lowerParam)) return lowerParam;
    const nameLower = (packageName || '').toLowerCase();
    if (nameLower.includes('box')) return 'photobox';
    if (nameLower.includes('group')) return 'group';
    return 'couple';
  }, [selectedPackage, packageName]);

  useEffect(() => {
    if (!selectedPackage || isNaN(selectedPackage)) {
      setPackageName(selectedPackageLabel);
      setPackageDuration(30);
      setPricingType('per_session');
      return;
    }
    const loadPackage = async () => {
      try {
        const res = await layananAPI.getAll();
        const list = res.data?.data || [];
        const found = list.find((item) => `${item.id}` === `${selectedPackage}`);
        if (found) {
          setPackageName(found.name || selectedPackageLabel);
          setPackageDuration(found.duration || 30);
          setPricingType(found.pricing_type || 'per_session');
        }
      } catch (e) {
        setPackageName(selectedPackageLabel);
        setPackageDuration(30);
        setPricingType('per_session');
      }
    };
    loadPackage();
  }, [selectedPackage, selectedPackageLabel]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const [slotsRes, blocksRes, bookingsRes] = await Promise.all([
          availabilityAPI.getAvailability(selectedDate, selectedPackage),
          adminBlockAPI.getAll(),
          bookingAPI.getAll(),
        ]);

        const slots = slotsRes.data?.slots || [];
        const blocks = (blocksRes.data?.data || []).filter((b) => b.block_date === selectedDate);
        const bookings = (bookingsRes.data?.data || []).filter(
          (b) => b.booking_date === selectedDate && b.status !== 'cancelled'
        );

        const normalize = (t) => (t ? t.slice(0, 5) : '');
        const calculateEndTime = (startTime, minutes) => {
          const [hours, mins] = startTime.split(':').map(Number);
          const totalMins = hours * 60 + mins + minutes;
          const endHours = Math.floor(totalMins / 60);
          const endMins = totalMins % 60;
          return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        };

        const pkgNameLower = (packageName || '').toLowerCase();
        const pkgParamLower = (selectedPackage || '').toLowerCase();
        const fallbackStep = pkgNameLower.includes('photobox') || pkgParamLower.includes('photobox') ? 15 : 30;
        const stepMinutes = Number(packageDuration) || fallbackStep;

        const buildGridTimes = () => {
          const start = 9 * 60;
          const end = 20 * 60;
          const times = [];
          for (let t = start; t <= end; t += stepMinutes) {
            const hh = String(Math.floor(t / 60)).padStart(2, '0');
            const mm = String(t % 60).padStart(2, '0');
            times.push(`${hh}:${mm}`);
          }
          return times;
        };

        const enriched = slots.map((slot) => {
          const time = normalize(slot.time);
          const endTime = calculateEndTime(time, stepMinutes);
          
          // Check if booking matches current package
          const matchingBooking = bookings.find((b) => {
            const timeMatch = normalize(b.booking_time) === time;
            if (!timeMatch) return false;
            
            // Compare package: check layanan_id OR selected_package slug
            if (!isNaN(selectedPackage)) {
              // selectedPackage is numeric (layanan_id)
              return b.layanan_id === Number(selectedPackage);
            } else {
              // selectedPackage is slug (couple/group/photobox)
              const pkgSlug = getPackageSlug();
              return (b.selected_package || '').toLowerCase() === pkgSlug.toLowerCase();
            }
          });
          
          const block = blocks.find(
            (bl) => normalize(bl.start_time) === time && normalize(bl.end_time) === normalize(endTime)
          );

          let status = slot.status || 'available';
          let reason = slot.reason;
          if (matchingBooking) status = 'booked';
          else if (block) {
            status = 'blocked';
            reason = block.reason;
          }
          return { ...slot, time, status, reason, endTime };
        });

        // Build set of all relevant times from base grid + slots + blocks + bookings
        const timesSet = new Set(buildGridTimes());
        enriched.forEach((s) => timesSet.add(normalize(s.time)));
        blocks.forEach((bl) => timesSet.add(normalize(bl.start_time)));
        bookings.forEach((bk) => timesSet.add(normalize(bk.booking_time)));

        // Sort times
        const timesArr = Array.from(timesSet).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

        // Map enriched slots by time
        const map = new Map(enriched.map((s) => [normalize(s.time), s]));

        // Overlay blocks/bookings into map to ensure status
        blocks.forEach((bl) => {
          const start = normalize(bl.start_time);
          const end = normalize(bl.end_time);
          map.set(start, {
            ...(map.get(start) || {}),
            time: start,
            endTime: end,
            status: 'blocked',
            reason: bl.reason,
          });
        });

        bookings.forEach((bk) => {
          const time = normalize(bk.booking_time);
          
          // Only mark as booked if package matches
          let packageMatches = false;
          if (!isNaN(selectedPackage)) {
            packageMatches = bk.layanan_id === Number(selectedPackage);
          } else {
            const pkgSlug = getPackageSlug();
            packageMatches = (bk.selected_package || '').toLowerCase() === pkgSlug.toLowerCase();
          }
          
          if (packageMatches) {
            map.set(time, {
              ...(map.get(time) || {}),
              time,
              status: 'booked',
              reason: 'Booked',
            });
          }
        });

        const filled = timesArr.map((t) => map.get(t) || { time: t, status: 'available' });

        setAvailability(filled);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate, selectedPackage, packageDuration, packageName, getPackageSlug]);

  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateStr);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  };

  const decorateSlot = (slot) => {
    const time = (slot.time || '').slice(0, 5);
    const now = new Date();
    const todayStr = new Date().toISOString().split('T')[0];
    const isPastTime = selectedDate === todayStr && time < `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let status = slot.status;
    let label = time;
    if (isPastDate(selectedDate) || isPastTime) {
      status = 'past';
      label = time;
    } else if (status === 'booked') {
      label = 'Booked';
    } else if (status === 'blocked') {
      label = (slot.reason || 'Tutup');
    }

    return { ...slot, time, status, label };
  };

  const calculateTotalPrice = () => {
    const pkg = getPackageSlug();
    const basePrice = packagePrices[pkg] ?? packagePrices.couple ?? 0;
    
    // If pricing_type is per_person, multiply by additional_person
    if (pricingType === 'per_person') {
      const persons = parseInt(formData.additional_person) || 0;
      return basePrice * persons;
    }
    return basePrice;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setAvailability([]);
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      additional_person: 0,
      background_choice: '',
      payment_method: 'cash',
      notes: ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const bookingData = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      booking_date: selectedDate,
      booking_time: selectedTime,
      time_slot: selectedTime,
      selected_package: getPackageSlug(),
      additional_person: pricingType === 'per_person' ? parseInt(formData.additional_person) : 0,
      background_choice: getPackageSlug() !== 'photobox' && pricingType !== 'per_person' ? formData.background_choice : null,
      payment_method: formData.payment_method,
      total_price: calculateTotalPrice(),
      layanan_id: !isNaN(selectedPackage) ? Number(selectedPackage) : null,
      notes: formData.notes
    };

    try {
      await bookingAPI.create(bookingData);
      setShowSuccessModal(true);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Booking gagal. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  const renderStepIndicator = () => (
    <div className="booking-steps d-flex justify-content-center mb-4 flex-wrap">
      {[1, 2, 3].map((step) => (
        <div key={step} className="d-flex align-items-center me-3 mb-2">
          <div
            className={`booking-step-circle ${currentStep >= step ? 'active' : 'inactive'}`}
          >
            <span className="fw-bold">0{step}</span>
          </div>
          <span className={`fw-bold booking-step-text ${currentStep >= step ? 'active' : 'inactive'}`}>
            {step === 1 ? 'Check Availability' : step === 2 ? 'Information' : 'Additional'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h4 className="mb-4">Pilih Tanggal & Waktu</h4>
      
      <div className="mb-4">
        <label className="form-label fw-semibold">Paket: <span className="booking-accent text-uppercase">{packageName}</span></label>
        <input 
          type="date" 
          className="form-control booking-input" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          min={new Date().toISOString().split('T')[0]} 
        />
      </div>

      {selectedDate && (
        <div>
          <h5 className="mb-3">Pilih Waktu</h5>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="row g-2">
              {availability.map((slot, index) => {
                const decorated = decorateSlot(slot);
                const isSelected = decorated.status === 'available' && selectedTime === decorated.time;
                const isDisabled = decorated.status !== 'available';
                const statusClass =
                  decorated.status === 'available' ? (isSelected ? 'slot-selected' : 'slot-available') :
                  decorated.status === 'booked' ? 'slot-booked' :
                  decorated.status === 'blocked' ? 'slot-blocked' : 'slot-past';
                return (
                  <div key={index} className="col-6 col-md-3 col-lg-2">
                    <button
                      className={`slot-btn ${statusClass}`}
                      onClick={() => !isDisabled && setSelectedTime(decorated.time)}
                      disabled={isDisabled}
                      type="button"
                    >
                      <div className="slot-time">{decorated.time}</div>
                      {decorated.status === 'booked' && <small className="slot-sub">Booked</small>}
                      {decorated.status === 'blocked' && decorated.label && <small className="slot-sub">{decorated.label}</small>}
                      {decorated.status === 'past' && <small className="slot-sub">Tidak tersedia</small>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button 
        className="btn btn-warning mt-4 px-5 fw-semibold" 
        onClick={() => setCurrentStep(2)} 
        disabled={!selectedTime}
        type="button"
      >
        Next →
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h4 className="mb-4">Informasi Pribadi</h4>
      
      <div className="mb-3">
        <label className="form-label fw-semibold">Nama Lengkap *</label>
        <input 
          type="text" 
          name="customer_name" 
          className="form-control" 
          value={formData.customer_name} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Email *</label>
        <input 
          type="email" 
          name="customer_email" 
          className="form-control" 
          value={formData.customer_email} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">No. Telepon (WhatsApp) *</label>
        <input 
          type="tel" 
          name="customer_phone" 
          className="form-control" 
          value={formData.customer_phone} 
          onChange={handleChange} 
          required 
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-secondary px-4" onClick={() => setCurrentStep(1)}>
          ← Back
        </button>
        <button 
          className="btn btn-warning px-5 fw-semibold" 
          onClick={() => setCurrentStep(3)} 
          disabled={!formData.customer_name || !formData.customer_email || !formData.customer_phone}
        >
          Next →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h4 className="mb-4">Additional Info</h4>

      {pricingType === 'per_person' && (
        <div className="mb-3">
          <label className="form-label fw-semibold">Jumlah Orang *</label>
          <select 
            name="additional_person" 
            className="form-select" 
            value={formData.additional_person} 
            onChange={handleChange} 
            required
          >
            <option value="0">Pilih jumlah orang</option>
            {[...Array(13)].map((_, i) => (
              <option key={i} value={i + 3}>{i + 3} orang</option>
            ))}
          </select>
        </div>
      )}

      {getPackageSlug() !== 'photobox' && pricingType !== 'per_person' && (
        <div className="mb-3">
          <label className="form-label fw-semibold">Pilih Background *</label>
          <select 
            name="background_choice" 
            className="form-select" 
            value={formData.background_choice} 
            onChange={handleChange} 
            required
          >
            <option value="">Pilih background</option>
            {backgroundOptions.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 p-3 bg-light rounded">
        <label className="form-label fw-bold mb-2">Total Harga</label>
        <div className="display-6 fw-bold" style={{ color: '#efab46' }}>
          Rp {calculateTotalPrice().toLocaleString('id-ID')}
        </div>
        {pricingType === 'per_person' && formData.additional_person > 0 && (
          <small className="text-muted">
            ({formData.additional_person} orang × Rp {calculateTotalPrice() / (parseInt(formData.additional_person) || 1).toLocaleString('id-ID')})
          </small>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Metode Pembayaran *</label>
        <select 
          name="payment_method" 
          className="form-select" 
          value={formData.payment_method} 
          onChange={handleChange}
        >
          <option value="cash">Bayar di Tempat</option>
          <option value="qris">QRIS (Kode QR akan dikirim via WhatsApp)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">Catatan</label>
        <textarea 
          name="notes" 
          className="form-control" 
          rows="3" 
          value={formData.notes} 
          onChange={handleChange}
          placeholder="Tuliskan catatan tambahan (opsional)"
        ></textarea>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="d-flex gap-2">
        <button className="btn btn-secondary px-4" onClick={() => setCurrentStep(2)}>
          ← Back
        </button>
        <button 
          className="btn btn-warning btn-lg px-5 fw-semibold" 
          onClick={handleSubmit} 
          disabled={loading || (pricingType === 'per_person' && !formData.additional_person) || (getPackageSlug() !== 'photobox' && pricingType !== 'per_person' && !formData.background_choice)}
        >
          {loading ? 'Processing...' : '✓ Booked Now!'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
        <div className="card-body p-4">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center py-5">
                <div className="mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{ width: '100px', height: '100px' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h3 className="fw-bold mb-3">Booking Berhasil!</h3>
                <p className="text-muted mb-4">
                  Terima kasih atas reservasinya, <strong>{formData.customer_name}</strong>!<br/>
                  Admin kami akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi.
                </p>
                <div className="alert alert-info mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Info Booking Anda:</strong><br/>
                  <small>
                    Tanggal: {selectedDate} | Jam: {selectedTime}<br/>
                    Paket: {selectedPackage.toUpperCase()} | Total: Rp {calculateTotalPrice().toLocaleString('id-ID')}
                  </small>
                </div>
                <button 
                  className="btn btn-lg px-5" 
                  style={{ backgroundColor: '#efab46', borderColor: '#efab46', color: 'white' }}
                  onClick={handleCloseSuccessModal}
                >
                  OK, Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultiStepBooking;