'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Award, Star, TrendingUp, Users } from '@/lib/icons';

const companies = [
  { name: 'Empresa 1', logo: '🏢' },
  { name: 'Empresa 2', logo: '🏭' },
  { name: 'Empresa 3', logo: '🏬' },
  { name: 'Empresa 4', logo: '🏨' },
  { name: 'Empresa 5', logo: '🏛️' },
  { name: 'Empresa 6', logo: '🏗️' },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Usuarios Activos' },
  { icon: TrendingUp, value: '95%', label: 'Satisfacción' },
  { icon: Star, value: '4.9/5', label: 'Calificación' },
  { icon: Award, value: '#1', label: 'En WhatsApp API' },
];

export function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-background to-muted/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Icon icon={stat.icon} size="medium" iconClassName="text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">
              Confiado por empresas líderes
            </span>
          </div>
        </div>

        {/* Company Logos */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl opacity-60 group-hover:opacity-100 transition-opacity">
                    {company.logo}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {company.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}