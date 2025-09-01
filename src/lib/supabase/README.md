# Supabase Integration

Complete Supabase setup for Next.js 15 with hybrid SSR+CSR strategy, following clean architecture principles.

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment variables from `.env.example`:

```bash
# Public Environment Variables (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Private Environment Variables (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Basic Usage

```typescript
// Browser client (React components)
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('leads')
  .select('*');

// Server client (API routes, Server Components)
import { createClient } from '@/lib/supabase';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('leads').select('*');
  return Response.json(data);
}

// Repository pattern (Clean Architecture)
import { createSupabaseLeadRepository } from '@/lib/supabase';

const leadRepository = createSupabaseLeadRepository({ supabase });
const lead = await leadRepository.findByEmail('user@example.com');
```

## 📁 File Structure

```
src/lib/supabase/
├── index.ts          # Main exports and utilities
├── client.ts         # Browser client configuration
├── server.ts         # Server client configuration
├── middleware.ts     # Next.js middleware integration
├── types.ts          # Generated TypeScript types
├── hooks.ts          # React hooks for client-side
└── README.md         # This documentation
```

## 🏗️ Architecture Overview

### Hybrid SSR+CSR Strategy

- **Server-Side Rendering (SSR)**: Use `createClient()` for API routes and Server Components
- **Client-Side Rendering (CSR)**: Use `supabase` instance for React components and browser interactions
- **Middleware**: Automatic session management and authentication handling

### Clean Architecture Integration

The integration follows clean architecture principles:

1. **Domain Layer**: Entity definitions and business rules
2. **Application Layer**: Use cases and repository interfaces
3. **Infrastructure Layer**: Supabase adapters and implementations
4. **Presentation Layer**: React components and API routes

## 🔧 Client Configuration

### Browser Client (`client.ts`)

Configured for client-side operations:

```typescript
import { supabase, authHelpers } from '@/lib/supabase/client';

// Basic queries
const { data } = await supabase.from('leads').select('*');

// Authentication
const session = await authHelpers.getCurrentSession();
const user = await authHelpers.getCurrentUser();
await authHelpers.signOut();
```

**Features:**
- Automatic session persistence in localStorage
- Real-time subscriptions
- Client-side authentication flows
- Browser-specific optimizations

### Server Client (`server.ts`)

Configured for server-side operations:

```typescript
import { createClient, createAdminClient, serverAuthHelpers } from '@/lib/supabase/server';

// Regular server operations
const supabase = await createClient();
const { data } = await supabase.from('leads').select('*');

// Admin operations (bypasses RLS)
const adminClient = await createAdminClient();

// Auth helpers
const user = await serverAuthHelpers.getUser(supabase);
const isAuth = await serverAuthHelpers.isAuthenticated(supabase);
```

**Features:**
- Cookie-based session management
- Server-side authentication
- Admin operations with service role
- Next.js App Router optimized

## 🛠️ Middleware Integration

The middleware handles authentication automatically:

```typescript
// src/middleware.ts
import { updateSession, authCallback, protectedRoutes } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Update Supabase session
  const authResponse = await updateSession(request);
  
  // 2. Handle auth callbacks
  const callbackResponse = await authCallback(request);
  if (callbackResponse) return callbackResponse;
  
  // 3. Protect routes
  const protectedResponse = await protectedRoutes(request);
  if (protectedResponse) return protectedResponse;
  
  // 4. Continue with your middleware logic...
}
```

**Features:**
- Automatic session refresh
- Auth callback handling
- Protected routes
- Cookie management

## 📊 Database Types

Auto-generated TypeScript types ensure type safety:

```typescript
import type { Database, Lead, LeadInsert, LeadUpdate } from '@/lib/supabase/types';

// Use generated types
const lead: Lead = {
  id: 'uuid',
  email: 'user@example.com',
  source: 'landing_page',
  status: 'new',
  // ... other fields
};

// Form types
const createForm: LeadInsert = {
  email: 'user@example.com',
  source: 'landing_page',
  // Optional fields...
};
```

### Regenerating Types

```bash
# Local development
npm run supabase:types

