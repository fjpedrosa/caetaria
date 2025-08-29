# Onboarding Module

This module implements comprehensive user onboarding functionality for WhatsApp Cloud API integration following Clean Architecture principles with proper separation of concerns and SOLID principles.

## Architecture Overview

The module is organized into four main layers:

### 1. Domain Layer (`/domain`)
Contains pure business logic with no external dependencies:

- **Entities**: `OnboardingSession` - Core onboarding process management
- **Value Objects**: `BusinessInfo`, `OnboardingStepData`, `WhatsAppConfig` - Immutable business concepts
- **Repositories**: Abstract interfaces for data operations

**Key Features**:
- Complete onboarding session lifecycle management
- Business information validation and storage
- WhatsApp Cloud API configuration management
- Multi-step progress tracking with validation
- Phone number verification with international support
- Bot configuration with templates and custom responses

### 2. Application Layer (`/application`)
Orchestrates business logic and defines contracts:

- **Use Cases**: 
  - `StartOnboarding` - Initialize user onboarding journey
  - `SubmitBusinessInfo` - Collect and validate business information
  - `VerifyPhoneNumber` - WhatsApp Business phone verification
  - `ConfigureWhatsAppIntegration` - Set up Cloud API connection
  - `ConfigureBot` - Set up bot behavior and responses
  - `TestBot` - Validate bot configuration
  - `CompleteOnboarding` - Finalize setup process

- **Ports**: Service interfaces for WhatsApp API, SMS verification, and webhooks

**Key Features**:
- Comprehensive step-by-step onboarding orchestration
- Business information validation with external APIs
- WhatsApp Business Account verification
- Automated webhook setup and validation
- Bot template system with customization
- Integration testing and validation
- Progress saving and recovery

### 3. Infrastructure Layer (`/infra`)
Handles external dependencies and technical concerns:

- **Services**: `onboarding-api.service.ts` - RTK Query API integration
- **Adapters**: Repository implementations and external service integrations
- **Integrations**: WhatsApp Cloud API, SMS services, webhook management

**Key Features**:
- WhatsApp Cloud API integration for verification and setup
- SMS/WhatsApp verification service
- Webhook endpoint creation and management
- Business information enrichment services
- Template and asset management
- Progress persistence and recovery

### 4. UI Layer (`/ui`)
React components for onboarding interface:

- **Components**: Step-by-step onboarding forms and validation
- **Widgets**: Interactive components for testing and configuration
- **Pages**: Template pages for each onboarding step

**Key Features**:
- Responsive multi-step onboarding flow
- Real-time validation and error handling
- Interactive bot testing interface
- WhatsApp integration preview
- Progress indicators and step navigation
- Mobile-optimized experience

## Usage Examples

### Complete Onboarding Flow

```tsx
import { 
  OnboardingProvider,
  OnboardingProgress,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function OnboardingApp() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        <OnboardingProgress />
        
        <main className="container mx-auto py-8">
          <OnboardingRouter />
        </main>
      </div>
    </OnboardingProvider>
  );
}

function OnboardingRouter() {
  const { currentStep } = useOnboarding();

  switch (currentStep) {
    case 'business-info':
      return <BusinessInfoStep />;
    case 'phone-verification':
      return <PhoneVerificationStep />;
    case 'whatsapp-integration':
      return <WhatsAppIntegrationStep />;
    case 'bot-setup':
      return <BotSetupStep />;
    case 'testing':
      return <TestingStep />;
    case 'complete':
      return <CompletionStep />;
    default:
      return <OnboardingStart />;
  }
}
```

### Business Information Step

```tsx
import { 
  BusinessInfoForm,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function BusinessInfoStep() {
  const { submitBusinessInfo, isLoading } = useOnboarding();

  const handleSubmit = async (businessData: BusinessInfoData) => {
    try {
      await submitBusinessInfo(businessData);
      // Automatically proceeds to next step on success
    } catch (error) {
      // Handle validation errors
    }
  };

  return (
    <OnboardingStepWrapper
      title="Tell Us About Your Business"
      description="Help us set up your WhatsApp integration"
      step={2}
      totalSteps={6}
    >
      <BusinessInfoForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        showCompanyLogo={true}
        showIndustrySelection={true}
        requireTaxId={false}
      />
    </OnboardingStepWrapper>
  );
}
```

