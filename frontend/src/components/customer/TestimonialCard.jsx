import React from 'react';

const TestimonialCard = ({ testimonial }) => {
  const imageUrl = testimonial.gallery 
    ? `http://localhost:5000${testimonial.gallery.image_url}`
    : 'https://via.placeholder.com/100';

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <img 
            src={imageUrl} 
            alt={testimonial.customer_name}
            className="rounded-circle me-3"
            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100';
            }}
          />
          <div>
            <h6 className="fw-bold mb-1">{testimonial.customer_name}</h6>
            <div className="text-warning">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>
        </div>
        <p className="card-text fst-italic text-muted">"{testimonial.review}"</p>
      </div>
    </div>
  );
};

export default TestimonialCard;