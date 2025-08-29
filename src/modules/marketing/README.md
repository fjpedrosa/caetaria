# Marketing Module

This module implements comprehensive marketing and lead generation functionality following Clean Architecture principles with proper separation of concerns and SOLID principles.

## Architecture Overview

The module is organized into four main layers:

### 1. Domain Layer (`/domain`)
Contains pure business logic with no external dependencies:

- **Entities**: `Lead` - Core business objects representing potential customers
- **Value Objects**: `Email`, `PhoneNumber` - Immutable objects with validation rules
- **Repositories**: `LeadRepository` - Abstract interface for lead data operations

**Key Features**:
- Lead entity with comprehensive validation and business rules
- International phone number support with country codes
- Email validation with domain verification
- Lead status management (new, contacted, qualified, converted)
- Lead source tracking (organic, paid, referral, social)
- GDPR compliance with consent management

### 2. Application Layer (`/application`)
Orchestrates business logic and defines contracts:

- **Use Cases**: `SubmitLeadForm`, `GetLandingAnalytics`
- **Ports**: Service interfaces for analytics and notifications

**Key Features**:
- Lead form submission with comprehensive validation
- Duplicate lead detection and handling
- Automatic lead scoring and qualification
- Landing page analytics and conversion tracking
- Lead nurturing workflow triggers
- Real-time notifications for new leads

### 3. Infrastructure Layer (`/infra`)
Handles external dependencies and technical concerns:

- **Services**: `marketing-api.service.ts` - RTK Query API integration
- **Adapters**: Repository implementations and external service integrations
- **Integrations**: Email notifications and analytics services

**Key Features**:
- Supabase integration for lead storage
- Email notification service (SMTP/SendGrid/Mailgun)
- Google Analytics and marketing automation integration
- Lead validation with external services
- CRM system synchronization
- Marketing campaign attribution

### 4. UI Layer (`/ui`)
React components for marketing interface:

- **Components**: Landing page sections, forms, and widgets
- **Pages**: Template pages for different marketing campaigns
- **Widgets**: Interactive marketing components

**Key Features**:
- Responsive hero sections with A/B testing support
- Lead capture forms with real-time validation
- Pricing cards with currency localization
- Testimonial carousels with dynamic content
- Feature comparison grids
- Interactive demo widgets for WhatsApp integration

## Usage Examples

### Basic Lead Capture Form

```tsx
import { LeadCaptureForm } from './modules/marketing';

export function HomePage() {
  const handleLeadSubmit = (leadData: LeadFormData) => {
    console.log('New lead captured:', leadData);
  };

  return (
    <div className="container mx-auto py-12">
      <LeadCaptureForm 
        onSubmit={handleLeadSubmit}
        source="homepage-hero"
        campaign="summer-2024"
        showPhoneNumber={true}
        showCompanyName={true}
      />
    </div>
  );
}
```

### Complete Landing Page

```tsx
import { 
  HeroSection,
  FeaturesGrid,
  PricingCards,
  TestimonialCarousel,
  LeadCaptureForm,
  LandingFooter
} from './modules/marketing';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection
        title="Build WhatsApp Bots in Minutes"
        subtitle="No code required. Powerful automation. African market focus."
        ctaText="Start Free Trial"
        backgroundVideo="/hero-demo.mp4"
      />
      
      <FeaturesGrid
        features={[
          {
            title: "Multi-Channel Support",
            description: "WhatsApp, Telegram, Instagram, Facebook",
            icon: "MessageSquare"
          },
          {
            title: "African Currencies",
            description: "Support for 17 local currencies",
            icon: "Banknote"
          }
        ]}
      />
      
      <PricingCards
        plans={pricingPlans}
        showComparison={true}
        highlightPopular={true}
      />
      
      <TestimonialCarousel
        testimonials={testimonials}
        autoplay={true}
        showCompanyLogos={true}
      />
      
      <LandingFooter
        companyInfo={companyData}
        socialLinks={socialMedia}
        showNewsletter={true}
      />
    </div>
  );
}
```

### Advanced Marketing Widgets