### Phone Verification Step

```tsx
import { 
  PhoneVerificationForm,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function PhoneVerificationStep() {
  const { verifyPhoneNumber, resendCode, isVerifying } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = async () => {
    try {
      await verifyPhoneNumber({
        phoneNumber,
        verificationCode,
        method: 'whatsapp' // or 'sms'
      });
    } catch (error) {
      // Handle verification errors
    }
  };

  return (
    <OnboardingStepWrapper
      title="Verify Your WhatsApp Business Number"
      description="We'll send a verification code to confirm ownership"
      step={3}
      totalSteps={6}
    >
      <PhoneVerificationForm
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onVerify={handleVerify}
        onResendCode={resendCode}
        isVerifying={isVerifying}
        supportedCountries={whatsappSupportedCountries}
      />
    </OnboardingStepWrapper>
  );
}
```

### WhatsApp Integration Step

```tsx
import { 
  WhatsAppIntegrationForm,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function WhatsAppIntegrationStep() {
  const { configureIntegration, testConnection } = useOnboarding();

  const handleIntegrationSubmit = async (integrationData: WhatsAppConfigData) => {
    try {
      await configureIntegration(integrationData);
      
      // Test the connection
      const testResult = await testConnection();
      if (testResult.success) {
        console.log('Integration successful!');
      }
    } catch (error) {
      // Handle integration errors
    }
  };

  return (
    <OnboardingStepWrapper
      title="Connect WhatsApp Cloud API"
      description="Set up your WhatsApp Business API integration"
      step={4}
      totalSteps={6}
    >
      <WhatsAppIntegrationForm
        onSubmit={handleIntegrationSubmit}
        showBusinessAccountId={true}
        showPhoneNumberId={true}
        showWebhookSetup={true}
        autoDetectSettings={true}
      />
    </OnboardingStepWrapper>
  );
}
```

### Bot Configuration Step

```tsx
import { 
  BotConfigurationForm,
  BotTemplateSelector,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function BotSetupStep() {
  const { configureBot, saveBotConfig } = useOnboarding();
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);

  const handleBotConfiguration = async (botConfig: BotConfigData) => {
    try {
      await configureBot({
        template: selectedTemplate,
        customization: botConfig,
        businessContext: businessInfo
      });
    } catch (error) {
      // Handle configuration errors
    }
  };

  return (
    <OnboardingStepWrapper
      title="Configure Your WhatsApp Bot"
      description="Choose a template and customize your bot's behavior"
      step={5}
      totalSteps={6}
    >
      <div className="space-y-8">
        <BotTemplateSelector
          templates={availableTemplates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          showPreview={true}
        />
        
        {selectedTemplate && (
          <BotConfigurationForm
            template={selectedTemplate}
            onSubmit={handleBotConfiguration}
            showAdvancedOptions={true}
            enableCustomResponses={true}
          />
        )}
      </div>
    </OnboardingStepWrapper>
  );
}
```

### Bot Testing Step

```tsx
import { 
  TestConversation,
  OnboardingStepWrapper 
} from './modules/onboarding';

export function TestingStep() {
  const { testBot, completeOnboarding } = useOnboarding();
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleBotTest = async (testMessage: string) => {
    try {
      const response = await testBot({
        message: testMessage,
        fromNumber: verifiedPhoneNumber
      });
      
      setTestResults(prev => [...prev, {
        input: testMessage,
        output: response.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      // Handle testing errors
    }
  };

  const handleCompleteSetup = async () => {
    if (testResults.length > 0) {
      await completeOnboarding();
    }
  };

  return (
    <OnboardingStepWrapper
      title="Test Your WhatsApp Bot"
      description="Send test messages to make sure everything works"
      step={6}
      totalSteps={6}
    >
      <div className="space-y-6">
        <TestConversation
          onSendMessage={handleBotTest}
          testResults={testResults}
          businessName={businessInfo.companyName}
          phoneNumber={verifiedPhoneNumber}
        />
        
        <div className="flex justify-between">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Back to Configuration
          </button>
          
          <button
            onClick={handleCompleteSetup}
            disabled={testResults.length === 0}
            className="btn-primary"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
```

