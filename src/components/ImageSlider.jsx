import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ImageSlider.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop'
];

const ImageSlider = ({ images = [], alt = 'Hotel image', className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [hasError, setHasError] = useState({});

  // Use provided images or fallback
  const imageList = images && images.length > 0
    ? images.slice(0, 10) // Limit to 10 images
    : FALLBACK_IMAGES;

  // Process image URL - handle all RateHawk formats
  const processImageUrl = (url) => {
    if (!url || typeof url !== 'string') return FALLBACK_IMAGES[0];

    let processed = url;

    // Handle URL-encoded placeholders
    processed = processed.replace(/%7Bsize%7D/gi, '1024x768');
    processed = processed.replace(/%7B/g, '{').replace(/%7D/g, '}');

    // Replace {size} placeholders in various formats
    processed = processed.replace(/t\/\{size\}\//gi, 't/1024x768/');
    processed = processed.replace(/\/\{size\}\//gi, '/1024x768/');
    processed = processed.replace(/t\{size\}/gi, '1024x768');
    processed = processed.replace(/_\{size\}_/gi, '_1024x768_');
    processed = processed.replace(/\{size\}/gi, '1024x768');

    // Ensure HTTPS
    if (processed.startsWith('http://')) {
      processed = processed.replace('http://', 'https://');
    }
    if (processed.startsWith('//')) {
      processed = 'https:' + processed;
    }

    return processed;
  };

  const goToNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const goToPrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const goToIndex = (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
    if (index === currentIndex) {
      setIsLoaded(true);
    }
  };

  const handleImageError = (index) => {
    setHasError(prev => ({ ...prev, [index]: true }));
  };

  useEffect(() => {
    setIsLoaded(loadedImages[currentIndex] || false);
  }, [currentIndex, loadedImages]);

  const currentSrc = hasError[currentIndex]
    ? FALLBACK_IMAGES[currentIndex % FALLBACK_IMAGES.length]
    : processImageUrl(imageList[currentIndex]);

  return (
    <div className={`image-slider ${className}`}>
      {/* Main Image */}
      <div className="image-slider-main">
        {/* Loading placeholder */}
        <div className={`image-slider-placeholder ${isLoaded ? 'hidden' : ''}`}>
          <div className="image-slider-shimmer"></div>
        </div>

        {/* Current Image */}
        <img
          src={currentSrc}
          alt={`${alt} ${currentIndex + 1}`}
          className={`image-slider-img ${isLoaded ? 'loaded' : ''}`}
          onLoad={() => handleImageLoad(currentIndex)}
          onError={() => handleImageError(currentIndex)}
          loading="lazy"
        />

        {/* Navigation Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              className="image-slider-nav prev"
              onClick={goToPrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="image-slider-nav next"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {imageList.length > 1 && (
          <div className="image-slider-counter">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {imageList.length > 1 && imageList.length <= 10 && (
        <div className="image-slider-dots">
          {imageList.map((_, index) => (
            <button
              key={index}
              className={`image-slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => goToIndex(index, e)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
