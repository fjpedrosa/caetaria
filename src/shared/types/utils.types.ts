/**
 * Utility types for common patterns and transformations
 */

import type React from 'react'

// Basic utility types
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & Record<string, never>

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P]
}

export type NonNullable<T> = T extends null | undefined ? never : T

export type NonEmptyArray<T> = readonly [T, ...T[]]

// Object manipulation types
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

export type ValuesOfType<T, U> = T[KeysOfType<T, U>]

export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never
}[keyof T]

export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>

export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>

// Function utility types
export type AnyFunction = (...args: any[]) => any

export type Parameters<T extends AnyFunction> = T extends (...args: infer P) => any ? P : never

export type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : any

export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never

export type PromiseType<T> = T extends Promise<infer U> ? U : T

// Array and tuple utility types
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never

export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : []

export type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never

export type Length<T extends readonly unknown[]> = T['length']

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never

type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [...R, T]>

// String utility types
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

export type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

export type Join<T extends readonly string[], D extends string> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends string
    ? R extends readonly string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : never
    : never
  : ''

export type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S

export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${R}` : S

// Conditional and logical types
export type If<C extends boolean, T, F> = C extends true ? T : F

export type Not<C extends boolean> = C extends true ? false : true

export type And<A extends boolean, B extends boolean> = A extends true ? (B extends true ? true : false) : false

export type Or<A extends boolean, B extends boolean> = A extends true ? true : B extends true ? true : false

// Brand types for type safety
export type Brand<T, B> = T & { __brand: B }

export type Unbrand<T> = T extends Brand<infer U, any> ? U : T

// Nominal types
export type Nominal<T, N extends string> = T & { readonly [Symbol.species]: N }

// Union utility types
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type UnionToTuple<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? [R] : []

export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

export type ExcludeFromUnion<T, U> = T extends U ? never : T

// Object path types
export type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? K | `${K}.${Path<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never

// React component utility types
export type ComponentProps<T extends React.ComponentType<any>> = T extends React.ComponentType<infer P> ? P : never

export type ElementType<T extends React.ElementType> = T extends keyof React.JSX.IntrinsicElements
  ? React.JSX.IntrinsicElements[T]
  : T extends React.ComponentType<infer P>
  ? P
  : never

export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode }

export type PropsWithoutChildren<P> = Omit<P, 'children'>

// Event handler types
export type EventHandler<T = Event> = (event: T) => void

export type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void

export type FormEventHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void

export type KeyboardEventHandler<T = Element> = (event: React.KeyboardEvent<T>) => void

export type MouseEventHandler<T = Element> = (event: React.MouseEvent<T>) => void

// Form utility types
export type FormData<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | Date ? T[K] : string
}

export type FormErrors<T> = {
  [K in keyof T]?: string
}

export type FormTouched<T> = {
  [K in keyof T]?: boolean
}

export type FormState<T> = {
  values: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

// API utility types
export type ApiEndpoint<TRequest = any, TResponse = any> = (request: TRequest) => Promise<TResponse>

export type EndpointParams<T> = T extends ApiEndpoint<infer P, any> ? P : never

export type EndpointResponse<T> = T extends ApiEndpoint<any, infer R> ? R : never

// State management utility types
export type Action<T extends string = string, P = any> = {
  type: T
  payload?: P
}

export type ActionCreator<T extends string, P = undefined> = P extends undefined
  ? () => Action<T>
  : (payload: P) => Action<T, P>

export type Reducer<S, A extends Action> = (state: S, action: A) => S

export type AsyncAction<T = any> = (dispatch: Dispatch, getState: () => any) => Promise<T>

export type Dispatch<A extends Action = Action> = (action: A | AsyncAction) => any

// Validation utility types
export type ValidationRule<T> = (value: T) => string | undefined

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

export type ValidationResult<T> = {
  [K in keyof T]?: string
}

// Theme and styling utility types
export type CSSVariable<T extends string> = `--${T}`

export type CSSProperties = React.CSSProperties & {
  [key: CSSVariable<string>]: string | number
}

export type ThemeValue<T> = T | ((theme: any) => T)

export type ResponsiveValue<T> = T | T[] | Record<string, T>

// Media query utility types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type BreakpointValue<T> = Partial<Record<Breakpoint, T>>

// Configuration utility types
export type Config<T> = {
  readonly [K in keyof T]: T[K]
}

export type DeepConfig<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepConfig<T[K]> : T[K]
}

// Plugin and extension types
export type Plugin<T = any> = {
  name: string
  version?: string
  install: (app: T, options?: any) => void
}

export type Extension<T = any> = {
  name: string
  extend: (base: T) => T
}

// Async utility types
export type AsyncData<T> = {
  data?: T
  loading: boolean
  error?: Error
}

export type AsyncOperation<T, P = void> = (params: P) => Promise<T>

export type CacheKey = string | readonly unknown[]

export type CacheEntry<T> = {
  data: T
  timestamp: number
  expires?: number
}

// Comparison utility types
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

export type IsNever<T> = [T] extends [never] ? true : false

export type IsAny<T> = 0 extends 1 & T ? true : false

export type IsUnknown<T> = IsNever<T> extends false
  ? T extends unknown
    ? unknown extends T
      ? IsAny<T> extends false
        ? true
        : false
      : false
    : false
  : false

// Tagged union helpers
export type TaggedUnion<T extends Record<string, any>, K extends keyof T = 'type'> = {
  [P in T[K]]: { [Q in K]: P } & T extends { [Q in K]: P } ? T : never
}[T[K]]

export type DiscriminatedUnion<T, K extends keyof T> = T extends Record<K, infer U>
  ? U extends string | number | symbol
    ? Record<K, U> & T
    : never
  : never

// Time utility types
export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd'

export type Duration = `${number}${TimeUnit}`

export type Timestamp = number

export type ISO8601 = string

// File and MIME type utilities
export type MimeType = `${string}/${string}`

export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'image/svg+xml'

export type VideoMimeType = 'video/mp4' | 'video/webm' | 'video/ogg'

export type AudioMimeType = 'audio/mp3' | 'audio/wav' | 'audio/ogg'

export type DocumentMimeType = 'application/pdf' | 'application/msword' | 'text/plain'

// URL and navigation types
export type URLSearchParams = Record<string, string | string[] | undefined>

export type RouteParams = Record<string, string | undefined>

export type NavigationState = Record<string, any>

// Storage utility types
export type StorageKey = string

export type StorageValue = string | number | boolean | object | null

export type SerializedValue = string

// Validation schema types
export type Schema<T> = {
  [K in keyof T]: SchemaField<T[K]>
}

export type SchemaField<T> = {
  type: string
  required?: boolean
  validation?: ValidationRule<T>[]
  default?: T
}

// Feature flag types
export type FeatureFlag<T extends string = string> = {
  name: T
  enabled: boolean
  variants?: Record<string, any>
  conditions?: Array<{
    property: string
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'nin'
    value: any
  }>
}

export type FeatureFlags<T extends string = string> = Record<T, FeatureFlag<T>>

// Testing utility types
export type MockFunction<T extends AnyFunction = AnyFunction> = T & {
  mock: {
    calls: Parameters<T>[]
    results: Array<{ type: 'return' | 'throw'; value: any }>
  }
}

export type TestUtils<T> = {
  render: (props?: Partial<T>) => any
  mockProps: Partial<T>
  defaultProps: T
}

// Logging utility types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: number
  context?: Record<string, any>
}