### Direct Use Case Usage

```tsx
import { 
  StartOnboardingUseCase,
  VerifyPhoneNumberUseCase,
  ConfigureWhatsAppIntegrationUseCase,
  OnboardingRepositoryAdapter 
} from './modules/onboarding';

// In a service or API route
const onboardingRepo = new OnboardingRepositoryAdapter();
const whatsappService = new WhatsAppCloudApiService();

const startOnboarding = new StartOnboardingUseCase(onboardingRepo);
const verifyPhone = new VerifyPhoneNumberUseCase(whatsappService, onboardingRepo);

// Start onboarding session
const sessionResult = await startOnboarding.execute({
  userId: 'user_123',
  email: 'user@example.com',
  source: 'landing-page'
});

if (sessionResult.isSuccess()) {
  const session = sessionResult.getValue();
  console.log('Onboarding started:', session.id);
}

// Verify phone number
const verificationResult = await verifyPhone.execute({
  sessionId: session.id,
  phoneNumber: '+1234567890',
  method: 'whatsapp'
});
```

## Domain Entities

### OnboardingSession Entity

```typescript
class OnboardingSession {
  constructor(
    public id: OnboardingSessionId,
    public userId: string,
    public email: string,
    public currentStep: OnboardingStep = OnboardingStep.BUSINESS_INFO,
    public stepData: Map<OnboardingStep, OnboardingStepData> = new Map(),
    public status: OnboardingStatus = OnboardingStatus.IN_PROGRESS,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public completedAt?: Date
  ) {}

  // Business methods
  proceedToStep(step: OnboardingStep): void
  updateStepData(step: OnboardingStep, data: OnboardingStepData): void
  markStepComplete(step: OnboardingStep): void
  complete(): void
  abandon(): void
  canProceedToStep(step: OnboardingStep): boolean
  getProgress(): number
  isComplete(): boolean
}
```

### Value Objects

```typescript
// Business information with validation
class BusinessInfo {
  constructor(
    public companyName: string,
    public industry: string,
    public website?: string,
    public description?: string,
    public logo?: string,
    public address?: Address,
    public taxId?: string
  ) {
    if (!this.isValid()) {
      throw new InvalidBusinessInfoError();
    }
  }

  private isValid(): boolean {
    return this.companyName.length >= 2 && 
           this.industry.length > 0 &&
           (!this.website || this.isValidUrl(this.website));
  }
}

// WhatsApp configuration settings
class WhatsAppConfig {
  constructor(
    public accessToken: string,
    public businessAccountId: string,
    public phoneNumberId: string,
    public webhookUrl: string,
    public webhookVerifyToken: string,
    public displayName?: string,
    public about?: string
  ) {
    if (!this.isValid()) {
      throw new InvalidWhatsAppConfigError();
    }
  }

  private isValid(): boolean {
    return this.accessToken.startsWith('EAA') &&
           this.businessAccountId.length > 0 &&
           this.phoneNumberId.length > 0 &&
           this.isValidWebhookUrl(this.webhookUrl);
  }
}

// Step-specific data storage
class OnboardingStepData {
  constructor(
    public step: OnboardingStep,
    public data: Record<string, any>,
    public isComplete: boolean = false,
    public completedAt?: Date
  ) {}

  markComplete(): void {
    this.isComplete = true;
    this.completedAt = new Date();
  }
}
```

## Use Cases

### Start Onboarding Use Case

