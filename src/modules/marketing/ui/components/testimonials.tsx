'use client';

import { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { ChevronLeft, ChevronRight,Star } from 'lucide-react';

import { MARKETING_COPY } from '@/modules/marketing/domain/copy';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/modules/shared/ui/components/ui/card';

/**
 * Testimonials Component - Client Component
 * Advanced testimonials carousel with animations
 */
export function Testimonials() {
  const { title, subtitle, items } = MARKETING_COPY.testimonials;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(items.length / 3));
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length, isAutoplay]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(items.length / 3));
    setIsAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(items.length / 3)) % Math.ceil(items.length / 3));
    setIsAutoplay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoplay(false);
  };

  // Get visible testimonials for current slide
  const getVisibleTestimonials = () => {
    const itemsPerSlide = 3;
    const start = currentIndex * itemsPerSlide;
    return items.slice(start, start + itemsPerSlide);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header with stagger animation */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-border hover:bg-primary/10"
                onMouseEnter={() => setIsAutoplay(false)}
                onMouseLeave={() => setIsAutoplay(true)}
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </Button>
            </motion.div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-border hover:bg-primary/10"
                onMouseEnter={() => setIsAutoplay(false)}
                onMouseLeave={() => setIsAutoplay(true)}
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </Button>
            </motion.div>
          </div>

          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {getVisibleTestimonials().map((testimonial, index) => (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: 'easeOut'
                    }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                      {/* Card Background Effect */}
                      <motion.div
                        className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <CardHeader className="relative">
                        {/* Rating Stars with Sequential Animation */}
                        <div className="flex mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0, rotate: -180 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: (index * 0.1) + (i * 0.1) + 0.8,
                                type: 'spring',
                                stiffness: 200
                              }}
                            >
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            </motion.div>
                          ))}
                        </div>

                        {/* Quote with Fade-in */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: (index * 0.1) + 0.6 }}
                        >
                          <CardDescription className="text-gray-700 text-base italic relative">
                            <motion.span
                              className="text-4xl text-yellow-400/30 absolute -top-2 -left-2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: (index * 0.1) + 0.7 }}
                            >
                              "
                            </motion.span>
                            "{testimonial.content}"
                            <motion.span
                              className="text-4xl text-yellow-400/30 absolute -bottom-4 -right-2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: (index * 0.1) + 0.8 }}
                            >
                              "
                            </motion.span>
                          </CardDescription>
                        </motion.div>
                      </CardHeader>

                      <CardContent className="relative">
                        <div className="flex items-center gap-3">
                          {/* Avatar with Entrance Animation */}
                          <motion.div
                            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: (index * 0.1) + 0.4,
                              type: 'spring',
                              stiffness: 200
                            }}
                            whileHover={{
                              scale: 1.1,
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-white/20 rounded-full"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: (index * 0.1) + 0.6 }}
                            />
                            <span className="relative z-10">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </motion.div>

                          {/* Author Info */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: (index * 0.1) + 0.5 }}
                          >
                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                            <div className="text-sm text-gray-600">{testimonial.role} • {testimonial.company}</div>
                          </motion.div>
                        </div>
                      </CardContent>

                      {/* Parallax Effect on Scroll */}
                      <motion.div
                        className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl"
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(Math.ceil(items.length / 3))].map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-yellow-400 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: index === currentIndex ? 1.25 : 1,
                  backgroundColor: index === currentIndex ? '#facc15' : '#d1d5db'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}