```tsx
import { 
  WhatsAppDemoWidget,
  ApiPlaygroundWidget,
  MetricsCounter
} from './modules/marketing';

export function InteractiveLanding() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <WhatsAppDemoWidget
              businessName="Your Business"
              welcomeMessage="Hello! How can I help you today?"
              sampleConversation={demoConversation}
              showTyping={true}
            />
          </div>
          
          <div>
            <ApiPlaygroundWidget
              endpoint="/api/messages/send"
              method="POST"
              samplePayload={whatsappMessagePayload}
              showResponse={true}
            />
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <MetricsCounter
            metrics={[
              { value: 10000, label: "Messages Sent", suffix: "+" },
              { value: 500, label: "Active Businesses", suffix: "+" },
              { value: 17, label: "Countries Supported" },
              { value: 99.9, label: "Uptime", suffix: "%" }
            ]}
            animationDelay={1000}
          />
        </div>
      </div>
    </section>
  );
}
```

### Direct Use Case Usage

```tsx
import { 
  SubmitLeadFormUseCase,
  GetLandingAnalyticsUseCase,
  SupabaseLeadRepository 
} from './modules/marketing';

// In a service or API route
const leadRepository = new SupabaseLeadRepository();
const submitLead = new SubmitLeadFormUseCase(
  leadRepository,
  notificationService,
  analyticsService
);

const result = await submitLead.execute({
  email: "customer@example.com",
  phoneNumber: "+234901234567",
  firstName: "John",
  lastName: "Doe",
  companyName: "Acme Corp",
  source: "homepage-hero",
  campaign: "launch-week",
  consent: {
    marketing: true,
    analytics: true
  }
});

if (result.isSuccess()) {
  const lead = result.getValue();
  console.log('Lead created:', lead.id);
}
```

### Analytics Integration

```tsx
import { useAnalytics } from './modules/analytics';
import { CTASection } from './modules/marketing';

export function TrackedCTASection() {
  const { trackEvent, trackConversion } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('cta_clicked', {
      section: 'hero',
      text: 'Start Free Trial',
      position: 'primary'
    });
  };

  const handleLeadSubmit = (leadData: any) => {
    trackConversion('lead_generated', {
      source: leadData.source,
      campaign: leadData.campaign,
      value: 100 // Lead value in cents
    });
  };

  return (
    <CTASection
      title="Ready to Get Started?"
      subtitle="Join thousands of businesses automating with WhatsApp"
      ctaText="Start Free Trial"
      onCTAClick={handleCTAClick}
      onLeadCapture={handleLeadSubmit}
    />
  );
}
```

## Domain Entities

### Lead Entity

```typescript
class Lead {
  constructor(
    public id: LeadId,
    public email: Email,
    public firstName: string,
    public lastName: string,
    public phoneNumber?: PhoneNumber,
    public companyName?: string,
    public source: LeadSource = LeadSource.ORGANIC,
    public status: LeadStatus = LeadStatus.NEW,
    public createdAt: Date = new Date(),
    public consent: ConsentData = { marketing: false, analytics: false }
  ) {}

  // Business methods
  qualify(): void
  markAsContacted(): void
  updateSource(source: LeadSource): void
  addNote(note: string): void
  calculateScore(): number
  isQualified(): boolean
}
```

### Value Objects

```typescript
// Email value object with validation
class Email {
  constructor(private value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !this.isDisposableEmail(email);
  }

  getValue(): string { return this.value; }
}

// Phone number with international support
class PhoneNumber {
  constructor(
    private number: string,
    private countryCode: string = '+1'
  ) {
    if (!this.isValid()) {
      throw new InvalidPhoneNumberError(number);
    }
  }

  private isValid(): boolean {
    // E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(this.getFullNumber());
  }

  getFullNumber(): string {
    return `${this.countryCode}${this.number}`;
  }
}
```

## Use Cases

### Submit Lead Form Use Case

```typescript
class SubmitLeadFormUseCase {
  constructor(
    private leadRepository: LeadRepository,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}

  async execute(request: SubmitLeadFormRequest): Promise<Result<Lead>> {
    try {
      // 1. Validate input data
      const email = new Email(request.email);
      const phoneNumber = request.phoneNumber 
        ? new PhoneNumber(request.phoneNumber)
        : undefined;

      // 2. Check for duplicate leads
      const existingLead = await this.leadRepository.findByEmail(email);
      if (existingLead) {
        return Result.failure(new DuplicateLeadError(email.getValue()));
      }

      // 3. Create lead entity
      const lead = new Lead(
        LeadId.generate(),
        email,
        request.firstName,
        request.lastName,
        phoneNumber,
        request.companyName,
        request.source,
        LeadStatus.NEW,
        new Date(),
        request.consent
      );

      // 4. Save to repository
      await this.leadRepository.save(lead);

      // 5. Send notifications
      await this.notificationService.notifyNewLead(lead);

      // 6. Track analytics
      await this.analyticsService.trackConversion('lead_generated', {
        source: lead.source,
        hasPhoneNumber: !!phoneNumber,
        hasCompanyName: !!request.companyName
      });

      return Result.success(lead);
    } catch (error) {
      return Result.failure(error as Error);
    }
  }
}
```

