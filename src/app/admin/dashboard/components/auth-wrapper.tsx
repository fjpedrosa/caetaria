/**
 * Authentication Wrapper Component
 *
 * Provides role-based access control and authentication
 * for admin dashboard components.
 */

'use client';

import React, { useEffect,useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, LogIn,Shield, User } from 'lucide-react';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { LoadingSkeleton } from '@/modules/shared/presentation/components/ui/loading-skeleton';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions: string[];
  avatar?: string;
  department?: string;
  lastLogin?: string;
}

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'analyst' | 'viewer';
  requiredPermissions?: string[];
  fallbackComponent?: React.ReactNode;
}

// Mock user data - replace with actual authentication
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  permissions: [
    'dashboard:read',
    'leads:read',
    'leads:write',
    'leads:delete',
    'analytics:read',
    'onboarding:read',
    'system:read',
    'exports:read',
    'exports:create',
    'users:manage',
  ],
  avatar: undefined,
  department: 'IT Administration',
  lastLogin: new Date().toISOString(),
};

const roleHierarchy = {
  admin: 4,
  manager: 3,
  analyst: 2,
  viewer: 1,
};

const roleDescriptions = {
  admin: 'Full system access and user management',
  manager: 'Management functions and team oversight',
  analyst: 'Data analysis and reporting access',
  viewer: 'Read-only access to dashboards',
};

export const AuthWrapper = ({
  children,
  requiredRole = 'viewer',
  requiredPermissions = [],
  fallbackComponent,
}: AuthWrapperProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo purposes, always return the mock user
        // In real implementation, check actual authentication state
        setUser(mockUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasRequiredRole = (userRole: string, required: string): boolean => {
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >=
           roleHierarchy[required as keyof typeof roleHierarchy];
  };

  const hasRequiredPermissions = (userPermissions: string[], required: string[]): boolean => {
    return required.every(permission => userPermissions.includes(permission));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      // Simulate login API call
      if (loginForm.email === 'admin@example.com' && loginForm.password === 'admin123') {
        setUser(mockUser);
        setIsAuthenticated(true);
        setShowLogin(false);
      } else {
        setLoginError('Invalid credentials. Use admin@example.com / admin123');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setLoginForm({ email: '', password: '' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <LoadingSkeleton className="h-4 w-32 mb-2" />
              <LoadingSkeleton className="h-3 w-48" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated || showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
              <p className="text-gray-600 mt-2">
                Sign in to access the administrative dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{loginError}</span>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Email: <code>admin@example.com</code></div>
                <div>Password: <code>admin123</code></div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Check role and permissions
  if (user && (!hasRequiredRole(user.role, requiredRole) ||
                !hasRequiredPermissions(user.permissions, requiredPermissions))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <Lock className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this section of the dashboard.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Role:</span>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Required Role:</span>
                  <Badge variant="outline">{requiredRole}</Badge>
                </div>
                {requiredPermissions.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 mb-1">Required Permissions:</div>
                    <div className="flex flex-wrap gap-1">
                      {requiredPermissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // User header for authenticated admin interface
  const UserHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
          <Badge variant="secondary">{user?.role}</Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Department</div>
            <div className="text-sm font-medium text-gray-900">
              {user?.department || 'N/A'}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  // Render children with user context
  return (
    <div className="admin-authenticated">
      <UserHeader />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default AuthWrapper;