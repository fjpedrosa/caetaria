import type { Metadata } from 'next';
import { SmoothScrollNav } from '@/components/ui/smooth-scroll-nav';

// Enable ISR with 1 hour cache for legal content
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Terms of Service - WhatsApp Cloud API Platform',
  description: 'Terms and conditions for using our enterprise WhatsApp Cloud API platform. API usage terms, pricing, billing, and service agreements.',
  openGraph: {
    title: 'Terms of Service - WhatsApp Cloud API Platform',
    description: 'Service terms and conditions for our enterprise messaging platform.',
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
  { id: 'introduction', title: 'Introduction and Acceptance' },
  { id: 'service-description', title: 'Service Description' },
  { id: 'account-registration', title: 'Account Registration' },
  { id: 'acceptable-use', title: 'Acceptable Use Policy' },
  { id: 'api-usage-terms', title: 'API Usage Terms' },
  { id: 'whatsapp-compliance', title: 'WhatsApp Business Policy Compliance' },
  { id: 'pricing-billing', title: 'Pricing and Billing Terms' },
  { id: 'data-processing', title: 'Data Processing and Privacy' },
  { id: 'service-availability', title: 'Service Availability and SLA' },
  { id: 'intellectual-property', title: 'Intellectual Property Rights' },
  { id: 'user-responsibilities', title: 'User Responsibilities' },
  { id: 'prohibited-activities', title: 'Prohibited Activities' },
  { id: 'termination', title: 'Account Termination' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'governing-law', title: 'Governing Law and Jurisdiction' },
  { id: 'changes-to-terms', title: 'Changes to Terms' },
  { id: 'contact-information', title: 'Contact Information' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Please read these terms carefully before using our WhatsApp Cloud API Platform.
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction and Acceptance</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Welcome to the WhatsApp Cloud API Platform operated by The Kroko Company ("Company," "we," "us," or "our"). 
                      These Terms of Service ("Terms") govern your access to and use of our platform, including our website, 
                      APIs, and related services (collectively, the "Service").
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. 
                      If you disagree with any part of these terms, you may not access the Service.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 font-medium">
                        Important: These terms constitute a legally binding agreement between you and The Kroko Company.
                      </p>
                    </div>
                  </section>

                  {/* Service Description */}
                  <section id="service-description" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our platform provides enterprise-grade WhatsApp Business API integration services, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                      <li>WhatsApp Business API access and message routing</li>
                      <li>Multi-channel messaging platform (WhatsApp, Telegram, Instagram, Facebook)</li>
                      <li>AI-powered chatbot development and management</li>
                      <li>Advanced analytics and reporting tools</li>
                      <li>Webhook management and API integrations</li>
                      <li>Template message creation and approval services</li>
                      <li>Customer support and technical assistance</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      The Service is provided "as is" and may be modified, updated, or discontinued at our discretion 
                      with appropriate notice to users.
                    </p>
                  </section>

                  {/* Account Registration */}
                  <section id="account-registration" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration</h2>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Eligibility</h3>
                    <p className="text-gray-700 mb-4">To use our Service, you must:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                      <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                      <li>Have the legal authority to enter into this agreement</li>
                      <li>Represent a legitimate business entity</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Security</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>You are responsible for maintaining the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access or security breaches</li>
                      <li>Use strong passwords and enable two-factor authentication when available</li>
                      <li>Do not share your account credentials with unauthorized parties</li>
                    </ul>
                  </section>

                  {/* Acceptable Use Policy */}
                  <section id="acceptable-use" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use Policy</h2>
                    <p className="text-gray-700 mb-4">You agree to use our Service only for lawful purposes and in accordance with:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>All applicable local, national, and international laws</li>
                      <li>WhatsApp's Business Policy and Terms of Service</li>
                      <li>Meta's Community Standards and Platform Policies</li>
                      <li>Industry best practices for business communications</li>
                      <li>Applicable data protection and privacy regulations</li>
                    </ul>
                  </section>

                  {/* API Usage Terms */}
                  <section id="api-usage-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">API Usage Terms</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Rate Limits and Quotas</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>API usage is subject to rate limits based on your subscription plan</li>
                      <li>Excessive usage may result in temporary throttling or suspension</li>
                      <li>Contact us to discuss higher limits for enterprise needs</li>
                      <li>Fair usage policies apply to prevent service abuse</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">API Security</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Protect your API keys and authentication credentials</li>
                      <li>Implement proper error handling and retry mechanisms</li>
                      <li>Use HTTPS for all API communications</li>
                      <li>Report security vulnerabilities responsibly</li>
                    </ul>
                  </section>

                  {/* WhatsApp Compliance */}
                  <section id="whatsapp-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">WhatsApp Business Policy Compliance</h2>
                    <p className="text-gray-700 mb-4">
                      As a WhatsApp Business Solution Provider, you must comply with all WhatsApp policies:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Obtain proper consent before initiating conversations with users</li>
                      <li>Respect user privacy and opt-out requests</li>
                      <li>Use approved message templates for business communications</li>
                      <li>Maintain accurate business information and verification</li>
                      <li>Follow WhatsApp's messaging guidelines and content policies</li>
                      <li>Implement proper customer support and dispute resolution</li>
                    </ul>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-blue-800">
                        <strong>Notice:</strong> Violations of WhatsApp's policies may result in account suspension 
                        or termination by WhatsApp, which is beyond our control.
                      </p>
                    </div>
                  </section>

                  {/* Pricing and Billing */}
                  <section id="pricing-billing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing and Billing Terms</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Subscription Plans</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Subscription fees are billed monthly or annually in advance</li>
                      <li>All prices are in USD unless otherwise specified</li>
                      <li>Local taxes and fees may apply based on your location</li>
                      <li>Price changes will be communicated 30 days in advance</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage-Based Charges</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Message delivery fees as per WhatsApp's pricing structure</li>
                      <li>Additional API calls beyond plan limits</li>
                      <li>Premium feature usage and add-on services</li>
                      <li>Professional services and custom development</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Payment is due immediately upon invoice generation</li>
                      <li>Late payments may incur interest charges and service suspension</li>
                      <li>Disputed charges must be reported within 30 days</li>
                      <li>Refunds are subject to our refund policy</li>
                    </ul>
                  </section>

                  {/* Data Processing */}
                  <section id="data-processing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Processing and Privacy</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our data processing practices are detailed in our Privacy Policy. By using the Service, you acknowledge:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>We process data as a controller for our own business purposes</li>
                      <li>We act as a processor for customer message data</li>
                      <li>Data transfers comply with applicable privacy laws</li>
                      <li>You are responsible for obtaining necessary consents from your customers</li>
                      <li>Data retention policies apply as outlined in our Privacy Policy</li>
                    </ul>
                  </section>

                  {/* Service Availability */}
                  <section id="service-availability" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability and SLA</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Uptime Commitment</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>We strive for 99.9% uptime for our core API services</li>
                      <li>Scheduled maintenance windows will be announced in advance</li>
                      <li>Service credits may be available for significant outages</li>
                      <li>Third-party service dependencies may affect availability</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitations</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>WhatsApp platform availability is beyond our control</li>
                      <li>Network connectivity issues may affect service delivery</li>
                      <li>Force majeure events may cause service interruptions</li>
                      <li>Emergency maintenance may be performed without notice</li>
                    </ul>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual-property" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Rights</h3>
                    <p className="text-gray-700 mb-4">
                      All rights, title, and interest in our platform, including software, documentation, 
                      and related materials, remain our exclusive property.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>You retain ownership of your content and data</li>
                      <li>Limited license to use our platform per these Terms</li>
                      <li>Right to export your data upon reasonable request</li>
                      <li>License to any feedback provided to us for service improvement</li>
                    </ul>
                  </section>

                  {/* User Responsibilities */}
                  <section id="user-responsibilities" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
                    <p className="text-gray-700 mb-4">As a user of our Service, you are responsible for:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Compliance with all applicable laws and regulations</li>
                      <li>Obtaining necessary permissions for customer communications</li>
                      <li>Maintaining accurate account and business information</li>
                      <li>Implementing appropriate data security measures</li>
                      <li>Monitoring and managing your API usage and costs</li>
                      <li>Providing timely customer support for your end users</li>
                      <li>Reporting any platform abuse or security issues</li>
                    </ul>
                  </section>

                  {/* Prohibited Activities */}
                  <section id="prohibited-activities" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
                    <p className="text-gray-700 mb-4">You may not use our Service for:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Sending spam, unsolicited messages, or illegal content</li>
                      <li>Impersonating others or providing false information</li>
                      <li>Attempting to gain unauthorized access to our systems</li>
                      <li>Violating intellectual property rights</li>
                      <li>Engaging in fraudulent or deceptive practices</li>
                      <li>Distributing malware or harmful code</li>
                      <li>Interfering with the normal operation of our Service</li>
                      <li>Any activities that violate applicable laws</li>
                    </ul>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by You</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>You may cancel your account at any time through your dashboard</li>
                      <li>30-day notice required for enterprise accounts</li>
                      <li>No refunds for prepaid subscription fees</li>
                      <li>Data export available for 30 days after cancellation</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by Us</h3>
                    <p className="text-gray-700 mb-4">We may suspend or terminate your account for:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Violation of these Terms or our policies</li>
                      <li>Non-payment of fees or charges</li>
                      <li>Fraudulent or abusive behavior</li>
                      <li>Legal or regulatory requirements</li>
                      <li>Suspected security breaches</li>
                    </ul>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="limitation-liability" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <p className="text-red-800 font-medium mb-4">IMPORTANT LEGAL NOTICE</p>
                      <p className="text-red-800 leading-relaxed mb-4">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE KROKO COMPANY SHALL NOT BE LIABLE FOR ANY 
                        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT 
                        LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                      </p>
                      <p className="text-red-800 leading-relaxed">
                        OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE 
                        SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
                      </p>
                    </div>
                  </section>

                  {/* Indemnification */}
                  <section id="indemnification" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      You agree to indemnify, defend, and hold harmless The Kroko Company and its officers, 
                      directors, employees, and agents from and against any claims, liabilities, damages, 
                      losses, and expenses arising out of or in any way connected with:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Your use of the Service</li>
                      <li>Your violation of these Terms</li>
                      <li>Your violation of any third-party rights</li>
                      <li>Any content or data you submit through the Service</li>
                      <li>Your business operations and customer communications</li>
                    </ul>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Jurisdiction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      These Terms are governed by and construed in accordance with the laws of [Jurisdiction], 
                      without regard to conflict of law principles. Any disputes arising from these Terms or 
                      your use of the Service shall be resolved through:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Good faith negotiations between the parties</li>
                      <li>Binding arbitration if negotiations fail</li>
                      <li>Courts of [Jurisdiction] for injunctive relief</li>
                    </ul>
                  </section>

                  {/* Changes to Terms */}
                  <section id="changes-to-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We reserve the right to modify these Terms at any time. We will notify you of material 
                      changes through:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                      <li>Email notifications to your registered address</li>
                      <li>Platform notifications in your dashboard</li>
                      <li>Updates posted on our website</li>
                      <li>30-day advance notice for significant changes</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Your continued use of the Service after changes become effective constitutes acceptance 
                      of the updated Terms.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section id="contact-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <p className="text-gray-700 mb-4">
                      For questions about these Terms or our Service, please contact us:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-700 mb-2"><strong>The Kroko Company</strong></p>
                      <p className="text-gray-700 mb-2">Legal Department</p>
                      <p className="text-gray-700 mb-2">Email: legal@thekrokocompany.com</p>
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
