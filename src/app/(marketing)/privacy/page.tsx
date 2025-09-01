import type { Metadata } from 'next';

import { SmoothScrollNav } from '@/modules/shared/ui/components/ui/smooth-scroll-nav';

// Enable ISR with 1 hour cache for legal content
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Privacy Policy - WhatsApp Cloud API Platform',
  description: 'Learn how we collect, use, and protect your data on our WhatsApp Cloud API platform. GDPR, POPIA, and NDPR compliant privacy practices.',
  openGraph: {
    title: 'Privacy Policy - WhatsApp Cloud API Platform',
    description: 'Transparent privacy practices for our enterprise messaging platform.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = 'January 15, 2025';

interface TableOfContentsItem {
  id: string;
  title: string;
  subsections?: { id: string; title: string; }[];
}

const tableOfContents: TableOfContentsItem[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-information', title: 'How We Use Your Information' },
  { id: 'whatsapp-compliance', title: 'WhatsApp Business API Compliance' },
  { id: 'data-sharing', title: 'Data Sharing and Disclosure' },
  { id: 'international-transfers', title: 'International Data Transfers' },
  { id: 'gdpr-compliance', title: 'GDPR Compliance (European Users)' },
  { id: 'popia-compliance', title: 'POPIA Compliance (South African Users)' },
  { id: 'ndpr-compliance', title: 'NDPR Compliance (Nigerian Users)' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'your-rights', title: 'Your Rights and Choices' },
  { id: 'cookies', title: 'Cookies and Tracking Technologies' },
  { id: 'children-privacy', title: 'Children\'s Privacy' },
  { id: 'changes-to-policy', title: 'Changes to This Policy' },
  { id: 'contact-us', title: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              We are committed to protecting your privacy and ensuring transparency in how we handle your data.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: <time dateTime="2025-01-15">{LAST_UPDATED}</time>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents */}
              <aside className="lg:col-span-1">
                <SmoothScrollNav items={tableOfContents} />
              </aside>

              {/* Content */}
              <main className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 prose prose-lg max-w-none">

                  {/* Introduction */}
                  <section id="introduction" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Welcome to the WhatsApp Cloud API Platform ("Platform," "Service," "we," "us," or "our").
                      This Privacy Policy explains how The Kroko Company and its affiliates collect, use, disclose,
                      and safeguard your information when you use our WhatsApp Cloud API Platform and related services.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      We are committed to compliance with applicable data protection laws, including the General Data
                      Protection Regulation (GDPR), South Africa's Protection of Personal Information Act (POPIA),
                      and Nigeria's National Data Protection Regulation (NDPR).
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section id="information-we-collect" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Information</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Business name, contact information, and billing details</li>
                      <li>WhatsApp Business Account credentials and phone numbers</li>
                      <li>User account credentials and authentication data</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Message Data</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>WhatsApp messages sent and received through our platform</li>
                      <li>Message metadata (timestamps, delivery status, sender/recipient information)</li>
                      <li>Media files shared through the messaging service</li>
                      <li>Bot interaction logs and conversation history</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Information</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>IP addresses, device information, and browser types</li>
                      <li>API usage logs and webhook event data</li>
                      <li>Performance metrics and system analytics</li>
                      <li>Error logs and debugging information</li>
                    </ul>
                  </section>

                  {/* How We Use Information */}
                  <section id="how-we-use-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                    <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Providing and maintaining our WhatsApp Cloud API services</li>
                      <li>Processing and routing messages between you and your customers</li>
                      <li>Generating analytics and performance reports</li>
                      <li>Billing and payment processing</li>
                      <li>Customer support and technical assistance</li>
                      <li>Improving our services and developing new features</li>
                      <li>Ensuring platform security and preventing fraud</li>
                      <li>Complying with legal obligations and regulatory requirements</li>
                    </ul>
                  </section>

                  {/* WhatsApp Compliance */}
                  <section id="whatsapp-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">WhatsApp Business API Compliance</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      As a WhatsApp Business Solution Provider, we adhere to WhatsApp's Business Policy and
                      data handling requirements:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Messages are processed according to WhatsApp's encryption standards</li>
                      <li>We do not store message content longer than necessary for service delivery</li>
                      <li>Customer opt-in consent is required before initiating conversations</li>
                      <li>We maintain audit trails for compliance monitoring</li>
                      <li>All message templates comply with WhatsApp's approval process</li>
                    </ul>
                  </section>

                  {/* Data Sharing */}
                  <section id="data-sharing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
                    <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Service Providers:</strong> Third-party vendors who assist in service delivery</li>
                      <li><strong>WhatsApp/Meta:</strong> As required for WhatsApp Business API functionality</li>
                      <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
                      <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                      <li><strong>Consent:</strong> When you have given explicit consent</li>
                    </ul>
                  </section>

                  {/* International Transfers */}
                  <section id="international-transfers" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Your data may be transferred to and processed in countries outside your region.
                      We ensure appropriate safeguards are in place, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Standard Contractual Clauses for EU data transfers</li>
                      <li>Adequacy decisions where applicable</li>
                      <li>Binding Corporate Rules for intra-group transfers</li>
                      <li>Certification schemes and codes of conduct</li>
                    </ul>
                  </section>

                  {/* GDPR Compliance */}
                  <section id="gdpr-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">GDPR Compliance (European Users)</h2>
                    <p className="text-gray-700 mb-4">For users in the European Economic Area, you have the following rights:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                      <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                      <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                      <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                      <li><strong>Right to Data Portability:</strong> Transfer your data to another service</li>
                      <li><strong>Right to Object:</strong> Oppose certain types of processing</li>
                    </ul>
                  </section>

                  {/* POPIA Compliance */}
                  <section id="popia-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">POPIA Compliance (South African Users)</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We comply with South Africa's Protection of Personal Information Act (POPIA).
                      South African users have rights similar to GDPR, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Right to access and correct personal information</li>
                      <li>Right to delete or destroy personal information</li>
                      <li>Right to object to processing</li>
                      <li>Right to lodge complaints with the Information Regulator</li>
                    </ul>
                  </section>

                  {/* NDPR Compliance */}
                  <section id="ndpr-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">NDPR Compliance (Nigerian Users)</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We adhere to Nigeria's National Data Protection Regulation (NDPR). Nigerian users have:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Right to information about data processing</li>
                      <li>Right to access and rectify personal data</li>
                      <li>Right to withdraw consent</li>
                      <li>Right to data portability</li>
                      <li>Right to lodge complaints with NITDA</li>
                    </ul>
                  </section>

                  {/* Data Security */}
                  <section id="data-security" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>End-to-end encryption for message transmission</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Access controls and employee training</li>
                      <li>Secure data centers with 24/7 monitoring</li>
                      <li>Incident response procedures and breach notification</li>
                    </ul>
                  </section>

                  {/* Data Retention */}
                  <section id="data-retention" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We retain your information only as long as necessary for the purposes described in this policy:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Account Data:</strong> Retained for the duration of your account plus 7 years for legal compliance</li>
                      <li><strong>Message Data:</strong> Automatically deleted after 30 days unless required for dispute resolution</li>
                      <li><strong>Analytics Data:</strong> Aggregated data retained for 2 years for service improvement</li>
                      <li><strong>Legal Data:</strong> Retained as required by applicable laws and regulations</li>
                    </ul>
                  </section>

                  {/* Your Rights */}
                  <section id="your-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
                    <p className="text-gray-700 mb-4">You can exercise your privacy rights through:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Account settings in your dashboard</li>
                      <li>Contacting our Data Protection Officer at privacy@thekrokocompany.com</li>
                      <li>Using our automated data request system</li>
                      <li>Contacting customer support for assistance</li>
                    </ul>
                  </section>

                  {/* Cookies */}
                  <section id="cookies" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We use cookies and similar technologies to improve your experience:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand platform usage</li>
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                      <li><strong>Marketing Cookies:</strong> Used for relevant advertising (opt-in only)</li>
                    </ul>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children-privacy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Our services are not intended for individuals under 18 years of age. We do not knowingly
                      collect personal information from children. If you believe we have inadvertently collected
                      information from a child, please contact us immediately.
                    </p>
                  </section>

                  {/* Changes to Policy */}
                  <section id="changes-to-policy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
                    <p className="text-gray-700 leading-relaxed">
                      We may update this Privacy Policy periodically. We will notify you of material changes
                      through email, platform notifications, or by posting the updated policy on our website.
                      Your continued use of our services constitutes acceptance of the updated policy.
                    </p>
                  </section>

                  {/* Contact Us */}
                  <section id="contact-us" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                    <p className="text-gray-700 mb-4">
                      If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-700 mb-2"><strong>Data Protection Officer</strong></p>
                      <p className="text-gray-700 mb-2">Email: privacy@thekrokocompany.com</p>
                      <p className="text-gray-700 mb-2">Address: [Business Address]</p>
                      <p className="text-gray-700">Phone: [Contact Number]</p>
                    </div>
                  </section>

                </div>
              </main>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
