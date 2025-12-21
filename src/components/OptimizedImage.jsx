import { useState, useEffect } from 'react';
import './OptimizedImage.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop'
];

const OptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  aspectRatio = '4/3',
  objectFit = 'cover',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Process image URL to fix RateHawk {size} placeholders
  const processImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    return url
      .replace(/\{size\}/g, '1024x768')
      .replace(/t\{size\}/g, '1024x768')
      .replace(/^http:\/\//, 'https://');
  };

  const getFallbackImage = () => {
    if (fallbackSrc) return fallbackSrc;
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
  };

  useEffect(() => {
    const processed = processImageUrl(src);
    // If no valid URL, use fallback immediately
    if (!processed) {
      setCurrentSrc(getFallbackImage());
    } else {
      setCurrentSrc(processed);
    }
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      const fallback = getFallbackImage();
      setCurrentSrc(fallback);
      onError?.(e);
    }
  };

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={{ aspectRatio }}
    >
      {/* Loading placeholder */}
      <div className={`optimized-image-placeholder ${isLoaded ? 'hidden' : ''}`}>
        <div className="optimized-image-shimmer"></div>
      </div>

      {/* Actual image - use native lazy loading */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
