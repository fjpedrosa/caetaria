/**
 * Contexts Module Exports
 *
 * Central export point for all application contexts
 * Following clean architecture principles
 */

export {
  type AuthContextValue,
  AuthProvider,
  type SignUpMetadata,
  useAuthContext,
  withAuth} from './auth-context';