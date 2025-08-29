'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeatureIcon, Icon, IconWithText } from '@/components/ui/icon';
import {
  featureIcons,
  actionIcons,
  MessageCircle,
  Zap,
  Shield,
  Users,
  BarChart3,
  Globe2,
  Bot,
  Webhook,
  Sparkles,
  ArrowRight,
  Check,
  Activity,
  Cloud,
  Database
} from '@/lib/icons';

interface Feature {
  title: string;
  description: string;
  icon: keyof typeof featureIcons;
  benefits: string[];
  badge?: string;
}

// Default features data with enhanced icons
const defaultFeatures: Feature[] = [
  {
    title: 'Instant Messaging',
    description: 'Lightning-fast WhatsApp conversations that delight customers',
    icon: 'messaging',
    badge: 'Most Popular',
    benefits: [
      'Sub-second response time',
      'Rich media support',
      'End-to-end encryption'
    ]
  },
  {
    title: 'AI Automation',
    description: 'Intelligent bots powered by GPT-4 and custom AI models',
    icon: 'automation',
    badge: 'AI-Powered',
    benefits: [
      '24/7 availability',
      'Human-like conversations',
      'Smart escalation'
    ]
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade security with GDPR and SOC 2 compliance',
    icon: 'security',
    benefits: [
      'Data encryption',
      'Access controls',
      'Audit logs'
    ]
  },
  {
    title: 'Real-time Analytics',
    description: 'Comprehensive insights to optimize every conversation',
    icon: 'analytics',
    benefits: [
      'Live dashboards',
      'Custom reports',
      'Performance KPIs'
    ]
  },
  {
    title: 'Global Scale',
    description: 'Multi-region infrastructure for worldwide reach',
    icon: 'global',
    benefits: [
      '99.99% uptime SLA',
      'Auto-scaling',
      'CDN delivery'
    ]
  },
  {
    title: 'Team Collaboration',
    description: 'Unified workspace for your entire customer service team',
    icon: 'users',
    benefits: [
      'Shared inbox',
      'Team assignments',
      'Internal notes'
    ]
  }
];

interface FeaturesGridProps {
  features?: Feature[];
}


/**
 * Features Grid Component - Client Component with Animations
 * 
 * Displays a grid of product features with icons and benefits.
 * Enhanced with viewport animations and modern interactions.
 */
export function FeaturesGrid({ features = defaultFeatures }: FeaturesGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Enhanced Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-4 py-2 mb-6 shadow-lg border-0">
              <Icon icon={Sparkles} size="small" iconClassName="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Everything You Need for
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              WhatsApp Business Excellence
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Our comprehensive WhatsApp Cloud API platform combines cutting-edge technology 
            with enterprise-grade reliability to transform how you connect with customers.
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid with Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = featureIcons[feature.icon] || MessageCircle;
            const isCenter = index === 1; // Make the second card special
            const isPremium = index === 2; // Security gets special treatment
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, rotateX: -10 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: -10 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  rotateX: 5,
                  rotateY: index % 2 === 0 ? 2 : -2,
                  transition: { duration: 0.3 }
                }}
                className={`perspective-1000 ${isCenter ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <Card 
                  className={`group relative p-8 h-full transition-all duration-500 border shadow-lg hover:shadow-2xl overflow-hidden ${
                    isCenter 
                      ? 'bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 lg:scale-105'
                      : isPremium
                      ? 'bg-gradient-to-br from-secondary/5 to-background border-secondary/20'
                      : 'bg-card hover:bg-gradient-to-br hover:from-muted/20 hover:to-card border-border'
                  }`}
                >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 border-2 border-primary/20 rounded-full animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-secondary/20 rounded-full animate-float" />
                </div>
                
                {/* Feature Badge */}
                {feature.badge && (
                  <motion.div
                    className="absolute -top-3 -right-3 z-20"
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 px-3 py-1 text-xs font-bold shadow-lg whitespace-nowrap">
                      {feature.badge}
                    </Badge>
                  </motion.div>
                )}
                
                {/* Layout horizontal mejorado */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Icono a la izquierda */}
                  <motion.div 
                    className="flex-shrink-0 mt-1"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FeatureIcon
                      icon={IconComponent}
                      variant={isCenter ? 'gradient' : isPremium ? 'secondary' : 'primary'}
                      glowing={isCenter}
                      className="shadow-lg"
                    />
                    
                    {/* Floating animation for special cards */}
                    {(isCenter || isPremium) && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Icon
                          icon={isCenter ? Sparkles : Shield}
                          size="small"
                          iconClassName={isCenter ? "text-primary" : "text-secondary"}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Contenido a la derecha */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold mb-3 transition-all duration-300 ${
                      isCenter 
                        ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'
                        : isPremium
                        ? 'text-foreground group-hover:text-secondary'
                        : 'text-foreground group-hover:text-primary'
                    }`}>
                      {feature.title}
                      {isCenter && (
                        <Icon
                          icon={Zap}
                          size="small"
                          iconClassName="inline w-5 h-5 ml-2 text-primary"
                        />
                      )}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Animated Benefits List */}
                <div className="space-y-3 mb-6 relative z-10">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <motion.div 
                      key={benefitIndex} 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.8 + (index * 0.1) + (benefitIndex * 0.05)
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div 
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          isCenter 
                            ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30'
                            : isPremium
                            ? 'bg-secondary/10 border border-secondary/20'
                            : 'bg-success/10 group-hover:bg-success/20'
                        }`}
                        whileHover={{ scale: 1.3, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon
                          icon={Check}
                          size="small"
                          iconClassName={`w-3 h-3 ${
                            isCenter ? 'text-primary' : isPremium ? 'text-secondary' : 'text-success'
                          }`}
                        />
                      </motion.div>
                      <span className="text-sm text-foreground/80 font-medium group-hover:text-foreground transition-colors">
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Learn More Link */}
                <div className="pt-4 border-t border-border/50 relative z-10">
                  <motion.a 
                    href={`#${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`font-semibold text-sm inline-flex items-center group/link transition-all duration-300 ${
                      isCenter 
                        ? 'text-primary hover:text-primary-hover'
                        : isPremium
                        ? 'text-secondary hover:text-secondary-hover'
                        : 'text-secondary hover:text-secondary-hover'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <IconWithText
                      icon={ArrowRight}
                      text="Learn more"
                      position="right"
                      size="small"
                      iconClassName="group-hover/link:translate-x-1 transition-transform"
                    />
                  </motion.a>
                </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          <motion.div 
            className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-xl border-2 border-primary/20 relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50" />
            
            <div className="text-center sm:text-left relative z-10">
              <motion.h3 
                className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center sm:justify-start gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <Icon icon={Sparkles} size="medium" iconClassName="text-primary" />
                Ready to see these features in action?
              </motion.h3>
              <p className="text-gray-600">
                Get hands-on experience with our interactive demo
              </p>
            </div>
            <div className="flex-shrink-0 relative z-10">
              <motion.a
                href="#demo"
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-2xl flex items-center group relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon icon={Zap} size="medium" iconClassName="text-white" />
                  Try Demo
                  <Icon icon={ArrowRight} size="medium" iconClassName="text-white group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}