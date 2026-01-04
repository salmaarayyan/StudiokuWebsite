import React, { useState, useEffect } from 'react';
import Navbar from '../../components/customer/Navbar';
import TestimonialCard from '../../components/customer/TestimonialCard';
import Spinner from '../../components/common/Spinner';
import { testimonialAPI } from '../../services/api';

const Testimonial = () => {
  const [testimonialList, setTestimonialList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialAPI.getAll();
      setTestimonialList(response.data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Navbar />
      
      <div className="container py-5">
        <h1 className="display-4 fw-bold text-center mb-5">Testimoni Pelanggan</h1>
        
        {testimonialList.length === 0 ? (
          <p className="text-center text-muted">Belum ada testimoni.</p>
        ) : (
          <div className="row g-4">
            {testimonialList.map((testimonial) => (
              <div key={testimonial.id} className="col-md-6 col-lg-4">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; 2025 Studioku Jogja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Testimonial;