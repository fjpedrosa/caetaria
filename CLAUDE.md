# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Principios Fundamentales

1. Lee archivos completos antes de modificar
2. Implementa funcionalidad real (no dummy)
3. Aplica clean architecture
4. Aplica principios SOLID
5. Los ficheros se nombran con kebab-case
6. Selecciona agentes automáticamente según contexto
7. Evalúa siempre qué agentes de los que dispones pueden ayudarte a cumplir lo que se te pide

## Project Overview

**whatsapp-cloud-landing** - Landing page for WhatsApp Cloud API integration with onboarding flow.

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Redux Toolkit 2.8.2 + React Redux 9.2.0
- **UI Components**: Custom components based on Radix UI primitives
- **Forms**: React Hook Form 7.62.0 with Zod 4.1.5 validation
- **Icons**: Lucide React
- **Utilities**: class-variance-authority, tailwind-merge, clsx

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
```

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── (marketing)/          # Marketing landing pages
│   ├── onboarding/           # Onboarding flow pages
│   └── api/                  # API routes
├── modules/                   # Domain-driven feature modules (ALL business logic here)
│   ├── analytics/            # Analytics tracking module
│   ├── marketing/            # Marketing, landing page and lead capture
│   ├── onboarding/           # Onboarding flow logic
│   ├── pricing/              # Pricing plans and AB testing
│   └── shared/               # Shared domain logic
├── components/               # Reusable UI components
│   └── ui/                   # Base UI components (Radix-based)
├── shared/                   # Cross-cutting concerns
│   ├── components/           # Atomic design components
│   ├── hooks/                # Custom React hooks
│   ├── state/                # Redux store configuration
│   └── types/                # TypeScript type definitions
├── store/                    # Redux store exports
└── lib/                      # Utilities and helpers
```

**Nota importante**: Todo el código de negocio está centralizado en `src/modules/`. Las carpetas legacy `domain/`, `presentation/`, `infrastructure/` y `application/` han sido eliminadas y su contenido movido al módulo correspondiente.

## Architecture Patterns

### Domain-Driven Design with Clean Architecture
Each module follows a strict layered architecture:

```
module/
├── domain/           # Business entities and rules
├── application/      # Use cases and ports
├── infra/           # External services and adapters
└── ui/              # React components and hooks
```

### Key Principles Applied
- **Dependency Inversion**: Application defines ports, infrastructure implements adapters
- **Feature Isolation**: Each module is self-contained with minimal cross-dependencies
- **Clean Separation**: Business logic is decoupled from framework specifics
- **Port & Adapters Pattern**: Clear interfaces between layers

## Current Implementation Status

### Completed Features
- Marketing landing page with sections (Hero, Features, Pricing, Testimonials, FAQ)
- Onboarding flow with multiple steps (Business info, WhatsApp integration, Bot setup, Testing)
- Analytics module with event tracking and metrics
- Pricing module with AB testing support
- Lead capture forms with validation
- Performance monitoring and Web Vitals tracking
- Service Worker for offline support

### Module Organization
Each module includes:
- README.md documenting the module's purpose
- index.ts for clean exports
- Strict separation between domain, application, and infrastructure layers

## Development Guidelines

### Component Development
- Use existing UI components from `components/ui/`
- Follow atomic design principles in `shared/components/`
- Implement form validation with React Hook Form + Zod

### State Management
- Use Redux Toolkit for global state
- Keep local state in components when appropriate
- Use custom hooks for reusable stateful logic

### API Integration
- API routes in `app/api/`
- Service classes in module's `infra/services/`
- Use repository pattern for data access

### Performance Optimization
- Image optimization utilities available
- Web Vitals tracking implemented
- Progressive enhancement with Service Worker

## Next Steps for Development

1. Complete backend integrations for lead capture
2. Implement actual WhatsApp Cloud API integration
3. Add authentication and user management
4. Enhance analytics tracking
5. Add more comprehensive testing
