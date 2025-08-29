import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the metric data
    if (!body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // In a real application, you would store this data in your analytics database
    // For now, we'll just log it server-side for monitoring
    console.log('[Web Vitals Analytics]', {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      url: body.url,
      timestamp: new Date(body.timestamp).toISOString(),
      userAgent: body.userAgent?.substring(0, 100), // Truncate for privacy
    });

    // Here you could integrate with analytics services like:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom database storage
    
    // Example: Send to external analytics service
    /*
    await fetch('https://analytics-service.com/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
      },
      body: JSON.stringify({
        event: 'web_vital',
        properties: {
          metric_name: body.name,
          metric_value: body.value,
          metric_rating: body.rating,
          page_url: body.url,
          timestamp: body.timestamp,
        },
      }),
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add CORS headers for cross-origin requests if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}