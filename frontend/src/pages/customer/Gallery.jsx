import React, { useState, useEffect } from 'react';
import Navbar from '../../components/customer/Navbar';
import GalleryCard from '../../components/customer/GalleryCard';
import TestimonialCard from '../../components/customer/TestimonialCard';
import Spinner from '../../components/common/Spinner';
import { galleryAPI, testimonialAPI } from '../../services/api';

const Gallery = () => {
  const [galleryList, setGalleryList] = useState([]);
  const [testimonialList, setTestimonialList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [galleryRes, testimonialRes] = await Promise.all([
        galleryAPI.getAll(),
        testimonialAPI.getAll(),
      ]);

      setGalleryList(galleryRes.data.data);
      setTestimonialList(testimonialRes.data.data);
    } catch (error) {
      console.error('Error fetching gallery or testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-shell">
      <Navbar />
      
      <div className="container py-5">
        <div className="section-header">
          <div>
            <p className="eyebrow">Studio Collection</p>
            <h1 className="section-title">Galeri & Testimoni</h1>
            <p className="section-subtitle">Semua dokumentasi hasil sesi dan cerita dari pelanggan.</p>
          </div>
        </div>
        
        {galleryList.length === 0 ? (
          <p className="text-muted">Belum ada foto di galeri.</p>
        ) : (
          <div className="row g-4 mb-5">
            {galleryList.map((gallery) => (
              <div key={gallery.id} className="col-md-6 col-lg-4">
                <GalleryCard gallery={gallery} />
              </div>
            ))}
          </div>
        )}

        <div className="section-header mt-4">
          <div>
            <p className="eyebrow">Testimoni</p>
            <h2 className="section-title">Pengalaman mereka</h2>
            <p className="section-subtitle">Semua ulasan dalam satu halaman bersama galeri.</p>
          </div>
        </div>

        {testimonialList.length === 0 ? (
          <p className="text-muted">Belum ada testimoni.</p>
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

      <footer className="footer text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0">© 2025 Studioku Jogja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Gallery;