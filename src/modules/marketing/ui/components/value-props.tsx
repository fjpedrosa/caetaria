'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BarChart3,Bot, Zap } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MARKETING_COPY } from '@/modules/marketing/domain/copy';

const iconMap = {
  Zap,
  Bot,
  BarChart3
} as const;

/**
 * Value Props Component - Client Component with Trello-style animations
 * Displays 3 key value propositions with enhanced Trello-like card interactions
 */
export function ValueProps() {
  const { title, cards } = MARKETING_COPY.valueProps;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section 
      ref={ref}
      className="py-20 bg-gradient-to-br from-background via-muted/20 to-background"
      aria-labelledby="value-props-heading"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            id="value-props-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            {title}
          </h2>
        </motion.div>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          role="list"
          aria-label="Key benefits and features"
        >
          {cards.map((card, index) => {
            const Icon = iconMap[card.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -10 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -10 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="group perspective-1000"
              >
                <Card 
                  className="relative border border-border shadow-lg hover:shadow-2xl transition-all duration-300 bg-card hover:bg-gradient-to-br hover:from-card hover:to-muted/10 overflow-hidden h-full"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Benefit ${index + 1}: ${card.title}`}
                >
                  {/* Full-width icon container with Trello-style header */}
                  <motion.div 
                    className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50 px-6 py-4 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors duration-300"
                    whileHover={{ 
                      backgroundColor: "rgba(var(--primary), 0.15)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                          transition: { type: "spring", stiffness: 400 }
                        }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                    </div>
                  </motion.div>

                  <CardHeader className="space-y-4 pt-6">
                    <CardDescription className="text-base leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardHeader>

                  {/* Animated background decoration */}
                  <motion.div
                    className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}