### Get Landing Analytics Use Case

```typescript
class GetLandingAnalyticsUseCase {
  constructor(private analyticsService: AnalyticsService) {}

  async execute(request: GetAnalyticsRequest): Promise<Result<LandingAnalytics>> {
    try {
      const analytics = await this.analyticsService.getLandingMetrics({
        startDate: request.startDate,
        endDate: request.endDate,
        source: request.source
      });

      return Result.success({
        pageViews: analytics.pageViews,
        uniqueVisitors: analytics.uniqueVisitors,
        conversionRate: analytics.conversionRate,
        leadCount: analytics.leadCount,
        bounceRate: analytics.bounceRate,
        averageTimeOnPage: analytics.averageTimeOnPage,
        topSources: analytics.topSources,
        topPages: analytics.topPages
      });
    } catch (error) {
      return Result.failure(error as Error);
    }
  }
}
```

## API Endpoints

The module expects the following API endpoints:

### Lead Management
- `POST /api/marketing/leads` - Submit new lead
- `GET /api/marketing/leads` - Get leads with filtering
- `GET /api/marketing/leads/:id` - Get specific lead
- `PUT /api/marketing/leads/:id` - Update lead information
- `DELETE /api/marketing/leads/:id` - Delete lead (GDPR)
- `POST /api/marketing/leads/:id/qualify` - Mark lead as qualified

### Analytics
- `GET /api/marketing/analytics/landing` - Get landing page analytics
- `GET /api/marketing/analytics/conversion` - Get conversion funnel data
- `GET /api/marketing/analytics/sources` - Get lead source analytics
- `POST /api/marketing/analytics/event` - Track marketing events

### Campaign Management
- `GET /api/marketing/campaigns` - Get active campaigns
- `GET /api/marketing/campaigns/:id/stats` - Get campaign statistics
- `POST /api/marketing/campaigns/:id/leads` - Get campaign leads

## Lead Sources

The module supports comprehensive lead source tracking:

### Organic Traffic
- `ORGANIC` - Direct/organic search traffic
- `SEO` - Search engine optimization
- `DIRECT` - Direct URL entry

### Paid Advertising
- `GOOGLE_ADS` - Google Ads campaigns
- `FACEBOOK_ADS` - Facebook/Instagram ads
- `LINKEDIN_ADS` - LinkedIn advertising
- `TWITTER_ADS` - Twitter/X advertising

### Social Media
- `SOCIAL_ORGANIC` - Organic social media
- `SOCIAL_PAID` - Paid social media
- `INFLUENCER` - Influencer marketing

### Referral & Partnership
- `REFERRAL` - Customer referrals
- `PARTNER` - Partner referrals
- `AFFILIATE` - Affiliate marketing

### Content Marketing
- `CONTENT` - Blog posts and articles
- `WEBINAR` - Webinar attendees
- `EBOOK` - Downloadable content
- `EMAIL` - Email marketing

### Event Marketing
- `EVENT` - Physical events
- `CONFERENCE` - Industry conferences
- `TRADE_SHOW` - Trade shows

## Lead Status Management

### Status Progression
1. **NEW** - Recently submitted lead
2. **CONTACTED** - Initial contact made
3. **QUALIFIED** - Meets qualification criteria
4. **NURTURING** - In nurturing sequence
5. **OPPORTUNITY** - Sales opportunity
6. **CONVERTED** - Became customer
7. **LOST** - Did not convert

### Qualification Criteria
- Valid email and phone number
- Company information provided
- Budget requirements met
- Timeline matches offering
- Decision-making authority confirmed

## A/B Testing Support

### Hero Section Testing
```tsx
import { HeroSection } from './modules/marketing';

export function ABTestHero() {
  const variant = useABTest('hero-cta-text', {
    'Start Free Trial': 0.5,
    'Get Started Now': 0.5
  });

  return (
    <HeroSection
      title="Build WhatsApp Bots in Minutes"
      ctaText={variant}
      onCTAClick={() => trackABTestConversion('hero-cta-text', variant)}
    />
  );
}
```

