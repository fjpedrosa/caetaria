# 🔐 Google OAuth Setup Guide for Neptunik

Esta guía te ayudará a configurar el inicio de sesión con Google en tu aplicación Neptunik.

## 📋 Prerrequisitos

- Cuenta de Google
- Proyecto en Google Cloud Console
- Proyecto Supabase (local o cloud)
- Aplicación Next.js corriendo localmente

## 🚀 Paso 1: Configuración en Google Cloud Console

### 1.1 Crear o seleccionar un proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el Project ID

### 1.2 Habilitar Google+ API

1. Ve a "APIs & Services" → "Library"
2. Busca "Google+ API"
3. Haz clic en "Enable"

### 1.3 Configurar la pantalla de consentimiento OAuth

1. Ve a "APIs & Services" → "OAuth consent screen"
2. Selecciona "External" (a menos que tengas Google Workspace)
3. Completa la información requerida:
   - **App name**: Neptunik
   - **User support email**: tu-email@ejemplo.com
   - **App logo**: (opcional)
   - **Application home page**: http://localhost:3000 (desarrollo)
   - **Application privacy policy**: http://localhost:3000/privacy
   - **Application terms of service**: http://localhost:3000/terms
   - **Developer contact**: tu-email@ejemplo.com
4. En "Scopes", agrega:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Guarda y continúa

### 1.4 Crear credenciales OAuth 2.0

1. Ve a "APIs & Services" → "Credentials"
2. Haz clic en "Create Credentials" → "OAuth client ID"
3. Selecciona "Web application"
4. Configura:
   - **Name**: Neptunik Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     http://127.0.0.1:3000/auth/callback
     ```
     
     Si estás usando Supabase Cloud, también agrega:
     ```
     https://[tu-proyecto].supabase.co/auth/v1/callback
     ```

5. Haz clic en "Create"
6. **IMPORTANTE**: Copia y guarda:
   - Client ID
   - Client Secret

## 🔧 Paso 2: Configuración en Supabase

### 2.1 Para Supabase Local

Si estás usando Supabase local, las configuraciones ya están listas. Solo necesitas iniciar Supabase:

```bash
npm run supabase:start
```

### 2.2 Para Supabase Cloud

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a "Authentication" → "Providers"
4. Busca "Google" y habilítalo
5. Ingresa:
   - **Client ID**: (el que copiaste de Google)
   - **Client Secret**: (el que copiaste de Google)
6. Copia la **Callback URL** que te muestra Supabase
7. Regresa a Google Console y agrega esta URL a "Authorized redirect URIs"
8. Guarda los cambios en Supabase

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1 Crea o actualiza `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321  # O tu URL de Supabase Cloud
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # Tu anon key

# Google OAuth (NO se usan directamente en el código, pero es bueno documentarlas)
# GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=tu-client-secret

# Site URL (para redirecciones)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Nota**: Las credenciales de Google se configuran en Supabase Dashboard, no en las variables de entorno de Next.js.

### 3.2 Para producción

Cuando despliegues a producción, actualiza:

1. **Google Console**:
   - Agrega tu dominio de producción a "Authorized JavaScript origins"
   - Agrega `https://tu-dominio.com/auth/callback` a "Authorized redirect URIs"

2. **Supabase Dashboard**:
   - Actualiza las URLs si es necesario

3. **Variables de entorno en tu hosting** (Vercel, etc.):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-produccion
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
   ```

## 🧪 Paso 4: Probar la Integración

1. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Ve a la página de login**:
   - Abre http://localhost:3000/login

3. **Prueba el flujo de autenticación**:
   - Haz clic en "Continuar con Google"
   - Deberías ser redirigido a Google
   - Selecciona tu cuenta de Google
   - Acepta los permisos
   - Deberías ser redirigido de vuelta a `/dashboard`

4. **Verifica la sesión**:
   - En el dashboard, deberías ver tu email
   - El botón de "Cerrar sesión" debería funcionar

## 🐛 Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"

- **Causa**: Las URLs de callback no coinciden
- **Solución**: 
  1. Verifica que las URLs en Google Console sean exactamente iguales
  2. Incluye el puerto `:3000` para desarrollo local
  3. No uses trailing slashes

### Error: "Invalid client"

- **Causa**: Client ID o Secret incorrectos
- **Solución**:
  1. Verifica que copiaste correctamente las credenciales
  2. Asegúrate de que estén configuradas en Supabase Dashboard

### Error: "User not found after login"

- **Causa**: El callback no está procesando correctamente la sesión
- **Solución**:
  1. Verifica que `/auth/callback/route.ts` existe y está configurado
  2. Revisa los logs del servidor para errores

### La página se queda cargando después del login

- **Causa**: Problema con el redirect o la creación de sesión
- **Solución**:
  1. Abre las DevTools y revisa la consola
  2. Verifica la pestaña Network para ver si hay errores 401/403
  3. Asegúrate de que Supabase esté corriendo si es local

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## ✅ Checklist Final

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google+ API habilitada
- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Credenciales OAuth 2.0 creadas
- [ ] Client ID y Secret copiados
- [ ] URLs de callback configuradas en Google Console
- [ ] Google provider habilitado en Supabase
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor de desarrollo corriendo
- [ ] Login con Google funcionando
- [ ] Redirección a dashboard exitosa
- [ ] Logout funcionando

## 🎉 ¡Listo!

Si completaste todos los pasos, tu autenticación con Google debería estar funcionando. 

Para cualquier problema, revisa:
1. Los logs de la consola del navegador
2. Los logs del servidor (terminal donde corre `npm run dev`)
3. El dashboard de Supabase → Authentication → Logs

---

**Nota de Seguridad**: Nunca compartas tu Client Secret públicamente. Mantenlo seguro y úsalo solo en el servidor o en servicios confiables como Supabase.