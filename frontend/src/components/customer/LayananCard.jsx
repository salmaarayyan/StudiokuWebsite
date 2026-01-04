import React from 'react';

const LayananCard = ({ layanan }) => {
  const imageUrl = `http://localhost:5000${layanan.background_image}`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img 
        src={imageUrl} 
        alt={layanan.name}
        className="w-full h-64 object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
        }}
      />
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{layanan.name}</h3>
        <p className="text-gray-600 mb-4">{layanan.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            Rp {Number(layanan.price).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LayananCard;