import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Sign Out API Route
 *
 * Handles user sign out by clearing the Supabase session
 * and redirecting to the home page.
 */
export async function POST() {
  const supabase = await createClient();

  // Sign out the user
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    // Even if there's an error, redirect to home
  }

  // Redirect to home page after sign out
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}