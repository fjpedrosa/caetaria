/**
 * Single Notification API Routes
 * API layer - CRUD operations for individual notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  NotificationStatus,
} from '@/modules/marketing/domain/entities/notification';

// Validation schemas
const UpdateNotificationSchema = z.object({
  status: z.nativeEnum(NotificationStatus).optional(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const RetryNotificationSchema = z.object({
  maxRetries: z.number().min(1).max(10).optional(),
  delay: z.number().min(0).max(3600000).optional(), // max 1 hour delay in ms
});

/**
 * GET /api/notifications/[id] - Get notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Return mock data
    const mockNotification = {
      id,
      channel: 'email',
      eventType: 'lead_captured',
      priority: 'normal',
      status: 'delivered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      data: {
        to: 'user@example.com',
        subject: 'Welcome!',
        htmlBody: '<h1>Welcome</h1>',
      },
    };

    return NextResponse.json(mockNotification);
  } catch (error) {
    console.error('Failed to get notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/[id] - Update notification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateNotificationSchema.parse(body);

    // Return mock updated notification
    const mockUpdatedNotification = {
      id,
      channel: 'email',
      eventType: 'lead_captured',
      priority: 'normal',
      status: validatedData.status || 'delivered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledAt: validatedData.scheduledAt,
      retryCount: 0,
      maxRetries: 3,
      metadata: validatedData.metadata,
    };

    return NextResponse.json(mockUpdatedNotification);
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

    console.error('Failed to update notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id] - Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Return success response
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}