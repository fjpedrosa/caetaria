# Shared Components & Utilities

This directory contains all shared components, utilities, and resources organized using atomic design principles. It serves as the foundation for building consistent, reusable, and maintainable UI components across the application.

## 🎨 Atomic Design Structure

The atomic design methodology is a mental model for creating design systems with five distinct levels:

### 🔸 Atoms (`components/atoms/`)
The smallest, most basic building blocks of the interface. These are HTML elements or React components that can't be broken down further without losing their functionality.

**Examples:**
- `Button` - Enhanced button with variants, loading states, and icons
- `Input` - Form input with validation states and icons
- `Badge` - Status indicators with different variants
- `Avatar` - User profile pictures with fallbacks
- `Spinner` - Loading indicators

**Characteristics:**
- Single responsibility
- Highly reusable
- No business logic
- Accept props for customization
- Include accessibility features

```typescript
// Example: Button atom usage
import { Button } from "@/shared/components/atoms"

<Button 
  variant="primary" 
  size="lg" 
  loading={isSubmitting}
  leftIcon={<PlusIcon />}
>
  Create Account
</Button>
```

### 🔹 Molecules (`components/molecules/`)
Simple combinations of atoms that work together as a unit. Molecules have one clear function and are the backbone of design systems.

**Examples:**
- `FormField` - Label, input, and error message combined
- `CardWithActions` - Card with header, content, and action buttons
- `SearchInput` - Input with search icon and suggestions
- `DataTableRow` - Table row with cells and actions

**Characteristics:**
- Combine multiple atoms
- Single, clear purpose
- Reusable across contexts
- May include basic interaction logic
- Pass data between atoms

```typescript
// Example: FormField molecule usage
import { FormField } from "@/shared/components/molecules"

<FormField
  label="Email Address"
  type="email"
  required
  error={errors.email}
  placeholder="Enter your email"
/>
```

### 🔶 Organisms (`components/organisms/`)
Complex UI components composed of groups of molecules and atoms. They form distinct sections of an interface with specific functionality.

**Examples:**
- `Header` - Navigation bar with logo, menu, and user actions
- `Footer` - Site footer with links, social media, and contact info
- `Layout` - Page layout wrapper with header, content, and footer
- `DataTable` - Full-featured table with sorting, filtering, and pagination

**Characteristics:**
- Complex functionality
- Combine molecules and atoms
- Contain business logic
- Context-aware
- May connect to application state

```typescript
// Example: Header organism usage
import { Header } from "@/shared/components/organisms"

<Header
  logo={<Logo />}
  navigation={navigationItems}
  user={currentUser}
  actions={headerActions}
  sticky
/>
```

## 📚 Directory Structure

```
src/shared/
├── components/           # UI Components (Atomic Design)
│   ├── atoms/           # Basic building blocks
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── spinner.tsx
│   │   └── index.ts
│   ├── molecules/       # Component combinations
│   │   ├── form-field.tsx
│   │   ├── card-with-actions.tsx
│   │   ├── search-input.tsx
│   │   ├── data-table-row.tsx
│   │   └── index.ts
│   ├── organisms/       # Complex components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── layout.tsx
│   │   ├── data-table.tsx
│   │   └── index.ts
│   └── index.ts
├── lib/                 # Utilities and helpers
│   ├── utils.ts         # Common utility functions
│   ├── constants.ts     # App-wide constants
│   ├── validators.ts    # Validation schemas (Zod)
│   └── index.ts
├── types/              # TypeScript definitions
│   ├── global.d.ts     # Global type definitions
│   ├── api.types.ts    # API-related types
│   ├── utils.types.ts  # Utility types
│   └── index.ts
├── config/             # Configuration files
│   ├── app.config.ts   # Application settings
│   ├── api.config.ts   # API configuration
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   ├── use-media-query.ts
│   ├── use-async.ts
│   ├── use-clipboard.ts
│   └── index.ts
├── index.ts            # Main barrel export
└── README.md           # This file
```

## 🔧 Utilities (`lib/`)

### `utils.ts`
Common utility functions for:
- Class name merging (`cn`)
- Date/number formatting
- String manipulation
- Validation helpers
- Clipboard operations
- Deep cloning

### `constants.ts`
Application-wide constants including:
- API endpoints and configuration
- Error/success messages
- Validation patterns
- Feature flags
- Theme settings

### `validators.ts`
Zod validation schemas for:
- Form validation
- API request/response validation
- Type-safe data parsing
- Custom validation rules

## 📝 Types (`types/`)

### `global.d.ts`
Global TypeScript definitions:
- Branded types for type safety
- API response structures
- User and authentication types
- Component prop patterns

