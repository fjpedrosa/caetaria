import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Users} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MARKETING_COPY } from '@/modules/marketing/domain/copy';

import { LeadCaptureForm } from './lead-capture-form';

/**
 * CTA Section Component - Server Component
 *
 * Strategic call-to-action section with lead capture form
 * and compelling conversion elements.
 */
export async function CtaSection() {
  const { badge, title, titleHighlight, description, benefits, urgency, socialProof, form, floatingBadges, stats, alternativeCta } = MARKETING_COPY.ctaSection;

  return (
    <section className="py-20 bg-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border border-white rounded-full" />
        <div className="absolute bottom-10 left-1/3 w-40 h-40 border border-white rounded-full" />
        <div className="absolute bottom-20 right-10 w-28 h-28 border border-white rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-white">
            {/* Badge */}
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30 px-4 py-2 mb-6">
              ✨ {badge}
            </Badge>

            {/* Main Heading */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {title}
              <span className="block text-primary">
                {titleHighlight}
              </span>
            </h2>

            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Clock, text: benefits[0].text },
                { icon: MessageSquare, text: benefits[1].text },
                { icon: Users, text: benefits[2].text },
                { icon: Sparkles, text: benefits[3].text }
              ].map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Urgency Elements */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-white font-semibold">{urgency.title}</span>
              </div>
              <div className="text-white/80 text-sm">
                🔥 <strong className="text-white">{urgency.description}</strong>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-white/70">
              {socialProof.map((proof, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>{proof.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Lead Capture Form */}
          <div className="relative">
            {/* Form Container with Glow Effect */}
            <div className="relative">
              {/* Glow Background */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl opacity-30 animate-pulse" />

              {/* Form */}
              <div className="relative">
                <LeadCaptureForm
                  source="pricing-inquiry"
                  title={form.title}
                  description={form.description}
                  variant="default"
                  className="backdrop-blur-sm bg-white/95 border border-white/20 shadow-2xl"
                />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm animate-bounce">
              🎆 {floatingBadges.discount}
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white text-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              ✅ {floatingBadges.trust}
            </div>
          </div>
        </div>

        {/* Bottom Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-white/70 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Alternative CTA */}
        <div className="text-center mt-12">
          <p className="text-white/80 mb-4">
            {alternativeCta.text}
          </p>
          <Button
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-secondary px-8 py-3 font-semibold transition-all duration-200 group"
          >
            {alternativeCta.button}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}