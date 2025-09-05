/**
 * Campaign Layout
 * Next.js App Router layout for campaign pages
 * Includes campaign-specific tracking and analytics
 */

import { Metadata } from 'next';
import Script from 'next/script';

import { CampaignTracker } from '@/modules/marketing/presentation/components/campaign-tracker';
import { CampaignProvider } from '@/modules/marketing/presentation/providers/campaign-provider';

export const metadata: Metadata = {
  title: {
    template: '%s | Neptunik Campaign',
    default: 'WhatsApp Automation for Business | Neptunik',
  },
  description: 'Transform your WhatsApp into a powerful business tool with automated conversations, AI-powered responses, and seamless customer management.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Neptunik',
    title: 'WhatsApp Business Automation Platform',
    description: 'Automate WhatsApp conversations and increase your sales by 30% with Neptunik\'s AI-powered platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Business Automation Platform',
    description: 'Automate WhatsApp conversations and increase your sales by 30%.',
  },
};

interface CampaignLayoutProps {
  children: React.ReactNode;
}

export default function CampaignLayout({ children }: CampaignLayoutProps) {
  return (
    <CampaignProvider>
      <div className="campaign-layout">
        {/* Campaign-specific tracking */}
        <CampaignTracker />

        {/* Google Analytics Enhanced Ecommerce */}
        <Script
          id="gtag-campaign-config"
          strategy="afterInteractive"
        >
          {`
            // Enhanced ecommerce for campaign tracking
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              send_page_view: false,
              enhanced_ecommerce: true,
              custom_map: {
                'custom_parameter_1': 'campaign_source',
                'custom_parameter_2': 'campaign_medium',
                'custom_parameter_3': 'campaign_name'
              }
            });

            // Campaign-specific events setup
            window.campaignConfig = {
              trackingEnabled: true,
              leadScoring: true,
              conversionGoals: {
                form_submit: { value: 1, currency: 'EUR' },
                demo_request: { value: 5, currency: 'EUR' },
                signup_complete: { value: 10, currency: 'EUR' }
              }
            };
          `}
        </Script>

        {/* Facebook Pixel Enhanced */}
        <Script
          id="facebook-pixel-campaign"
          strategy="afterInteractive"
        >
          {`
            if (typeof fbq !== 'undefined') {
              // Enhanced conversion tracking for campaigns
              fbq('track', 'PageView');
              
              // Custom events for lead qualification
              window.trackCampaignEvent = function(eventName, data) {
                fbq('trackCustom', eventName, data);
                
                // Also send to Google Analytics
                if (typeof gtag !== 'undefined') {
                  gtag('event', eventName, {
                    event_category: 'campaign',
                    ...data
                  });
                }
              };
            }
          `}
        </Script>

        {/* LinkedIn Insight Tag */}
        <Script
          id="linkedin-insight"
          strategy="afterInteractive"
        >
          {`
            // LinkedIn campaign tracking
            if (typeof _linkedin_data_partner_id !== 'undefined') {
              window._linkedin_data_partner_id = "${process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID}";
              
              (function(){
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";
                b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
              })();
            }
          `}
        </Script>

        <main className="campaign-content">
          {children}
        </main>
      </div>
    </CampaignProvider>
  );
}