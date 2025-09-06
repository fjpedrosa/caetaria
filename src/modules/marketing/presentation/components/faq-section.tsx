'use client';

import { motion } from 'framer-motion';
import { HelpCircle,Plus } from 'lucide-react';

import { MARKETING_COPY } from '@/modules/marketing/domain/copy';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/modules/shared/presentation/components/ui/accordion';

/**
 * FAQ Section Component - Client Component
 * Frequently asked questions with advanced animations
 */
export function FaqSection() {
  const { title, subtitle, items } = MARKETING_COPY.faq;

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 12,
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
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </motion.div>

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
            className="text-xl text-foreground/70 dark:text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border-0 bg-card/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AccordionTrigger className="text-left hover:no-underline px-6 py-6 group-hover:bg-accent/50 rounded-xl transition-colors duration-300">
                      <span className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors duration-300">
                        {item.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-foreground/80 dark:text-muted-foreground leading-relaxed text-base"
                      >
                        <motion.div
                          className="border-l-4 border-primary pl-4 bg-accent/30 rounded-r-lg py-3 text-foreground/90 dark:text-muted-foreground"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          {item.answer}
                        </motion.div>
                      </motion.div>
                    </AccordionContent>
                  </motion.div>

                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* Call-to-action at bottom */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              className="inline-block bg-primary/10 px-6 py-4 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-foreground mb-3">
                ¿Tienes más preguntas? ¡Estamos aquí para ayudarte!
              </p>
              <motion.button
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow duration-300"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                Contactar Soporte
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-10 w-6 h-6 bg-primary/20 rounded-full"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-4 h-4 bg-secondary/20 rounded-full"
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          delay: 2,
        }}
      />
    </section>
  );
}