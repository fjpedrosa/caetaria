import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

// Lead submission schema
const leadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  source: z.enum(['website-form', 'demo-request', 'newsletter-signup', 'pricing-inquiry', 'contact-form']),
  interestedFeatures: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * Lead Capture API Endpoint
 * Handles form submissions from the landing page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = leadSchema.parse(body);
    
    // TODO: In a real app, save to database via repository pattern
    // For now, just log the lead data
    console.log('New lead captured:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Lead capture error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}