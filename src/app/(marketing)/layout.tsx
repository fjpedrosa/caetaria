import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'WhatsApp Cloud API Platform | Enterprise Messaging Solution',
    template: '%s | WhatsApp Cloud API Platform'
  },
  description: 'Transform your business communication with WhatsApp Cloud API. Multi-channel bot platform, AI-powered customer support, and enterprise-grade messaging solutions for African markets.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
