import React from 'react';
import Navbar from '../../components/customer/Navbar';
import MultiStepBooking from '../../components/customer/MultiStepBooking';

const Booking = () => {
  return (
    <div>
      <Navbar />
      
      <div className="container py-5">
        <h1 className="display-5 fw-bold text-center mb-5">Form Reservasi</h1>
        <MultiStepBooking />
      </div>

      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">&copy; 2025 Studioku Jogja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Booking;