```typescript
class StartOnboardingUseCase {
  constructor(
    private onboardingRepository: OnboardingRepository,
    private analyticsService: AnalyticsService
  ) {}

  async execute(request: StartOnboardingRequest): Promise<Result<OnboardingSession>> {
    try {
      // Check for existing active session
      const existingSession = await this.onboardingRepository.findActiveByUserId(request.userId);
      
      if (existingSession) {
        // Resume existing session
        await this.analyticsService.trackEvent('onboarding_resumed', {
          userId: request.userId,
          sessionId: existingSession.id,
          currentStep: existingSession.currentStep
        });
        
        return Result.success(existingSession);
      }

      // Create new onboarding session
      const session = new OnboardingSession(
        OnboardingSessionId.generate(),
        request.userId,
        request.email,
        OnboardingStep.BUSINESS_INFO,
        new Map(),
        OnboardingStatus.IN_PROGRESS
      );

      await this.onboardingRepository.save(session);

      // Track analytics
      await this.analyticsService.trackEvent('onboarding_started', {
        userId: request.userId,
        sessionId: session.id,
        source: request.source
      });

      return Result.success(session);
    } catch (error) {
      return Result.failure(error as Error);
    }
  }
}
```

### Verify Phone Number Use Case

```typescript
class VerifyPhoneNumberUseCase {
  constructor(
    private whatsappService: WhatsAppService,
    private onboardingRepository: OnboardingRepository,
    private smsService: SmsService
  ) {}

  async execute(request: VerifyPhoneNumberRequest): Promise<Result<VerificationResult>> {
    try {
      // Get onboarding session
      const session = await this.onboardingRepository.findById(request.sessionId);
      if (!session) {
        return Result.failure(new OnboardingSessionNotFoundError());
      }

      // Validate phone number format
      const phoneNumber = new PhoneNumber(request.phoneNumber);

      // Check if number is WhatsApp Business eligible
      const eligibilityCheck = await this.whatsappService.checkBusinessEligibility(phoneNumber);
      if (!eligibilityCheck.isEligible) {
        return Result.failure(new PhoneNumberNotEligibleError(phoneNumber.getValue()));
      }

      // Send verification code
      let verificationResult: VerificationResult;

      if (request.method === 'whatsapp') {
        verificationResult = await this.whatsappService.sendVerificationCode(phoneNumber);
      } else {
        verificationResult = await this.smsService.sendVerificationCode(phoneNumber);
      }

      // Update session with phone number and verification status
      const stepData = new OnboardingStepData(
        OnboardingStep.PHONE_VERIFICATION,
        {
          phoneNumber: phoneNumber.getValue(),
          verificationMethod: request.method,
          verificationId: verificationResult.verificationId,
          isVerified: false
        }
      );

      session.updateStepData(OnboardingStep.PHONE_VERIFICATION, stepData);
      await this.onboardingRepository.save(session);

      return Result.success(verificationResult);
    } catch (error) {
      return Result.failure(error as Error);
    }
  }
}
```

### Configure WhatsApp Integration Use Case

```typescript
class ConfigureWhatsAppIntegrationUseCase {
  constructor(
    private whatsappService: WhatsAppService,
    private onboardingRepository: OnboardingRepository,
    private webhookService: WebhookService
  ) {}

  async execute(request: ConfigureIntegrationRequest): Promise<Result<WhatsAppConfig>> {
    try {
      const session = await this.onboardingRepository.findById(request.sessionId);
      if (!session) {
        return Result.failure(new OnboardingSessionNotFoundError());
      }

      // Validate phone verification
      const phoneStepData = session.stepData.get(OnboardingStep.PHONE_VERIFICATION);
      if (!phoneStepData?.data.isVerified) {
        return Result.failure(new PhoneNumberNotVerifiedError());
      }

      // Create WhatsApp configuration
      const config = new WhatsAppConfig(
        request.accessToken,
        request.businessAccountId,
        request.phoneNumberId,
        request.webhookUrl,
        request.webhookVerifyToken,
        request.displayName,
        request.about
      );

      // Test the configuration
      const testResult = await this.whatsappService.testConfiguration(config);
      if (!testResult.success) {
        return Result.failure(new WhatsAppConfigurationError(testResult.error));
      }

      // Set up webhook
      const webhookResult = await this.webhookService.setupWebhook(
        config.webhookUrl,
        config.webhookVerifyToken,
        request.businessAccountId
      );

      if (!webhookResult.success) {
        return Result.failure(new WebhookSetupError(webhookResult.error));
      }

      // Update session
      const stepData = new OnboardingStepData(
        OnboardingStep.WHATSAPP_INTEGRATION,
        {
          config: config,
          webhookId: webhookResult.webhookId,
          testResult: testResult
        },
        true
      );

      session.updateStepData(OnboardingStep.WHATSAPP_INTEGRATION, stepData);
      session.proceedToStep(OnboardingStep.BOT_SETUP);
      await this.onboardingRepository.save(session);

      return Result.success(config);
    } catch (error) {
      return Result.failure(error as Error);
    }
  }
}
```

