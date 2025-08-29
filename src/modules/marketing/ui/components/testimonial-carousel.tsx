'use client';

import { useEffect,useState } from 'react';
import { ChevronLeft, ChevronRight, Quote,Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

/**
 * Testimonial Carousel Component - Client Component
 * 
 * Interactive carousel showcasing customer testimonials
 * with auto-play and manual navigation controls.
 */
export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-4 py-2 mb-6">
            💬 Customer Stories
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Loved by Businesses
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Across Africa
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how companies are transforming their customer communication 
            and growing their businesses with our WhatsApp Cloud API platform.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <Card className="bg-white p-8 md:p-12 shadow-2xl border-0 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 opacity-10">
              <Quote className="w-24 h-24 text-gray-400" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center justify-center mb-6">
                {renderStars(testimonials[currentIndex].rating)}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center mb-8 font-medium">
                "{testimonials[currentIndex].content}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Name & Company */}
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <Button
            onClick={goToPrevious}
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border-2 hover:bg-gray-50 transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            onClick={goToNext}
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border-2 hover:bg-gray-50 transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-green-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Additional Testimonials Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className={`p-6 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer ${
                index === currentIndex ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => goToSlide(index)}
            >
              {/* Mini Stars */}
              <div className="flex items-center mb-3">
                {renderStars(testimonial.rating)}
              </div>

              {/* Mini Content */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                "{testimonial.content.substring(0, 100)}..."
              </p>

              {/* Mini Author */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join 10,000+ Happy Customers
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Start your free trial today and see why businesses choose our WhatsApp Cloud API platform.
            </p>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 font-semibold">
              Start Your Success Story
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}