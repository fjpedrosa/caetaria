/**
 * Region Detection API Route
 * Uses Vercel Edge Runtime for optimal performance
 */

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface RegionInfo {
  countryCode: string;
  region: 'spain' | 'latam' | 'usa' | 'europe' | 'asia' | 'other';
  city?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

const REGION_MAPPING: Record<string, RegionInfo['region']> = {
  // Spain
  ES: 'spain',

  // Latin America
  MX: 'latam',
  AR: 'latam',
  CO: 'latam',
  CL: 'latam',
  PE: 'latam',
  VE: 'latam',
  EC: 'latam',
  BO: 'latam',
  PY: 'latam',
  UY: 'latam',
  BR: 'latam',
  CR: 'latam',
  PA: 'latam',
  DO: 'latam',
  GT: 'latam',
  HN: 'latam',
  SV: 'latam',
  NI: 'latam',

  // USA
  US: 'usa',
  CA: 'usa', // Group Canada with USA for business purposes

  // Europe
  FR: 'europe',
  DE: 'europe',
  IT: 'europe',
  GB: 'europe',
  PT: 'europe',
  NL: 'europe',
  BE: 'europe',
  AT: 'europe',
  CH: 'europe',
  SE: 'europe',
  NO: 'europe',
  DK: 'europe',
  FI: 'europe',
  PL: 'europe',
  CZ: 'europe',
  HU: 'europe',
  RO: 'europe',
  GR: 'europe',
  IE: 'europe',

  // Asia
  CN: 'asia',
  JP: 'asia',
  KR: 'asia',
  IN: 'asia',
  SG: 'asia',
  HK: 'asia',
  TW: 'asia',
  TH: 'asia',
  MY: 'asia',
  ID: 'asia',
  PH: 'asia',
  VN: 'asia',
};

// Currency mapping
const CURRENCY_BY_REGION: Record<RegionInfo['region'], string> = {
  spain: 'EUR',
  latam: 'USD', // Most common, can be overridden per country
  usa: 'USD',
  europe: 'EUR',
  asia: 'USD', // Default, varies by country
  other: 'USD',
};

// Language mapping
const LANGUAGE_BY_REGION: Record<RegionInfo['region'], string> = {
  spain: 'es-ES',
  latam: 'es-MX',
  usa: 'en-US',
  europe: 'en-GB',
  asia: 'en-US',
  other: 'en-US',
};

export async function GET(request: NextRequest) {
  try {
    // Get geolocation from Vercel headers
    const headersList = headers();

    // Vercel automatically provides these headers in production
    const country = headersList.get('x-vercel-ip-country') || '';
    const city = headersList.get('x-vercel-ip-city') || '';
    const timezone = headersList.get('x-vercel-ip-timezone') || '';

    // For development, check for manual override via query params
    const { searchParams } = new URL(request.url);
    const overrideCountry = searchParams.get('country');

    const detectedCountry = overrideCountry || country || 'ES'; // Default to Spain
    const region = REGION_MAPPING[detectedCountry.toUpperCase()] || 'other';

    const regionInfo: RegionInfo = {
      countryCode: detectedCountry.toUpperCase(),
      region,
      city: city || undefined,
      timezone: timezone || undefined,
      currency: CURRENCY_BY_REGION[region],
      language: LANGUAGE_BY_REGION[region],
    };

    // Cache the response for 1 hour at the edge
    return NextResponse.json(regionInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error detecting region:', error);

    // Return default region on error
    return NextResponse.json(
      {
        countryCode: 'ES',
        region: 'spain',
        currency: 'EUR',
        language: 'es-ES',
      },
      { status: 200 }
    );
  }
}

// Also export POST for client-side override
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region } = body;

    if (!region || !['spain', 'latam', 'usa', 'europe', 'asia', 'other'].includes(region)) {
      return NextResponse.json(
        { error: 'Invalid region' },
        { status: 400 }
      );
    }

    // Set a cookie to remember the user's choice
    const response = NextResponse.json({ success: true, region });
    response.cookies.set('user-region', region, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Error setting region:', error);
    return NextResponse.json(
      { error: 'Failed to set region' },
      { status: 500 }
    );
  }
}