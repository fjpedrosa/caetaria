'use client';

import { useEffect, useRef,useState } from 'react';
import {
  Award,
  Clock,
  Globe,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Zap} from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Card } from '@/modules/shared/presentation/components/ui/card';

interface Metric {
  id: string;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  icon: typeof Users;
  color: string;
  description: string;
}

const METRICS: Metric[] = [
  {
    id: 'businesses',
    label: 'Active Businesses',
    value: 10000,
    suffix: '+',
    icon: Users,
    color: 'text-blue-600',
    description: 'Businesses trust our platform'
  },
  {
    id: 'messages',
    label: 'Messages Delivered',
    value: 50000000,
    suffix: '+',
    icon: MessageSquare,
    color: 'text-green-600',
    description: 'Messages sent successfully'
  },
  {
    id: 'countries',
    label: 'Countries Served',
    value: 54,
    suffix: '',
    icon: Globe,
    color: 'text-purple-600',
    description: 'Across Africa and beyond'
  },
  {
    id: 'uptime',
    label: 'Uptime Guarantee',
    value: 99.9,
    suffix: '%',
    icon: Shield,
    color: 'text-orange-600',
    description: 'Reliable service you can count on'
  },
  {
    id: 'response-time',
    label: 'Average Response',
    value: 0.8,
    suffix: 's',
    prefix: '<',
    icon: Zap,
    color: 'text-yellow-600',
    description: 'Lightning-fast API responses'
  },
  {
    id: 'growth',
    label: 'Monthly Growth',
    value: 25,
    suffix: '%',
    prefix: '+',
    icon: TrendingUp,
    color: 'text-red-600',
    description: 'Platform adoption rate'
  },
  {
    id: 'support',
    label: 'Support Availability',
    value: 24,
    suffix: '/7',
    icon: Clock,
    color: 'text-indigo-600',
    description: 'Round-the-clock expert support'
  },
  {
    id: 'satisfaction',
    label: 'Customer Satisfaction',
    value: 98,
    suffix: '%',
    icon: Award,
    color: 'text-pink-600',
    description: 'Based on customer surveys'
  }
];

/**
 * Metrics Counter Widget - Client Component
 *
 * Animated counter widget displaying key platform metrics
 * with intersection observer for triggered animations.
 */
export function MetricsCounter() {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Format number with appropriate suffixes
  const formatNumber = (value: number, metric: Metric): string => {
    const { prefix = '', suffix } = metric;

    if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
    } else if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`;
    } else if (value < 1 && value > 0) {
      return `${prefix}${value.toFixed(1)}${suffix}`;
    } else {
      return `${prefix}${Math.round(value)}${suffix}`;
    }
  };

  // Animate counter to target value
  const animateCounter = (targetValue: number, metricId: string, duration = 2000) => {
    const startTime = Date.now();
    const startValue = animatedValues[metricId] || 0;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOutCubic;

      setAnimatedValues(prev => ({
        ...prev,
        [metricId]: currentValue
      }));

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  };

  // Intersection Observer for triggering animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);

          // Start animations for all metrics with staggered delays
          METRICS.forEach((metric, index) => {
            setTimeout(() => {
              animateCounter(metric.value, metric.id);
            }, index * 100);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 mb-6">
          📊 Platform Metrics
        </Badge>

        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Trusted by Businesses
          <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Across Africa
          </span>
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our WhatsApp Cloud API platform delivers exceptional performance
          and reliability at scale. Here's what our customers experience.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, index) => {
          const IconComponent = metric.icon;
          const currentValue = animatedValues[metric.id] || 0;
          const displayValue = formatNumber(currentValue, metric);

          return (
            <Card
              key={metric.id}
              className={`p-6 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white group hover:-translate-y-1 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className={`w-8 h-8 ${metric.color}`} />
                </div>
              </div>

              {/* Value */}
              <div className={`text-3xl lg:text-4xl font-bold mb-2 ${metric.color} font-mono`}>
                {displayValue}
              </div>

              {/* Label */}
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                {metric.label}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {metric.description}
              </p>

              {/* Progress Bar for Visual Effect */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                      metric.color.includes('blue') ? 'from-blue-400 to-blue-600' :
                      metric.color.includes('green') ? 'from-green-400 to-green-600' :
                      metric.color.includes('purple') ? 'from-purple-400 to-purple-600' :
                      metric.color.includes('orange') ? 'from-orange-400 to-orange-600' :
                      metric.color.includes('yellow') ? 'from-yellow-400 to-yellow-600' :
                      metric.color.includes('red') ? 'from-red-400 to-red-600' :
                      metric.color.includes('indigo') ? 'from-indigo-400 to-indigo-600' :
                      metric.color.includes('pink') ? 'from-pink-400 to-pink-600' :
                      'from-gray-400 to-gray-600'
                    }`}
                    style={{
                      width: isVisible ? '100%' : '0%',
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom Stats Summary */}
      <div className="mt-16 text-center">
        <Card className="inline-block p-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                🎆 Enterprise Grade
              </div>
              <div className="text-sm text-gray-600">
                Built for scale and reliability
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-300" />

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                🚀 Growing Fast
              </div>
              <div className="text-sm text-gray-600">
                Join thousands of satisfied customers
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-300" />

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ✅ Proven Results
              </div>
              <div className="text-sm text-gray-600">
                Trusted by industry leaders
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-6">
          Ready to become part of these impressive numbers?
        </p>
        <a
          href="#pricing"
          className="inline-flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg group"
        >
          Start Your Free Trial
          <TrendingUp className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}