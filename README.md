# WhatsApp Cloud API Landing Boilerplate

A production-ready, modern boilerplate for building WhatsApp Cloud API landing pages and onboarding flows. Built with Next.js 15, TypeScript, and clean architecture principles, this boilerplate provides a comprehensive foundation for WhatsApp bot platform marketing and user onboarding.

## 🎯 Key Features

- **🚀 Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **🏗️ Clean Architecture**: Domain-driven design with SOLID principles
- **📱 WhatsApp Integration**: Ready for WhatsApp Cloud API integration
- **🎨 Professional UI**: shadcn/ui components with dark mode support
- **📊 Analytics**: Comprehensive tracking and metrics collection
- **💰 Pricing System**: Flexible pricing with 17+ African currencies
- **🛍️ Onboarding Flow**: Complete user onboarding with phone verification
- **⚡ Performance**: Optimized builds, image optimization, PWA support
- **🔒 Security**: Built-in security headers and best practices
- **📱 Responsive**: Mobile-first design with atomic design system
- **🧪 Testing Ready**: Architecture designed for comprehensive testing
- **🚢 Deploy Ready**: Optimized for Vercel with production configuration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.12 with shadcn/ui
- **State Management**: Redux Toolkit 2.8.2 with RTK Query
- **Forms**: React Hook Form 7.62.0 + Zod 4.1.5
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React 0.542.0
- **Animations**: Tailwind CSS Animate

### Performance & Optimization
- **Bundle Analysis**: @next/bundle-analyzer
- **Image Optimization**: Next.js built-in optimization
- **Performance Monitoring**: Web Vitals tracking
- **PWA**: Service worker for offline support
- **Build Optimization**: Custom build optimization scripts

### Developer Experience
- **Linting**: ESLint with Next.js and Prettier configs
- **Code Formatting**: Prettier with Tailwind plugin
- **Type Checking**: Strict TypeScript configuration
- **Git Hooks**: Pre-commit hooks for code quality

## 🏗️ Architecture Overview