### `api.types.ts`
API-specific type definitions:
- Request/response interfaces
- Endpoint types
- Error handling types
- Authentication flows

### `utils.types.ts`
Utility types for advanced TypeScript patterns:
- Generic helpers
- String manipulation types
- Function type utilities
- React component types

## ⚙️ Configuration (`config/`)

### `app.config.ts`
Application-wide settings:
- Environment configuration
- Feature flags
- Theme configuration
- SEO settings
- Performance settings

### `api.config.ts`
API configuration:
- Base URLs and endpoints
- Request/response configuration
- Rate limiting settings
- Cache configuration

## 🪝 Hooks (`hooks/`)

Custom React hooks for common patterns:

### `useDebounce`
Debounce values and callbacks for performance optimization.

### `useLocalStorage`
Manage localStorage with React state synchronization.

### `useMediaQuery`
Responsive design and device detection.

### `useAsync`
Manage async operations with loading/error states.

### `useClipboard`
Copy text to clipboard with success/error feedback.

## 🚀 Usage Examples

### Basic Component Usage

```typescript
import { 
  Button, 
  Input, 
  Badge, 
  FormField, 
  Header,
  useDebounce,
  cn 
} from "@/shared"

function MyComponent() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  return (
    <div className={cn("container mx-auto", "p-4")}>
      <Header 
        title="My App"
        navigation={navItems}
        user={user}
      />
      
      <FormField
        label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search..."
      />
      
      <Button variant="primary" size="lg">
        Submit
      </Button>
      
      <Badge variant="success">Active</Badge>
    </div>
  )
}
```

### Form Handling with Validation

```typescript
import { 
  FormField, 
  Button,
  contactFormSchema,
  useAsyncForm 
} from "@/shared"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactFormSchema)
  })
  
  const { submit, isSubmitting, isSuccess } = useAsyncForm(submitContact)

  const onSubmit = handleSubmit(async (data) => {
    await submit(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        {...register("name")}
        label="Name"
        required
        error={errors.name?.message}
      />
      
      <FormField
        {...register("email")}
        type="email"
        label="Email"
        required
        error={errors.email?.message}
      />
      
      <Button 
        type="submit" 
        loading={isSubmitting}
        disabled={isSuccess}
      >
        {isSuccess ? "Sent!" : "Send Message"}
      </Button>
    </form>
  )
}
```

### Responsive Layout

```typescript
import { 
  Layout, 
  useResponsive,
  useLocalStorage 
} from "@/shared"

function App() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [theme, setTheme] = useLocalStorage("theme", "light")

  return (
    <Layout
      header={{
        title: "My App",
        sticky: !isMobile,
        variant: theme === "dark" ? "dark" : "default"
      }}
      footer={{
        variant: isMobile ? "minimal" : "default"
      }}
      maxWidth={isDesktop ? "2xl" : "full"}
    >
      <main className="py-8">
        <h1>Welcome to the app!</h1>
        {isDesktop && <div>Desktop-specific content</div>}
      </main>
    </Layout>
  )
}
```

## 🎯 Best Practices

### 1. **Component Design**
- Keep atoms focused on a single responsibility
- Make components composable and flexible
- Include proper TypeScript types
- Add accessibility attributes (ARIA)
- Support keyboard navigation

### 2. **Styling**
- Use Tailwind CSS classes with the `cn()` utility
- Support dark mode when applicable
- Follow responsive design principles
- Use CSS variables for dynamic theming

### 3. **State Management**
- Keep component state local when possible
- Use custom hooks for complex state logic
- Validate props with TypeScript interfaces
- Handle loading and error states consistently

### 4. **Performance**
- Use `React.memo()` for expensive components
- Implement proper `key` props for lists
- Debounce user inputs where appropriate
- Lazy load heavy components

### 5. **Accessibility**
- Include proper ARIA labels
- Support keyboard navigation
- Maintain focus management
- Test with screen readers
- Follow WCAG guidelines

## 🔍 Testing

Each component should include:
- Unit tests for functionality
- Accessibility tests
- Visual regression tests (when applicable)
- TypeScript type checking

```typescript
// Example test structure
describe("Button Component", () => {
  it("renders with correct variant styles", () => {
    // Test implementation
  })

  it("handles click events correctly", () => {
    // Test implementation
  })

  it("supports keyboard navigation", () => {
    // Test implementation
  })

  it("displays loading state properly", () => {
    // Test implementation
  })
})
```

## 📖 Further Reading

- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Design Systems Handbook](https://www.designbetter.co/design-systems-handbook)
- [React Component Patterns](https://reactpatterns.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)