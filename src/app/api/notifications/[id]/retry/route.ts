/**
 * Notification Retry API Route
 * API layer - Retry failed notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RetryNotificationSchema = z.object({
  maxRetries: z.number().min(1).max(10).optional(),
  delay: z.number().min(0).max(3600000).optional(), // max 1 hour delay in ms
});

/**
 * POST /api/notifications/[id]/retry - Retry failed notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = RetryNotificationSchema.parse(body);

    // Return mock response
    const mockRetryResult = {
      id,
      status: 'pending',
      retryCount: 1,
      maxRetries: validatedData.maxRetries || 3,
      scheduledAt: validatedData.delay ?
        new Date(Date.now() + validatedData.delay).toISOString() :
        new Date().toISOString(),
      message: 'Notification retry scheduled successfully',
    };

    return NextResponse.json(mockRetryResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('Failed to retry notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}