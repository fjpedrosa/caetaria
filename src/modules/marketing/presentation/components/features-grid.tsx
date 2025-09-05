'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import {
  Check,
  featureIcons,
  MessageCircle,
  Shield,
  Sparkles,
  Zap} from '@/lib/icons';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { FeatureIcon, Icon } from '@/modules/shared/presentation/components/ui/icon';

import { MARKETING_COPY } from '../../domain/copy';
import { type Feature } from '../../domain/types';

// Features obtenidos del copy centralizado
const defaultFeatures: Feature[] = MARKETING_COPY.features.items.map(item => ({
  ...item,
  benefits: [...item.benefits]
})) as Feature[];

export function FeaturesGrid({ features = defaultFeatures }: {
  features?: Feature[];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { badge, title, titleHighlight, description } = MARKETING_COPY.features;
  return (
    <section ref={ref} className="py-20 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
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
            <Badge variant="feature" className="px-4 py-2 mb-6">
              <Icon icon={Sparkles} size="small" iconClassName="w-4 h-4 mr-2" />
              {badge}
            </Badge>
          </motion.div>

          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {title}
            <span className="block text-primary">
              {titleHighlight}
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {description}
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
                      ? 'bg-primary/5 border-primary/20 lg:scale-105'
                      : isPremium
                      ? 'bg-muted/20 border-border'
                      : 'bg-card hover:bg-muted/10 border-border'
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
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                  >
                    <Badge className="bg-primary text-primary-foreground border-0 px-3 py-1 text-xs font-bold shadow-lg whitespace-nowrap">
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
                      variant={isCenter ? 'primary' : isPremium ? 'secondary' : 'primary'}
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
                          ease: 'easeInOut'
                        }}
                      >
                        <Icon
                          icon={isCenter ? Sparkles : Shield}
                          size="small"
                          iconClassName={isCenter ? 'text-primary' : 'text-secondary'}
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Contenido a la derecha */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold mb-3 transition-all duration-300 ${
                      isCenter
                        ? 'text-primary'
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
                            ? 'bg-primary/20 border border-primary/30'
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

                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}