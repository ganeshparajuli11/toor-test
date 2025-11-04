import React, { useState, memo } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import './ImageGallery.css';

/**
 * Image Gallery Component
 * Displays property images in a grid with modal view
 *
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image URLs
 * @param {string} props.propertyName - Property name for alt text
 */
const ImageGallery = memo(({ images = [], propertyName = 'Property' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Ensure we have at least 5 images for the layout
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  ];

  const mainImage = displayImages[0];
  const thumbnails = displayImages.slice(1, 5);

  const openModal = (index) => {
    toast.info('Opening gallery...');
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      {/* Image Grid */}
      <div className="image-gallery">
        {/* Main Large Image */}
        <div
          className="gallery-main-image"
          onClick={() => openModal(0)}
        >
          <div className="gallery-main-image-group">
            <img
              src={mainImage}
              alt={`${propertyName} - Main`}
              loading="eager"
            />
            <div className="gallery-main-image-overlay" />
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="gallery-thumbnails">
          {thumbnails.map((image, index) => (
            <div
              key={index}
              className="gallery-thumbnail"
              onClick={() => openModal(index + 1)}
            >
              <div className="gallery-thumbnail-group">
                <img
                  src={image}
                  alt={`${propertyName} - ${index + 2}`}
                  loading="lazy"
                />
                <div className="gallery-thumbnail-overlay" />

                {/* "View all photos" button on last thumbnail */}
                {index === 3 && (
                  <div className="gallery-view-all">
                    <button className="gallery-view-all-button">
                      View all photos
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div className="gallery-modal">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="gallery-modal-close"
            aria-label="Close gallery"
          >
            <X size={24} className="gallery-modal-close-icon" />
          </button>

          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="gallery-modal-prev"
            aria-label="Previous image"
          >
            <span className="gallery-modal-nav-icon">‹</span>
          </button>

          {/* Main Image */}
          <div className="gallery-modal-image-container">
            <img
              src={displayImages[selectedImageIndex]}
              alt={`${propertyName} - ${selectedImageIndex + 1}`}
              className="gallery-modal-image"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="gallery-modal-next"
            aria-label="Next image"
          >
            <span className="gallery-modal-nav-icon">›</span>
          </button>

          {/* Image Counter */}
          <div className="gallery-modal-counter">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
