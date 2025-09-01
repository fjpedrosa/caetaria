'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Twitter} from 'lucide-react';

import { Button } from '@/modules/shared/ui/components/ui/button';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Separator } from '@/modules/shared/ui/components/ui/separator';

/**
 * Landing Footer Component - Client Component
 *
 * Comprehensive footer with navigation links, contact information,
 * newsletter signup, and company information with advanced animations.
 */
export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isNewsletterFocused, setIsNewsletterFocused] = useState(false);

  const footerLinks = {
    product: [
      { name: 'Cómo Funciona', href: '/how-it-works' },
      { name: 'Precios', href: '/precios' },
      { name: 'Roadmap', href: '/roadmap' },
      { name: 'Acceso Anticipado', href: '/early-access' }
    ],
    solutions: [
      { name: 'E-commerce', href: '/solutions/ecommerce' },
      { name: 'Customer Support', href: '/solutions/support' },
      { name: 'Marketing', href: '/solutions/marketing' },
      { name: 'Sales', href: '/solutions/sales' },
      { name: 'Healthcare', href: '/solutions/healthcare' },
      { name: 'Education', href: '/solutions/education' }
    ],
    company: [
      { name: 'Sobre Nosotros', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contacto', href: '/contact' }
    ],
    resources: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Guías', href: '/guides' },
      { name: 'Blog', href: '/blog' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Privacidad', href: '/gdpr' },
      { name: 'Security', href: '/security' },
      { name: 'Compliance', href: '/compliance' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/whatsappcloud' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/whatsappcloud' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/whatsappcloud' }
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Wave Separator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary">
        <motion.div
          className="h-full bg-white/20"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Company Info & Newsletter */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo & Description */}
            <motion.div
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center relative overflow-hidden"
                whileHover={{
                  boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)'
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
                <MessageSquare className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <div>
                <motion.div
                  className="font-bold text-xl"
                  whileHover={{ color: '#facc15' }}
                >
                  WhatsApp Cloud
                </motion.div>
                <motion.div
                  className="text-yellow-400 text-sm flex items-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  WhatsApp Inteligente
                </motion.div>
              </div>
            </motion.div>

            <motion.p
              className="text-gray-300 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Automatiza tu WhatsApp para vender más y atender mejor.
              Más de 10,000 negocios ya lo usan en África.
            </motion.p>

            {/* Newsletter Signup */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="font-semibold text-white mb-3">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest product updates and industry insights.
              </p>
              <motion.div
                className="flex space-x-2 relative"
                animate={isNewsletterFocused ? {
                  boxShadow: '0 0 20px rgba(250, 204, 21, 0.2)'
                } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsNewsletterFocused(true)}
                    onBlur={() => setIsNewsletterFocused(false)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400 transition-all duration-300"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: isNewsletterFocused ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground flex-shrink-0">
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <Send className="w-4 h-4 relative z-10" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="space-y-3 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { icon: Mail, text: 'hello@whatsappcloud.com' },
                { icon: Phone, text: '+1 (555) 123-4567' },
                { icon: MapPin, text: 'Nairobi, Kenya' }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 text-gray-300 group cursor-pointer"
                  whileHover={{ x: 5, color: '#facc15' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <contact.icon className="w-4 h-4" />
                  </motion.div>
                  <span>{contact.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Links Sections */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Product */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h4 className="font-semibold text-white mb-4 relative">
                  Product
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-yellow-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <motion.a
                        href={link.href}
                        className="text-gray-300 text-sm relative inline-block group"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-yellow-400"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                        <ExternalLink className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Solutions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="font-semibold text-white mb-4 relative">
                  Solutions
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </h4>
                <ul className="space-y-3">
                  {footerLinks.solutions.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <motion.a
                        href={link.href}
                        className="text-gray-300 text-sm relative inline-block group"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                        <ExternalLink className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h4 className="font-semibold text-white mb-4 relative">
                  Resources
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-yellow-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <motion.a
                        href={link.href}
                        className="text-gray-300 text-sm relative inline-block group"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-yellow-400"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                        <ExternalLink className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Company */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h4 className="font-semibold text-white mb-4 relative">
                  Company
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <motion.a
                        href={link.href}
                        className="text-gray-300 text-sm relative inline-block group"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
                          initial={{ width: 0 }}
                          whileHover={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                        <ExternalLink className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright & Legal Links */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <motion.div
              className="text-gray-400 text-sm"
              whileHover={{ color: '#facc15' }}
            >
              © {currentYear} The Kroko Company. All rights reserved.
            </motion.div>
            <div className="flex space-x-6">
              {footerLinks.legal.slice(0, 3).map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 text-sm relative"
                  whileHover={{ y: -2, color: '#facc15' }}
                  transition={{ duration: 0.2 }}
                >
                  {link.name}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-yellow-400"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 text-sm">Follow us</span>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 relative"
                    aria-label={social.name}
                    whileHover={{
                      scale: 1.2,
                      y: -3,
                      color: '#facc15'
                    }}
                    whileTap={{
                      scale: 0.9,
                      rotate: -5
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 2, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <IconComponent className="w-5 h-5 relative z-10" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        className="bg-gray-800 border-t border-gray-700"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center items-center space-x-8 space-y-4">
            {[
              { color: 'green', text: 'Seguridad Garantizada' },
              { color: 'blue', text: 'Privacidad Protegida' },
              { color: 'purple', text: 'Certificado Internacional' },
              { color: 'yellow', text: 'Funciona 24/7' }
            ].map((badge, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2 text-gray-400 text-sm"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className={`w-2 h-2 bg-${badge.color}-500 rounded-full`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}