## Onboarding Steps

### Step Progression

1. **BUSINESS_INFO** - Collect business information
   - Company name, industry, website
   - Business description and logo
   - Contact information
   - Tax ID (if required)

2. **PHONE_VERIFICATION** - Verify WhatsApp Business number
   - Phone number input with country selection
   - Verification method selection (SMS/WhatsApp)
   - Code verification and confirmation
   - Business account eligibility check

3. **WHATSAPP_INTEGRATION** - Set up WhatsApp Cloud API
   - Access token configuration
   - Business Account ID setup
   - Phone Number ID configuration
   - Webhook URL setup and verification

4. **BOT_SETUP** - Configure bot behavior
   - Template selection (customer service, sales, support)
   - Welcome message customization
   - Response configuration
   - Business hours setup

5. **TESTING** - Validate configuration
   - Send test messages
   - Verify responses
   - Check webhook delivery
   - Performance validation

6. **COMPLETE** - Finalize setup
   - Configuration summary
   - Next steps guidance
   - Dashboard access
   - Support resources

## Bot Templates

### Available Templates

#### Customer Service Template
```typescript
const customerServiceTemplate: BotTemplate = {
  id: 'customer-service',
  name: 'Customer Service Bot',
  description: 'Handle customer inquiries and support requests',
  welcomeMessage: 'Hello! How can I help you today?',
  responses: {
    'help': 'I can help you with orders, billing, and general questions.',
    'hours': 'Our business hours are Monday-Friday, 9AM-5PM.',
    'contact': 'You can reach our team at support@company.com',
    'default': 'I\'m not sure about that. Let me connect you with a human agent.'
  },
  quickReplies: ['Order Status', 'Billing', 'Technical Support', 'Speak to Agent'],
  features: {
    humanHandoff: true,
    businessHours: true,
    orderTracking: true,
    knowledgeBase: true
  }
};
```

#### Sales Template
```typescript
const salesTemplate: BotTemplate = {
  id: 'sales',
  name: 'Sales Assistant Bot',
  description: 'Qualify leads and schedule appointments',
  welcomeMessage: 'Hi! I\'m here to help you learn more about our services.',
  responses: {
    'pricing': 'Our pricing starts at $29/month. Would you like to see our plans?',
    'demo': 'I can schedule a demo for you. What time works best?',
    'features': 'Our platform includes bot building, analytics, and 24/7 support.',
    'default': 'That\'s a great question! Let me connect you with our sales team.'
  },
  quickReplies: ['View Pricing', 'Schedule Demo', 'Learn Features', 'Contact Sales'],
  features: {
    leadCapture: true,
    appointmentScheduling: true,
    productCatalog: true,
    crmIntegration: true
  }
};
```

#### Support Template
```typescript
const supportTemplate: BotTemplate = {
  id: 'technical-support',
  name: 'Technical Support Bot',
  description: 'Provide technical assistance and troubleshooting',
  welcomeMessage: 'Welcome to technical support! Describe your issue and I\'ll help.',
  responses: {
    'login': 'Try resetting your password at our login page.',
    'bug': 'Please describe the bug and I\'ll create a support ticket.',
    'feature': 'You can request features through our feedback portal.',
    'default': 'Let me search our knowledge base for that issue.'
  },
  quickReplies: ['Login Issues', 'Report Bug', 'Feature Request', 'Documentation'],
  features: {
    ticketCreation: true,
    knowledgeBase: true,
    screenShareLinks: true,
    escalationRules: true
  }
};
```

