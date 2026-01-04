import React from 'react';

const GalleryCard = ({ gallery }) => {
  const imageUrl = `http://localhost:5000${gallery.image_url}`;

  return (
    <div className="card shadow-sm h-100 customer-gallery-card">
      <img 
        src={imageUrl} 
        alt={gallery.caption}
        className="card-img-top customer-gallery-img"
        style={{ height: '300px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
        }}
      />
      {gallery.caption && (
        <div className="card-body">
          <p className="card-text">{gallery.caption}</p>
        </div>
      )}
    </div>
  );
};

export default GalleryCard;