# Remote project
npm run supabase:types:remote
```

## 🎣 React Hooks

Client-side hooks for common operations:

### Authentication Hook

```typescript
import { useAuth } from '@/lib/supabase/hooks';

function LoginComponent() {
  const { user, loading, signInWithPassword, signOut, error } = useAuth();
  
  const handleLogin = async () => {
    const { user, error } = await signInWithPassword('user@example.com', 'password');
    if (error) console.error(error);
  };
  
  if (loading) return <div>Loading...</div>;
  
  return user ? (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  ) : (
    <button onClick={handleLogin}>Sign In</button>
  );
}
```

### Data Fetching Hook

```typescript
import { useSupabaseQuery } from '@/lib/supabase/hooks';

function LeadsComponent() {
  const { data: leads, loading, error, refetch } = useSupabaseQuery('leads', {
    select: 'id, email, status, created_at',
    order: { column: 'created_at', ascending: false },
    limit: 10,
    realtime: true, // Enable real-time updates
  });
  
  if (loading) return <div>Loading leads...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {leads?.map(lead => (
        <div key={lead.id}>
          {lead.email} - {lead.status}
        </div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Data Mutation Hooks

```typescript
import { useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/lib/supabase/hooks';

function LeadManager() {
  const { insert, loading: inserting } = useSupabaseInsert('leads');
  const { update, loading: updating } = useSupabaseUpdate('leads');
  const { delete: deleteLead, loading: deleting } = useSupabaseDelete('leads');
  
  const createLead = async () => {
    const { data, error } = await insert({
      email: 'new@example.com',
      source: 'website',
      status: 'new',
    });
    if (!error) console.log('Lead created:', data);
  };
  
  const updateLeadStatus = async (id: string) => {
    const { data, error } = await update(
      { id }, // filters
      { status: 'contacted' } // updates
    );
    if (!error) console.log('Lead updated:', data);
  };
  
  const removeLead = async (id: string) => {
    const { error } = await deleteLead({ id });
    if (!error) console.log('Lead deleted');
  };
  
  return (
    <div>
      <button onClick={createLead} disabled={inserting}>
        Create Lead
      </button>
      {/* ... other buttons */}
    </div>
  );
}
```

## 🔒 Authentication Flows

### Email/Password Authentication

```typescript
import { useAuth } from '@/lib/supabase/hooks';

function AuthComponent() {
  const { signUp, signInWithPassword, resetPassword } = useAuth();
  
  // Sign up
  const handleSignUp = async () => {
    const { user, error } = await signUp('user@example.com', 'password', {
      data: { full_name: 'John Doe' }
    });
  };
  
  // Sign in
  const handleSignIn = async () => {
    const { user, error } = await signInWithPassword('user@example.com', 'password');
  };
  
  // Reset password
  const handleReset = async () => {
    const { error } = await resetPassword('user@example.com');
  };
}
```

### Protected Routes

Configure protected routes in middleware:

```typescript
// src/middleware.ts
import { protectedRoutes } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Protect specific routes
  const protectedResponse = await protectedRoutes(
    request,
    ['/dashboard', '/profile', '/admin'], // protected paths
    '/auth/login' // redirect to login
  );
  if (protectedResponse) return protectedResponse;
}
```

## 🛡️ Error Handling

### Utility Functions

```typescript
import { supabaseUtils } from '@/lib/supabase';

try {
  const { data, error } = await supabase.from('leads').insert(leadData);
  if (error) throw error;
} catch (error) {
  if (supabaseUtils.isNotFound(error)) {
    console.log('Resource not found');
  } else if (supabaseUtils.isUniqueViolation(error)) {
    console.log('Duplicate entry');
  } else {
    console.error('Unexpected error:', supabaseUtils.formatError(error));
  }
}
```

### Retry Logic

```typescript
import { supabaseUtils } from '@/lib/supabase';

const result = await supabaseUtils.withRetry(
  async () => {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) throw error;
    return data;
  },
  3, // max retries
  1000 // base delay in ms
);
```

## 🔄 Real-time Subscriptions

### Using Hooks

```typescript
import { useSupabaseSubscription } from '@/lib/supabase/hooks';

function RealtimeComponent() {
  const [leads, setLeads] = useState([]);
  
  useSupabaseSubscription('leads', (payload) => {
    console.log('Real-time change:', payload);
    
    if (payload.eventType === 'INSERT') {
      setLeads(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setLeads(prev => prev.map(lead => 
        lead.id === payload.new.id ? payload.new : lead
      ));
    } else if (payload.eventType === 'DELETE') {
      setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
    }
  }, {
    event: '*', // Listen to all events
    filter: 'status=eq.new' // Optional filter
  });
  
  return <div>{/* Render leads */}</div>;
}
```

### Manual Subscriptions

```typescript
import { supabase } from '@/lib/supabase';

useEffect(() => {
  const subscription = supabase
    .channel('leads_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => console.log('Change received!', payload)
    )
    .subscribe();
    
  return () => supabase.removeChannel(subscription);
}, []);
```

## 🧪 Development & Testing

### Testing Database Connection

```typescript
import { devUtils } from '@/lib/supabase';

// Test connection
const isConnected = await devUtils.testConnection();
console.log('Database connected:', isConnected);

// Check configuration
const configOk = devUtils.checkConfig();
console.log('Configuration valid:', configOk);
```

### Available Scripts

```bash
# Supabase management
npm run supabase:start       # Start local Supabase
npm run supabase:stop        # Stop local Supabase
npm run supabase:status      # Check status
npm run supabase:reset       # Reset local database

# Type generation
npm run supabase:types       # Generate types from local
npm run supabase:types:remote # Generate types from remote
```

## 📦 Repository Pattern

Clean architecture implementation with repository pattern:

```typescript
import { createSupabaseLeadRepository } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

// In an API route
export async function POST(request: Request) {
  const supabase = await createClient();
  const leadRepository = createSupabaseLeadRepository({ supabase });
  
  // Use repository methods
  const existingLead = await leadRepository.findByEmail('user@example.com');
  if (existingLead) {
    return Response.json({ error: 'Lead already exists' }, { status: 409 });
  }
  
  const newLead = {
    id: crypto.randomUUID(),
    email: 'user@example.com',
    source: 'landing_page',
    status: 'new' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await leadRepository.save(newLead);
  
  return Response.json({ message: 'Lead created successfully' });
}
```

## 🚨 Common Pitfalls

### 1. Server vs Client Context

```typescript
// ❌ Don't use browser client in server context
import { supabase } from '@/lib/supabase/client';
export async function GET() {
  // This will fail - server context needs server client
  const { data } = await supabase.from('leads').select('*');
}

// ✅ Use server client in API routes
import { createClient } from '@/lib/supabase/server';
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('leads').select('*');
}
```

### 2. Environment Variables

```typescript
// ❌ Don't use public env vars for sensitive operations
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// ✅ Use server-only env vars for sensitive data
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

### 3. Type Safety

```typescript
// ❌ Don't use 'any' types
const data: any = await supabase.from('leads').select('*');

// ✅ Use generated types
const { data }: { data: Lead[] | null } = await supabase.from('leads').select('*');
```

## 🔧 Troubleshooting

### Connection Issues

```typescript
import { devUtils } from '@/lib/supabase';

// Check if Supabase is properly configured
if (!devUtils.checkConfig()) {
  console.error('Supabase configuration missing!');
}

// Test database connection
const connected = await devUtils.testConnection();
if (!connected) {
  console.error('Cannot connect to database!');
}
```

### Authentication Issues

```typescript
import { serverAuthHelpers } from '@/lib/supabase/server';

// In API route - check authentication
const supabase = await createClient();
const user = await serverAuthHelpers.getUser(supabase);

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Real-time Not Working

1. Check if real-time is enabled in your Supabase project
2. Verify Row Level Security (RLS) policies
3. Ensure proper channel subscription cleanup

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('my_channel')
    .on('postgres_changes', { /* ... */ }, handler)
    .subscribe();
    
  // Important: Clean up subscription
  return () => supabase.removeChannel(subscription);
}, []);
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)