## Phone Number Verification

### Verification Methods

#### WhatsApp Verification
```typescript
class WhatsAppVerificationService {
  async sendVerificationCode(phoneNumber: PhoneNumber): Promise<VerificationResult> {
    const response = await this.whatsappApi.post('/phone_numbers/verify', {
      phone_number: phoneNumber.getValue(),
      method: 'whatsapp'
    });

    return {
      verificationId: response.verification_id,
      method: 'whatsapp',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
  }

  async verifyCode(verificationId: string, code: string): Promise<boolean> {
    const response = await this.whatsappApi.post('/phone_numbers/verify/confirm', {
      verification_id: verificationId,
      code: code
    });

    return response.status === 'verified';
  }
}
```

#### SMS Verification (Fallback)
```typescript
class SmsVerificationService {
  async sendVerificationCode(phoneNumber: PhoneNumber): Promise<VerificationResult> {
    const code = this.generateVerificationCode();
    
    await this.smsProvider.sendSMS({
      to: phoneNumber.getValue(),
      body: `Your WhatsApp verification code is: ${code}`
    });

    // Store code temporarily
    await this.cacheService.set(`verification:${phoneNumber.getValue()}`, code, 600);

    return {
      verificationId: `sms:${phoneNumber.getValue()}`,
      method: 'sms',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
  }
}
```

### Supported Countries

WhatsApp Business API is available in many countries. The onboarding system includes validation for:

- United States (+1)
- Canada (+1)
- United Kingdom (+44)
- Germany (+49)
- France (+33)
- Spain (+34)
- Italy (+39)
- Brazil (+55)
- Mexico (+52)
- Argentina (+54)
- Colombia (+57)
- South Africa (+27)
- Nigeria (+234)
- Kenya (+254)
- Ghana (+233)
- Egypt (+20)
- India (+91)
- Singapore (+65)
- Australia (+61)
- And many more...

## Webhook Management

### Webhook Setup

```typescript
class WebhookService {
  async setupWebhook(
    webhookUrl: string, 
    verifyToken: string, 
    businessAccountId: string
  ): Promise<WebhookSetupResult> {
    
    // 1. Verify webhook URL is accessible
    const healthCheck = await this.verifyWebhookUrl(webhookUrl, verifyToken);
    if (!healthCheck.success) {
      return { success: false, error: 'Webhook URL not accessible' };
    }

    // 2. Configure webhook with WhatsApp
    const webhookConfig = await this.whatsappApi.post(`/${businessAccountId}/subscriptions`, {
      object: 'whatsapp_business_account',
      callback_url: webhookUrl,
      verify_token: verifyToken,
      fields: ['messages', 'message_deliveries', 'message_reads']
    });

    // 3. Test webhook delivery
    const testResult = await this.testWebhookDelivery(webhookUrl, businessAccountId);
    
    return {
      success: true,
      webhookId: webhookConfig.id,
      testResult: testResult
    };
  }

  private async verifyWebhookUrl(url: string, verifyToken: string): Promise<{success: boolean}> {
    try {
      const challenge = 'test_challenge_' + Date.now();
      const response = await fetch(`${url}?hub.mode=subscribe&hub.challenge=${challenge}&hub.verify_token=${verifyToken}`);
      
      if (response.ok && await response.text() === challenge) {
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }
}
```

## API Endpoints

The module expects the following API endpoints:

### Onboarding Management
- `POST /api/onboarding/start` - Start new onboarding session
- `GET /api/onboarding/:sessionId` - Get onboarding session
- `PUT /api/onboarding/:sessionId` - Update onboarding session
- `POST /api/onboarding/:sessionId/step` - Complete onboarding step
- `DELETE /api/onboarding/:sessionId` - Abandon onboarding

### Business Information
- `POST /api/onboarding/:sessionId/business` - Submit business info
- `POST /api/onboarding/business/validate` - Validate business information
- `POST /api/onboarding/business/enrich` - Enrich business data

### Phone Verification
- `POST /api/onboarding/:sessionId/verify/send` - Send verification code
- `POST /api/onboarding/:sessionId/verify/confirm` - Confirm verification code
- `GET /api/onboarding/countries/supported` - Get supported countries

