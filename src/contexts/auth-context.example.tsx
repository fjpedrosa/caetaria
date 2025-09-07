/**
 * AuthContext Usage Examples
 *
 * This file demonstrates various ways to use the AuthContext
 * in different components and scenarios
 */

import React from 'react';

import { useAuthContext, withAuth } from './auth-context';

/**
 * Example 1: Basic Authentication Status Component
 *
 * Shows how to access authentication state
 */
export const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="p-4 border rounded">
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name || user?.email}!</p>
          <p>User ID: {user?.id}</p>
        </div>
      ) : (
        <p>You are not logged in</p>
      )}
    </div>
  );
};

/**
 * Example 2: Login Form Component
 *
 * Demonstrates email/password and Google OAuth login
 */
export const LoginForm: React.FC = () => {
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Redirect handled by auth context or you can add custom logic here
    } catch (error) {
      // Error is already set in context, but you can handle it here too
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // OAuth redirect will handle the rest
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  React.useEffect(() => {
    // Clear error when component unmounts
    return () => clearError();
  }, [clearError]);

  return (
    <div className="max-w-md mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error.message}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="my-4 text-center">OR</div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full p-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Sign in with Google'}
      </button>
    </div>
  );
};

/**
 * Example 3: Sign Up Form Component
 *
 * Demonstrates user registration with metadata
 */
export const SignUpForm: React.FC = () => {
  const { signUp, loading, error } = useAuthContext();
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
      });
      // User might need to confirm email depending on Supabase settings
      alert('Sign up successful! Please check your email to confirm.');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="max-w-md mx-auto p-6 space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error.message}
        </div>
      )}

      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        className="w-full p-2 border rounded"
        required
        disabled={loading}
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        className="w-full p-2 border rounded"
        required
        disabled={loading}
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password (min 6 characters)"
        className="w-full p-2 border rounded"
        required
        minLength={6}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
};

/**
 * Example 4: User Profile Component
 *
 * Shows user info and logout functionality
 */
export const UserProfile: React.FC = () => {
  const { user, signOut, loading } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect is handled by the auth context
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center space-x-4">
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{user.name || 'Anonymous User'}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-xs text-gray-500">Provider: {user.provider}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: Protected Page Component
 *
 * Using HOC to protect a component
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard, {user?.name}!</p>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  );
};

// Export the protected version
export const ProtectedDashboard = withAuth(DashboardPage);

/**
 * Example 6: Session Refresh Component
 *
 * Demonstrates manual session refresh
 */
export const SessionManager: React.FC = () => {
  const { session, refreshSession, loading } = useAuthContext();

  const handleRefresh = async () => {
    try {
      await refreshSession();
      alert('Session refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  if (!session) {
    return null;
  }

  const expiresIn = Math.round(
    (session.expiresAt.getTime() - Date.now()) / 1000 / 60
  );

  return (
    <div className="p-4 bg-gray-100 rounded">
      <p className="text-sm">
        Session expires in: {expiresIn} minutes
      </p>
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
      >
        {loading ? 'Refreshing...' : 'Refresh Session'}
      </button>
    </div>
  );
};

/**
 * Example 7: Conditional Rendering Based on Auth
 *
 * Shows different content based on authentication status
 */
export const Navigation: React.FC = () => {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-4">
        <a href="/" className="font-bold">MyApp</a>
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <a href="/dashboard">Dashboard</a>
            <a href="/settings">Settings</a>
            <span className="text-sm">Hi, {user?.name?.split(' ')[0]}</span>
            <UserProfile />
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/signup" className="px-4 py-2 bg-blue-500 rounded">
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

/**
 * Example 8: Error Handling Component
 *
 * Demonstrates comprehensive error handling
 */
export const AuthErrorHandler: React.FC = () => {
  const { error, clearError } = useAuthContext();

  if (!error) {
    return null;
  }

  const getErrorMessage = () => {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'USER_NOT_FOUND':
        return 'No account found with this email.';
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'OAUTH_ERROR':
        return 'OAuth login failed. Please try again.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Authentication Error
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {getErrorMessage()}
          </p>
        </div>
        <button
          onClick={clearError}
          className="ml-4 text-red-400 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};