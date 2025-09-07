import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { industriesV1 as industries } from '@/modules/solutions/domain/industries-data-v2';
import { IndustryDetailPage } from '@/modules/solutions/presentation/pages/industry-detail-page';

interface Props {
  params: {
    slug: string;
  };
}

// Generate static params for all industries
export async function generateStaticParams() {
  return industries.map((industry) => ({
    slug: industry.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const industry = industries.find((i) => i.slug === params.slug);

  if (!industry) {
    return {
      title: 'Industria no encontrada',
    };
  }

  return {
    title: `WhatsApp Business para ${industry.name} | Neptunik`,
    description: `${industry.description}. Automatiza tu comunicación y aumenta tus ventas con WhatsApp Business específico para ${industry.name.toLowerCase()}.`,
    keywords: [
      `whatsapp ${industry.name.toLowerCase()}`,
      `whatsapp business ${industry.name.toLowerCase()}`,
      `automatización ${industry.name.toLowerCase()}`,
      `chatbot ${industry.name.toLowerCase()}`,
      'whatsapp api',
      'neptunik',
    ],
    openGraph: {
      title: `WhatsApp Business para ${industry.name} | Neptunik`,
      description: industry.description,
      type: 'website',
      url: `https://neptunik.com/soluciones/industrias/${industry.slug}`,
      images: [
        {
          url: industry.heroImage || '/og-image-default.jpg',
          width: 1200,
          height: 630,
          alt: `WhatsApp Business para ${industry.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `WhatsApp Business para ${industry.name}`,
      description: industry.description,
      images: [industry.heroImage || '/og-image-default.jpg'],
    },
  };
}

export default function IndustryPageRoute({ params }: Props) {
  const industry = industries.find((i) => i.slug === params.slug);

  if (!industry) {
    notFound();
  }

  return <IndustryDetailPage industry={industry} />;
}