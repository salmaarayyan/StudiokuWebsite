import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminNavbar from '../../components/admin/AdminNavbar';
import PopupModal from '../../components/common/PopupModal';
import { adminBlockAPI, bookingAPI } from '../../services/api';
import './ScheduleManagement.css';

const ScheduleManagement = () => {
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: 'success', title: '', message: '' });

  // Generate time slots from 09:00 to 20:00 with 15 min interval
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let min = 0; min < 60; min += 15) {
        if (hour === 20 && min > 0) break;
        const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    generateWeekDates(today);
    setSelectedDate(formatDate(today));
  }, []);

  useEffect(() => {
    if (weekDates.length > 0) {
      fetchScheduleData();
    }
  }, [weekDates]);

  const generateWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  };

  const fetchScheduleData = async () => {
    try {
      const [blocksRes, bookingsRes] = await Promise.all([
        adminBlockAPI.getAll(),
        bookingAPI.getAll()
      ]);
      setBlocks(blocksRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    }
  };

  const navigateWeek = (direction) => {
    const newStart = new Date(weekDates[0]);
    newStart.setDate(newStart.getDate() + (direction * 7));
    generateWeekDates(newStart);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotStatus = (date, time) => {
    const dateStr = formatDate(date);
    const normalize = (t) => (t ? t.slice(0, 5) : '');
    
    // Check if date/time is in the past
    const now = new Date();
    const currentDate = formatDate(now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Compare date first
    if (dateStr < currentDate) {
      // Past date - all slots are past
      return { status: 'past', label: time };
    } else if (dateStr === currentDate) {
      // Same date - check time
      if (time < currentTime) {
        return { status: 'past', label: time };
      }
    }
    
    // Check if booked
    const isBooked = bookings.some(booking => 
      booking.booking_date === dateStr && 
      normalize(booking.booking_time) === normalize(time) &&
      booking.status !== 'cancelled'
    );
    
    if (isBooked) return { status: 'booked', label: 'Booked' };

    // Check if blocked
    const endTime = calculateEndTime(time, 15);
    const blocked = blocks.find(block => 
      block.block_date === dateStr &&
      normalize(block.start_time) === normalize(time) &&
      normalize(block.end_time) === normalize(endTime)
    );
    
    if (blocked) {
      const reason = (blocked.reason || '').toLowerCase();
      const label = reason === 'istirahat' ? 'Istirahat' :
                    reason === 'tutup' ? 'Tutup' : 'Maintenance';
      return { status: 'blocked', label, blockId: blocked.id };
    }

    return { status: 'available', label: time };
  };

  const calculateEndTime = (startTime, minutes) => {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const endHours = Math.floor(totalMins / 60);
    const endMins = totalMins % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const handleDateClick = (date) => {
    setSlotsLoading(true);
    setSelectedDate(formatDate(date));
    
    // Simulate loading until data is fetched
    setTimeout(() => {
      setSlotsLoading(false);
    }, 1000);
  };

  const handleSlotClick = (time, slotStatus) => {
    if (slotStatus.status === 'booked' || slotStatus.status === 'past') return;
    
    setSelectedSlot({
      date: selectedDate,
      time,
      status: slotStatus.status,
      blockId: slotStatus.blockId
    });
    setShowModal(true);
  };

  const handleBlockSlot = async (reason) => {
    if (!selectedSlot) return;
    
    setLoading(true);

    try {
      const endTime = calculateEndTime(selectedSlot.time, 15);
      
      if (selectedSlot.blockId) {
        await adminBlockAPI.update(selectedSlot.blockId, {
          block_date: selectedSlot.date,
          start_time: selectedSlot.time,
          end_time: endTime,
          reason
        });
      } else {
        await adminBlockAPI.create({
          block_date: selectedSlot.date,
          start_time: selectedSlot.time,
          end_time: endTime,
          reason
        });
      }
      
      setPopup({ open: true, type: 'success', title: 'Berhasil', message: 'Jadwal berhasil diupdate!' });
      fetchScheduleData();
      setShowModal(false);
      setSelectedSlot(null);
    } catch (error) {
      setPopup({ open: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || 'Gagal memblok jadwal' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!selectedSlot || !selectedSlot.blockId) return;
    
    setLoading(true);

    try {
      await adminBlockAPI.delete(selectedSlot.blockId);
      setPopup({ open: true, type: 'success', title: 'Berhasil', message: 'Jadwal berhasil diupdate!' });
      fetchScheduleData();
      setShowModal(false);
      setSelectedSlot(null);
    } catch (error) {
      setPopup({ open: true, type: 'error', title: 'Gagal', message: 'Gagal menghapus block' });
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  const getMonthYear = () => {
    if (weekDates.length === 0) return '';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const firstDate = weekDates[0];
    return `${months[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  return (
    <AdminLayout>
      <div className="schedule-page">
        <AdminNavbar currentPage="Jadwal" />

        <div className="schedule-content">
          <div className="schedule-header">
            <div>
              <p className="schedule-eyebrow">Halaman Admin</p>
              <h1 className="schedule-title">Kelola Jadwal</h1>
            </div>
          </div>

          {/* Calendar Week View */}
          <div className="calendar-container">
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => navigateWeek(-1)} type="button">
                &#8249;
              </button>
              <h2 className="month-year">{getMonthYear()}</h2>
              <button className="nav-btn" onClick={() => navigateWeek(1)} type="button">
                &#8250;
              </button>
            </div>

            <div className="week-dates">
              {weekDates.map((date, index) => {
                const isSelected = selectedDate === formatDate(date);
                return (
                  <button
                    key={index}
                    className={`date-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDateClick(date)}
                    type="button"
                  >
                    <div className="date-number">{date.getDate()}</div>
                    <div className="date-day">{getDayName(date)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid */}
          {selectedDate && (
            <div className="slots-container">
              {slotsLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Checking Availability Times...</p>
                </div>
              ) : (
                <div className="slots-grid">
                  {timeSlots.map((time, index) => {
                    const slotStatus = getSlotStatus(selectedDateObj, time);
                    return (
                      <button
                        key={index}
                        className={`time-slot ${slotStatus.status}`}
                        onClick={() => handleSlotClick(time, slotStatus)}
                        disabled={slotStatus.status === 'booked' || slotStatus.status === 'past'}
                        type="button"
                      >
                        {slotStatus.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Modal */}
          {showModal && selectedSlot && (
            <div className="schedule-modal-backdrop">
              <div className="schedule-modal">
                <div className="modal-header">
                  <h3>
                    {selectedSlot.status === 'blocked' ? 'Ubah Status Slot' : 'Block Slot Waktu'}
                  </h3>
                  <button className="close-btn" onClick={() => setShowModal(false)} aria-label="Tutup">
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <div className="slot-info">
                    <p><strong>Tanggal:</strong> {selectedSlot.date}</p>
                    <p><strong>Waktu:</strong> {selectedSlot.time} - {calculateEndTime(selectedSlot.time, 15)}</p>
                  </div>

                  {selectedSlot.status === 'blocked' && (
                    <button
                      className="modal-action-btn unblock-btn"
                      onClick={handleUnblock}
                      disabled={loading}
                      type="button"
                    >
                      {loading ? 'Loading...' : 'Buka Kembali (Unblock)'}
                    </button>
                  )}

                  <div className="modal-actions">
                    <button
                      className="modal-action-btn istirahat-btn"
                      onClick={() => handleBlockSlot('istirahat')}
                      disabled={loading}
                      type="button"
                    >
                      Istirahat
                    </button>
                    <button
                      className="modal-action-btn tutup-btn"
                      onClick={() => handleBlockSlot('tutup')}
                      disabled={loading}
                      type="button"
                    >
                      Tutup
                    </button>
                    <button
                      className="modal-action-btn maintenance-btn"
                      onClick={() => handleBlockSlot('maintenance')}
                      disabled={loading}
                      type="button"
                    >
                      Maintenance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <PopupModal
        show={popup.open}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmLabel="Tutup"
        onConfirm={() => setPopup({ ...popup, open: false })}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </AdminLayout>
  );
};

export default ScheduleManagement;