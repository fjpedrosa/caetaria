'use client';

import { useState } from 'react';
import { AlertCircle, Loader2,Lock, Mail } from 'lucide-react';
import Link from 'next/link';

import { useLogin } from '@/modules/auth/application/hooks/use-login';
import { Alert, AlertDescription } from '@/modules/shared/presentation/components/ui/alert';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/modules/shared/presentation/components/ui/card';
import { GoogleIcon } from '@/modules/shared/presentation/components/ui/google-icon';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { Label } from '@/modules/shared/presentation/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, handleEmailLogin, handleGoogleLogin } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Bienvenido de vuelta
          </CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para continuar con tu onboarding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon size={16} />
            )}
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEmailLogin(email, password)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/auth/reset-password" className="text-muted-foreground hover:text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}