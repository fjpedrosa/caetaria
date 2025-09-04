'use client';

import { useRef,useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
}

/**
 * Animated Image Component
 *
 * Provides lazy loading with fade-in animation, blur-to-sharp transition,
 * and smooth hover effects.
 */
export function AnimatedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+Cjwvc3ZnPgo='
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: '200px 0px' // Start loading 200px before entering viewport
  });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Placeholder/Loading state */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
        animate={{
          opacity: isLoaded ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {/* Actual image */}
      {inView && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            scale: 1.1
          }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            filter: isLoaded ? 'blur(0px)' : 'blur(10px)',
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Error state */}
      {hasError && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">Failed to load</p>
          </div>
        </motion.div>
      )}

      {/* Shimmer effect during loading */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full"
        animate={!isLoaded ? {
          x: ['-100%', '100%']
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      />
    </motion.div>
  );
}

/**
 * Image Gallery Component
 *
 * A grid of animated images with staggered loading animation.
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    className?: string;
  }>;
  columns?: number;
  gap?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 'gap-4'
}: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} ${gap}`}>
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: 'easeOut'
          }}
        >
          <AnimatedImage
            src={image.src}
            alt={image.alt}
            className={`rounded-lg ${image.className || ''}`}
          />
        </motion.div>
      ))}
    </div>
  );
}