### Form Field Testing
```tsx
import { LeadCaptureForm } from './modules/marketing';

export function ABTestForm() {
  const showCompanyField = useABTest('company-field', {
    'show': 0.5,
    'hide': 0.5
  });

  return (
    <LeadCaptureForm
      showCompanyName={showCompanyField === 'show'}
      onSubmit={(data) => trackABTestConversion('company-field', showCompanyField)}
    />
  );
}
```

## Multi-Language Support

### Internationalization Setup
```tsx
import { useTranslation } from 'next-i18next';
import { HeroSection } from './modules/marketing';

export function LocalizedHero() {
  const { t } = useTranslation('marketing');

  return (
    <HeroSection
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      ctaText={t('hero.cta')}
    />
  );
}
```

### Currency Localization
```tsx
import { PricingCards } from './modules/marketing';
import { useLocalization } from './hooks/use-localization';

export function LocalizedPricing() {
  const { currency, formatPrice } = useLocalization();

  return (
    <PricingCards
      currency={currency}
      formatPrice={formatPrice}
      showLocalPaymentMethods={true}
    />
  );
}
```

## Performance Optimization

### Component Lazy Loading
```tsx
import { lazy, Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui';

const HeavyTestimonialCarousel = lazy(() => 
  import('./ui/components/testimonial-carousel')
);

export function OptimizedLanding() {
  return (
    <div>
      <HeroSection /> {/* Critical above-fold content */}
      
      <Suspense fallback={<LoadingSkeleton />}>
        <HeavyTestimonialCarousel testimonials={testimonials} />
      </Suspense>
    </div>
  );
}
```

### Image Optimization
```tsx
import { OptimizedImage } from '@/lib/image-optimization';

export function HeroSection() {
  return (
    <section className="relative">
      <OptimizedImage
        src="/hero-bg.jpg"
        alt="Hero background"
        priority={true}
        sizes="100vw"
        quality={90}
      />
    </section>
  );
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('SubmitLeadFormUseCase', () => {
  it('should create lead with valid data', async () => {
    const useCase = new SubmitLeadFormUseCase(
      mockLeadRepository,
      mockNotificationService,
      mockAnalyticsService
    );

    const result = await useCase.execute({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      source: LeadSource.ORGANIC
    });

    expect(result.isSuccess()).toBe(true);
    expect(mockLeadRepository.save).toHaveBeenCalled();
  });

  it('should handle duplicate email error', async () => {
    mockLeadRepository.findByEmail.mockResolvedValue(existingLead);

    const result = await useCase.execute(validRequest);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(DuplicateLeadError);
  });
});
```

### Integration Tests
```typescript
describe('Lead API Integration', () => {
  it('should submit lead through API', async () => {
    const response = await fetch('/api/marketing/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validLeadData)
    });

    expect(response.status).toBe(201);
    const lead = await response.json();
    expect(lead.id).toBeDefined();
  });
});
```

## Dependencies

### External Dependencies
- `@reduxjs/toolkit` - State management and RTK Query
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `react` - UI components

### Internal Dependencies
- `components/ui/*` - shadcn/ui components
- `modules/analytics` - Event tracking
- `modules/shared` - Common domain objects
- `store/api/base-api` - Base API configuration

## Configuration Options

### Lead Capture Configuration
```typescript
{
  enablePhoneValidation: true,    // Validate phone numbers
  enableDuplicateCheck: true,     // Check for duplicate emails
  enableCompanyEnrichment: false, // Enrich company data
  enableLeadScoring: true,        // Calculate lead scores
  autoQualification: false,       // Auto-qualify leads
  enableGDPRConsent: true,        // Show consent checkboxes
}
```

### Analytics Configuration
```typescript
{
  trackPageViews: true,           // Track page views
  trackFormInteractions: true,    // Track form field interactions
  trackScrollDepth: true,         // Track scroll behavior
  enableHeatmaps: false,          // Enable heatmap tracking
  enableSessionRecording: false,  // Record user sessions
}
```

## Future Enhancements

- Advanced lead scoring with machine learning
- CRM integrations (Salesforce, HubSpot, Pipedrive)
- Marketing automation workflows
- Advanced A/B testing framework
- Personalization engine
- Chatbot integration for lead qualification
- WhatsApp Business API lead capture
- Voice message support
- Video testimonials and demos
- Advanced landing page builder