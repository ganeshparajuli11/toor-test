import React, { useState, memo, useCallback } from 'react';
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
  const [failedImages, setFailedImages] = useState({});

  // Fallback images when no images are provided
  const fallbackImages = [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  ];

  // Handle image load error - update state to use fallback (React will re-render)
  const handleImageError = useCallback((index) => {
    console.log(`[ImageGallery] Image ${index} failed to load, switching to fallback`);
    setFailedImages(prev => {
      if (prev[index]) return prev; // Already failed, don't re-render
      return { ...prev, [index]: true };
    });
  }, []);

  // Process image URL to ensure it's valid
  const processImageUrl = useCallback((url, index) => {
    if (!url || typeof url !== 'string') {
      return fallbackImages[index % fallbackImages.length];
    }

    let processed = url;

    // Handle URL-encoded placeholders
    processed = processed.replace(/%7Bsize%7D/gi, '1024x768');
    processed = processed.replace(/%7B/g, '{').replace(/%7D/g, '}');

    // Replace {size} placeholders
    processed = processed.replace(/t\/\{size\}\//gi, 't/1024x768/');
    processed = processed.replace(/\/\{size\}\//gi, '/1024x768/');
    processed = processed.replace(/t\{size\}/gi, '1024x768');
    processed = processed.replace(/_\{size\}_/gi, '_1024x768_');
    processed = processed.replace(/\{size\}/gi, '1024x768');

    // Ensure HTTPS
    if (processed.startsWith('http://')) {
      processed = processed.replace('http://', 'https://');
    }

    // Add protocol if missing
    if (processed.startsWith('//')) {
      processed = 'https:' + processed;
    }

    return processed;
  }, []);

  // Ensure we have at least 5 images for the layout
  // If fewer images are provided, repeat them to fill the grid
  const ensureMinImages = (imgs) => {
    if (!imgs || imgs.length === 0) return fallbackImages;
    if (imgs.length >= 5) return imgs;

    // Repeat images to fill at least 5 slots
    const result = [...imgs];
    while (result.length < 5) {
      result.push(imgs[result.length % imgs.length]);
    }
    return result;
  };

  // Process all images through our URL processor
  const processedImages = (images || []).map((img, i) => processImageUrl(img, i));
  const displayImages = ensureMinImages(processedImages);

  // Keep track of original images count for the modal
  const originalImages = processedImages.length > 0 ? processedImages : fallbackImages;

  // Get image URL, using fallback if it failed to load
  const getImageUrl = (index) => {
    if (failedImages[index]) {
      return fallbackImages[index % fallbackImages.length];
    }
    return displayImages[index] || fallbackImages[index % fallbackImages.length];
  };

  const mainImage = getImageUrl(0);
  const thumbnails = [1, 2, 3, 4].map(i => getImageUrl(i));

  // Log for debugging
  console.log('[ImageGallery] Input images:', images?.length || 0);
  console.log('[ImageGallery] Display images:', displayImages);

  const openModal = (index) => {
    toast.info('Opening gallery...');
    // Map the display index to the original images index
    const originalIndex = index % originalImages.length;
    setSelectedImageIndex(originalIndex);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % originalImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + originalImages.length) % originalImages.length);
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
              key={`main-${failedImages[0] ? 'fallback' : 'original'}`}
              src={mainImage}
              alt={`${propertyName} - Main`}
              loading="eager"
              onError={() => handleImageError(0)}
            />
            <div className="gallery-main-image-overlay" />
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="gallery-thumbnails">
          {thumbnails.map((imageUrl, index) => {
            const actualIndex = index + 1;
            return (
              <div
                key={actualIndex}
                className="gallery-thumbnail"
                onClick={() => openModal(actualIndex)}
              >
                <div className="gallery-thumbnail-group">
                  <img
                    key={`thumb-${actualIndex}-${failedImages[actualIndex] ? 'fallback' : 'original'}`}
                    src={imageUrl}
                    alt={`${propertyName} - ${actualIndex + 1}`}
                    loading="eager"
                    onError={() => handleImageError(actualIndex)}
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
            );
          })}
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
              src={failedImages[selectedImageIndex] ? fallbackImages[selectedImageIndex % fallbackImages.length] : originalImages[selectedImageIndex]}
              alt={`${propertyName} - ${selectedImageIndex + 1}`}
              className="gallery-modal-image"
              onError={() => handleImageError(selectedImageIndex)}
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
            {selectedImageIndex + 1} / {originalImages.length}
          </div>
        </div>
      )}
    </>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