This project follows **Domain-Driven Design** principles with clean architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Next.js Pages  │  │   UI Components │  │  React Hooks    │ │
│  │  App Router     │  │   (shadcn/ui)   │  │  State Mgmt     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Use Cases     │  │   Port Interfaces│  │  Business Logic │ │
│  │  (Orchestration)│  │  (Abstractions) │  │   Validation    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Entities      │  │  Value Objects  │  │ Business Rules  │ │
│  │  (Core Objects) │  │  (Immutable)    │  │   Policies      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Services  │  │   Data Access   │  │  External APIs  │ │
│  │  (RTK Query)    │  │   Repositories  │  │   WhatsApp      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (marketing)/               # Marketing pages group
│   │   ├── page.tsx              # Landing page
│   │   ├── privacy/              # Privacy policy
│   │   └── terms/                # Terms of service
│   ├── onboarding/               # User onboarding flow
│   │   ├── page.tsx              # Onboarding start
│   │   ├── business/             # Business information
│   │   ├── verification/         # Phone verification
│   │   ├── integration/          # WhatsApp setup
│   │   ├── bot-setup/            # Bot configuration
│   │   ├── testing/              # Bot testing
│   │   └── complete/             # Completion page
│   ├── api/                      # API routes
│   │   ├── leads/                # Lead capture endpoint
│   │   └── analytics/            # Analytics endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── providers.tsx            # App providers
│
├── components/                   # Shared UI components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── error-boundary.tsx       # Error handling
│   ├── performance-monitor.tsx   # Performance tracking
│   └── service-worker-register.tsx
│
├── modules/                     # Domain modules
│   ├── marketing/               # Marketing & lead generation
│   │   ├── domain/             # Business entities
│   │   ├── application/        # Use cases
│   │   ├── infra/             # API & services
│   │   └── ui/                # Marketing components
│   │
│   ├── onboarding/             # User onboarding
│   │   ├── domain/            # Onboarding entities
│   │   ├── application/       # Onboarding use cases
│   │   ├── infra/            # Integration services
│   │   └── ui/               # Onboarding components
│   │
│   ├── analytics/             # Event tracking & metrics
│   │   ├── domain/           # Analytics entities
│   │   ├── application/      # Tracking use cases
│   │   ├── infra/           # Analytics APIs
│   │   └── ui/              # Dashboard components
│   │
│   ├── pricing/              # Pricing & billing
│   │   ├── domain/          # Pricing entities
│   │   ├── application/     # Price calculations
│   │   ├── infra/          # Payment APIs
│   │   └── ui/             # Pricing components
│   │
│   └── shared/              # Shared domain objects
│       ├── domain/         # Common entities
│       ├── application/    # Shared interfaces
│       └── infra/         # Common utilities
│
├── shared/                  # Shared resources (Atomic Design)
│   ├── components/         # UI component library
│   │   ├── atoms/         # Basic elements
│   │   ├── molecules/     # Component combinations
│   │   └── organisms/     # Complex components
│   ├── hooks/             # Custom React hooks
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript definitions
│   └── config/           # Configuration
│
├── store/                # Redux store
│   ├── api/             # RTK Query APIs
│   ├── store-provider.tsx
│   └── index.ts
│
├── hooks/               # App-specific hooks
├── lib/                # App utilities
└── types/             # App types
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.0 or later

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/whatsapp-cloud-landing
   cd whatsapp-cloud-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables (see [Environment Variables](#environment-variables) section).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run analyze` | Analyze bundle size |
| `npm run optimize` | Run build optimizations |
| `npm run build:production` | Full production build with optimizations |

## 🏛️ Module Architecture

### 📢 Marketing Module

**Purpose**: Landing page functionality, lead capture, and conversion optimization.

**Key Features**:
- Hero sections with CTA optimization
- Feature grids and testimonials
- Lead capture forms with validation
- Pricing cards with currency support
- Analytics integration for conversion tracking

**Domain Entities**:
- `Lead`: Customer contact information
- `Email`: Validated email value object
- `PhoneNumber`: International phone number validation

**Use Cases**:
- `SubmitLeadForm`: Process and validate lead submissions
- `GetLandingAnalytics`: Retrieve landing page metrics

### 🎯 Onboarding Module

**Purpose**: Complete user onboarding flow from signup to WhatsApp integration.

**Key Features**:
- Multi-step onboarding process
- Business information collection
- Phone number verification
- WhatsApp Cloud API integration
- Bot configuration and testing

**Domain Entities**:
- `OnboardingSession`: User's onboarding progress
- `BusinessInfo`: Company details and verification
- `WhatsAppConfig`: Integration configuration

**Use Cases**:
- `StartOnboarding`: Initialize user onboarding
- `VerifyPhoneNumber`: Validate WhatsApp Business phone
- `ConfigureWhatsAppIntegration`: Set up API connection
- `ConfigureBot`: Set up bot behavior and responses

### 📊 Analytics Module

**Purpose**: Comprehensive event tracking, metrics collection, and reporting.

**Key Features**:
- 25+ predefined event types
- Real-time metrics dashboard
- GDPR-compliant tracking
- Custom event properties
- Automated report generation

**Domain Entities**:
- `Event`: User interactions and system events
- `Metric`: Quantified measurements
- `EventType`: Categorized event classification

**Use Cases**:
- `TrackEvent`: Record user interactions
- `GetMetrics`: Retrieve analytics data
- `GenerateReport`: Create analytics reports

### 💰 Pricing Module

**Purpose**: Flexible pricing system with multi-currency support.

**Key Features**:
- Support for 17+ African currencies
- Dynamic pricing calculations
- Discount code system
- Billing period conversions
- Currency-specific formatting

**Domain Entities**:
- `PricingPlan`: Subscription plans and features
- `Discount`: Promotional codes and offers
- `Price`: Currency-aware pricing
- `Currency`: Multi-currency support

**Use Cases**:
- `GetPricingPlans`: Retrieve available plans
- `CalculatePrice`: Compute pricing with discounts
- `ApplyDiscount`: Validate and apply promotional codes

### 🔗 Shared Module

**Purpose**: Common domain objects, utilities, and infrastructure.

**Key Features**:
- `Result<T>` pattern for error handling
- Dependency injection container
- Common validation schemas
- Reusable value objects

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Environment Variables**
   
   Configure in Vercel dashboard or use:
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add WHATSAPP_ACCESS_TOKEN
   ```

3. **Custom Domain** (Optional)
   ```bash
   vercel domains add your-domain.com
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build:production
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
MIXPANEL_TOKEN=your_mixpanel_token

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Database (Optional)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# External APIs (Optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_TRACKING=true
ENABLE_PWA=true
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | ✅ |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API token | ✅ |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | ✅ |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID | - |
| `ENABLE_ANALYTICS` | Enable analytics tracking | `true` |
| `DATABASE_URL` | Database connection string | - |

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/whatsapp-cloud-landing
   cd whatsapp-cloud-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Coding Standards

- **Architecture**: Follow domain-driven design principles
- **Naming**: Use kebab-case for files, PascalCase for components
- **Types**: Use TypeScript for all new code
- **Styling**: Use Tailwind CSS with the `cn()` utility
- **Testing**: Write tests for new features
- **Documentation**: Update README files for new modules

### Code Style

- **ESLint**: Fix linting issues with `npm run lint:fix`
- **Prettier**: Format code with `npm run format`
- **TypeScript**: Ensure type safety with `npm run type-check`

### Pull Request Process

1. **Ensure all checks pass**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

2. **Update documentation** if needed

3. **Create descriptive commits**
   ```
   feat(module): add new feature
   fix(component): resolve issue with...
   docs(readme): update installation guide
   ```

4. **Submit pull request** with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing instructions
   - Breaking changes (if any)

### Issue Reporting

When reporting issues, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** (for UI issues)
- **Error messages** (full stack traces)

## 📄 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2024 The Kroko Company

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icons
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

## 📞 Support

- **Documentation**: Check the module-specific README files
- **Issues**: [GitHub Issues](https://github.com/your-username/whatsapp-cloud-landing/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/whatsapp-cloud-landing/discussions)
- **Email**: support@thekrokocompany.com

---

**Built with ❤️ by [The Kroko Company](https://thekrokocompany.com)**

*Start building your WhatsApp bot platform today!*