### WhatsApp Integration
- `POST /api/onboarding/:sessionId/whatsapp/configure` - Configure integration
- `POST /api/onboarding/:sessionId/whatsapp/test` - Test configuration
- `POST /api/onboarding/:sessionId/webhook/setup` - Setup webhook

### Bot Configuration
- `GET /api/onboarding/bot/templates` - Get bot templates
- `POST /api/onboarding/:sessionId/bot/configure` - Configure bot
- `POST /api/onboarding/:sessionId/bot/test` - Test bot responses

## Error Handling

### Common Errors

```typescript
// Onboarding-specific errors
class OnboardingSessionNotFoundError extends Error {
  constructor(sessionId?: string) {
    super(`Onboarding session not found${sessionId ? `: ${sessionId}` : ''}`);
    this.name = 'OnboardingSessionNotFoundError';
  }
}

class InvalidBusinessInfoError extends Error {
  constructor(field?: string) {
    super(`Invalid business information${field ? ` for field: ${field}` : ''}`);
    this.name = 'InvalidBusinessInfoError';
  }
}

class PhoneNumberNotVerifiedError extends Error {
  constructor() {
    super('Phone number must be verified before proceeding');
    this.name = 'PhoneNumberNotVerifiedError';
  }
}

class WhatsAppConfigurationError extends Error {
  constructor(details: string) {
    super(`WhatsApp configuration failed: ${details}`);
    this.name = 'WhatsAppConfigurationError';
  }
}

class WebhookSetupError extends Error {
  constructor(details: string) {
    super(`Webhook setup failed: ${details}`);
    this.name = 'WebhookSetupError';
  }
}
```

### Error Recovery

```typescript
// Automatic retry logic
class OnboardingErrorRecovery {
  async handleError(error: Error, context: OnboardingContext): Promise<RecoveryAction> {
    switch (error.constructor) {
      case WhatsAppConfigurationError:
        return this.recoverWhatsAppConfiguration(context);
      
      case WebhookSetupError:
        return this.recoverWebhookSetup(context);
      
      case PhoneNumberNotVerifiedError:
        return this.recoverPhoneVerification(context);
      
      default:
        return { action: 'manual_intervention', message: error.message };
    }
  }

  private async recoverWhatsAppConfiguration(context: OnboardingContext): Promise<RecoveryAction> {
    // Attempt to refresh access token
    try {
      const newToken = await this.refreshWhatsAppToken(context.businessAccountId);
      return { 
        action: 'retry_with_new_token', 
        data: { accessToken: newToken } 
      };
    } catch {
      return { 
        action: 'request_new_credentials', 
        message: 'Please verify your WhatsApp access token' 
      };
    }
  }
}
```

## Performance Optimization

### Progressive Data Loading

```typescript
// Load onboarding data progressively
export function OnboardingStep({ step }: { step: OnboardingStep }) {
  const { data: stepData, isLoading } = useOnboardingStep(step);
  
  return (
    <Suspense fallback={<OnboardingStepSkeleton />}>
      <LazyOnboardingStepContent step={step} data={stepData} />
    </Suspense>
  );
}

// Lazy load heavy step components
const LazyBusinessInfoForm = lazy(() => import('./business-info-form'));
const LazyWhatsAppIntegrationForm = lazy(() => import('./whatsapp-integration-form'));
const LazyBotConfigurationForm = lazy(() => import('./bot-configuration-form'));
```

### Session Recovery

```typescript
// Automatically recover interrupted sessions
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  
  useEffect(() => {
    // Attempt to recover session from localStorage
    const savedSession = localStorage.getItem('onboarding_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        // Validate session is still active
        validateAndRestoreSession(parsedSession).then(setSession);
      } catch {
        // Clear invalid session
        localStorage.removeItem('onboarding_session');
      }
    }
  }, []);

  // Auto-save session state
  useEffect(() => {
    if (session) {
      localStorage.setItem('onboarding_session', JSON.stringify(session));
    }
  }, [session]);

  return (
    <OnboardingContext.Provider value={{ session, setSession }}>
      {children}
    </OnboardingContext.Provider>
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('StartOnboardingUseCase', () => {
  it('should create new onboarding session', async () => {
    const useCase = new StartOnboardingUseCase(
      mockOnboardingRepository,
      mockAnalyticsService
    );

    const result = await useCase.execute({
      userId: 'user_123',
      email: 'user@example.com',
      source: 'landing-page'
    });

    expect(result.isSuccess()).toBe(true);
    expect(mockOnboardingRepository.save).toHaveBeenCalled();
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('onboarding_started', expect.any(Object));
  });

  it('should resume existing session', async () => {
    mockOnboardingRepository.findActiveByUserId.mockResolvedValue(existingSession);

    const result = await useCase.execute(validRequest);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toBe(existingSession);
    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('onboarding_resumed', expect.any(Object));
  });
});
```

### Integration Tests

```typescript
describe('Onboarding API Integration', () => {
  it('should complete full onboarding flow', async () => {
    // Start onboarding
    const startResponse = await fetch('/api/onboarding/start', {
      method: 'POST',
      body: JSON.stringify({ userId: 'test_user', email: 'test@example.com' })
    });
    
    const { sessionId } = await startResponse.json();

    // Submit business info
    const businessResponse = await fetch(`/api/onboarding/${sessionId}/business`, {
      method: 'POST',
      body: JSON.stringify(validBusinessInfo)
    });

    expect(businessResponse.status).toBe(200);

    // Continue with remaining steps...
  });
});
```

### E2E Tests

```typescript
// Playwright/Cypress tests for complete user journey
describe('Onboarding User Journey', () => {
  it('should complete onboarding successfully', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Business information step
    await page.fill('[data-testid="company-name"]', 'Test Company');
    await page.selectOption('[data-testid="industry"]', 'Technology');
    await page.click('[data-testid="continue-button"]');
    
    // Phone verification step
    await page.fill('[data-testid="phone-number"]', '+1234567890');
    await page.click('[data-testid="send-code-button"]');
    
    // Mock verification code
    await page.fill('[data-testid="verification-code"]', '123456');
    await page.click('[data-testid="verify-button"]');
    
    // Continue through remaining steps...
    
    // Verify completion
    await expect(page.locator('[data-testid="onboarding-complete"]')).toBeVisible();
  });
});
```

## Dependencies

### External Dependencies
- `@reduxjs/toolkit` - State management and RTK Query
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `react-phone-number-input` - Phone number input component

### Internal Dependencies
- `components/ui/*` - shadcn/ui components
- `modules/analytics` - Event tracking
- `modules/shared` - Common domain objects
- `store/api/base-api` - Base API configuration

## Configuration Options

### Onboarding Configuration
```typescript
{
  enableBusinessInfoEnrichment: true,  // Auto-fill business data
  requirePhoneVerification: true,      // Mandatory phone verification
  enableWebhookValidation: true,       // Validate webhook endpoints
  allowTemplateCustomization: true,    // Allow bot template editing
  enableTestingStep: true,             // Include testing step
  autoCompleteOnSuccess: false,        // Auto-complete after testing
  sessionTimeoutMinutes: 60,           // Session timeout
  maxRetryAttempts: 3,                 // Max retry attempts
}
```

### WhatsApp Configuration
```typescript
{
  supportedCountries: [...],           // Allowed country codes
  requireBusinessVerification: true,   // Business account verification
  enableAdvancedFeatures: false,      // Advanced WhatsApp features
  webhookRetryAttempts: 3,            // Webhook setup retries
  connectionTimeoutSeconds: 30,       // API connection timeout
}
```

## Future Enhancements

- Advanced bot template builder with visual interface
- Integration with more messaging platforms (Telegram, Instagram)
- AI-powered bot response generation
- Advanced analytics and conversion tracking
- Multi-language onboarding support
- Video tutorial integration
- Live chat support during onboarding
- Automated business information verification
- Advanced webhook testing and debugging tools
- Template marketplace with community templates
- White-label onboarding for resellers
- Bulk onboarding for enterprise customers