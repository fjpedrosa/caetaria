/**
 * Campaign Feedback API Route
 * Handles feedback collection and NPS tracking for validation campaigns
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign = searchParams.get('campaign');
    const variant = searchParams.get('variant');
    const feedbackType = searchParams.get('type');

    const supabase = createClient();

    let query = supabase
      .from('campaign_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaign) {
      query = query.eq('campaign_id', campaign);
    }
    if (variant) {
      query = query.eq('variant', variant);
    }
    if (feedbackType) {
      query = query.eq('feedback_type', feedbackType);
    }

    const { data: feedback, error } = await query;

    if (error) {
      throw error;
    }

    // Process feedback analytics
    const analytics = {
      overview: {
        totalResponses: feedback?.length || 0,
        averageRating: feedback?.length ?
          feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length : 0,
        npsScore: calculateNPS(feedback || []),
        responseRate: calculateResponseRate(feedback || []),
      },

      byVariant: variant ? {} : processVariantFeedback(feedback || []),

      byType: processFeedbackByType(feedback || []),

      sentimentAnalysis: processSentimentData(feedback || []),

      commonThemes: extractCommonThemes(feedback || []),

      recommendations: generateRecommendations(feedback || []),
    };

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        analytics
      },
      meta: {
        campaign,
        variant,
        feedbackType,
        totalResponses: feedback?.length || 0,
      }
    });

  } catch (error) {
    console.error('Campaign feedback retrieval error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to retrieve campaign feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      variant,
      feedbackType,
      rating,
      comments,
      suggestions,
      likelihoodToRecommend,
      painPoints,
      featureRequests,
      sessionId,
      leadScore,
      userAgent,
      metadata
    } = body;

    const supabase = createClient();

    // Store feedback
    const { data, error } = await supabase
      .from('campaign_feedback')
      .insert({
        campaign_id: campaignId,
        variant,
        feedback_type: feedbackType,
        rating,
        comments,
        suggestions,
        likelihood_to_recommend: likelihoodToRecommend,
        pain_points: painPoints,
        feature_requests: featureRequests,
        session_id: sessionId,
        lead_score: leadScore,
        user_agent: userAgent,
        metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update lead score based on feedback engagement
    if (sessionId && leadScore !== undefined) {
      await updateLeadScoreFromFeedback(supabase, sessionId, feedbackType, rating);
    }

    // Trigger real-time analytics update
    await triggerFeedbackAnalytics(supabase, campaignId, variant, feedbackType);

    return NextResponse.json({
      success: true,
      data,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Campaign feedback submission error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// Analytics processing functions
function calculateNPS(feedback: any[]): number {
  const npsResponses = feedback.filter(item =>
    item.likelihood_to_recommend !== null && item.likelihood_to_recommend !== undefined
  );

  if (npsResponses.length === 0) return 0;

  const promoters = npsResponses.filter(item => item.likelihood_to_recommend >= 9).length;
  const detractors = npsResponses.filter(item => item.likelihood_to_recommend <= 6).length;

  return Math.round(((promoters - detractors) / npsResponses.length) * 100);
}

function calculateResponseRate(feedback: any[]): number {
  // This would typically compare against total campaign impressions
  // For now, return a placeholder calculation
  const totalImpressions = 1000; // This should come from campaign analytics
  return feedback.length > 0 ? (feedback.length / totalImpressions) * 100 : 0;
}

function processVariantFeedback(feedback: any[]): Record<string, any> {
  const variants = { A: [], B: [] };

  feedback.forEach(item => {
    if (variants[item.variant]) {
      variants[item.variant].push(item);
    }
  });

  return Object.entries(variants).reduce((acc, [variant, items]) => {
    acc[variant] = {
      totalResponses: items.length,
      averageRating: items.length ?
        items.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / items.length : 0,
      npsScore: calculateNPS(items),
      positiveComments: items.filter((item: any) =>
        item.rating && item.rating >= 4
      ).length,
      negativeComments: items.filter((item: any) =>
        item.rating && item.rating <= 2
      ).length,
    };
    return acc;
  }, {} as any);
}

function processFeedbackByType(feedback: any[]): Record<string, any> {
  const types = new Map();

  feedback.forEach(item => {
    const type = item.feedback_type;
    if (!types.has(type)) {
      types.set(type, []);
    }
    types.get(type).push(item);
  });

  const result: Record<string, any> = {};

  types.forEach((items, type) => {
    result[type] = {
      count: items.length,
      averageRating: items.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / items.length,
      commonThemes: extractThemes(items.map((item: any) => item.comments).filter(Boolean)),
      improvement_suggestions: items
        .filter((item: any) => item.suggestions)
        .map((item: any) => item.suggestions)
        .slice(0, 10), // Top 10 suggestions
    };
  });

  return result;
}

function processSentimentData(feedback: any[]): Record<string, any> {
  // Simple sentiment analysis based on rating and keywords
  const sentiments = { positive: 0, neutral: 0, negative: 0 };

  feedback.forEach(item => {
    if (item.rating) {
      if (item.rating >= 4) sentiments.positive++;
      else if (item.rating === 3) sentiments.neutral++;
      else sentiments.negative++;
    } else {
      // Analyze comments for sentiment keywords
      const comment = (item.comments || '').toLowerCase();
      const positiveKeywords = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect'];
      const negativeKeywords = ['bad', 'terrible', 'awful', 'hate', 'confusing', 'difficult'];

      const positiveCount = positiveKeywords.filter(word => comment.includes(word)).length;
      const negativeCount = negativeKeywords.filter(word => comment.includes(word)).length;

      if (positiveCount > negativeCount) sentiments.positive++;
      else if (negativeCount > positiveCount) sentiments.negative++;
      else sentiments.neutral++;
    }
  });

  const total = sentiments.positive + sentiments.neutral + sentiments.negative;

  return {
    distribution: sentiments,
    percentages: total > 0 ? {
      positive: (sentiments.positive / total) * 100,
      neutral: (sentiments.neutral / total) * 100,
      negative: (sentiments.negative / total) * 100,
    } : { positive: 0, neutral: 0, negative: 0 },
    overallSentiment: sentiments.positive > sentiments.negative ? 'positive' :
                      sentiments.negative > sentiments.positive ? 'negative' : 'neutral',
  };
}

function extractCommonThemes(feedback: any[]): string[] {
  const themes = new Map();

  // Extract themes from comments and pain points
  feedback.forEach(item => {
    const text = `${item.comments || ''} ${(item.pain_points || []).join(' ')}`.toLowerCase();

    // Common theme keywords
    const themeKeywords = [
      'price', 'cost', 'expensive', 'cheap',
      'easy', 'difficult', 'simple', 'complex',
      'fast', 'slow', 'quick', 'speed',
      'support', 'help', 'customer service',
      'features', 'functionality', 'capabilities',
      'setup', 'installation', 'configuration',
      'integration', 'compatibility',
      'design', 'interface', 'user experience',
      'reliability', 'stable', 'bugs', 'errors'
    ];

    themeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        themes.set(keyword, (themes.get(keyword) || 0) + 1);
      }
    });
  });

  // Return top 10 themes
  return Array.from(themes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme]) => theme);
}

function extractThemes(comments: string[]): string[] {
  // Simple theme extraction from comments
  const allText = comments.join(' ').toLowerCase();
  const words = allText.split(/\s+/);
  const wordCount = new Map();

  // Filter out common words and count meaningful terms
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must']);

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
      wordCount.set(cleanWord, (wordCount.get(cleanWord) || 0) + 1);
    }
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function generateRecommendations(feedback: any[]): string[] {
  const recommendations = [];

  // Analyze feedback patterns and generate recommendations
  const avgRating = feedback.length ?
    feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length : 0;

  if (avgRating < 3) {
    recommendations.push('Consider major improvements to address user dissatisfaction');
  } else if (avgRating < 4) {
    recommendations.push('Focus on addressing common pain points mentioned in feedback');
  } else {
    recommendations.push('Leverage positive feedback for testimonials and case studies');
  }

  // Check for common themes
  const themes = extractCommonThemes(feedback);
  if (themes.includes('price') || themes.includes('expensive')) {
    recommendations.push('Review pricing strategy or better communicate value proposition');
  }
  if (themes.includes('difficult') || themes.includes('complex')) {
    recommendations.push('Simplify user experience and improve onboarding process');
  }
  if (themes.includes('slow') || themes.includes('speed')) {
    recommendations.push('Optimize performance and loading times');
  }

  // NPS-based recommendations
  const nps = calculateNPS(feedback);
  if (nps < 0) {
    recommendations.push('Critical: Address detractor feedback immediately to prevent churn');
  } else if (nps < 50) {
    recommendations.push('Focus on converting passive users to promoters');
  } else {
    recommendations.push('Implement referral program to leverage promoter enthusiasm');
  }

  return recommendations;
}

async function updateLeadScoreFromFeedback(
  supabase: any,
  sessionId: string,
  feedbackType: string,
  rating: number | null
) {
  // Assign points based on feedback engagement
  let scoreIncrease = 5; // Base score for providing feedback

  if (feedbackType === 'nps' && rating !== null) {
    if (rating >= 9) scoreIncrease += 20; // Promoter
    else if (rating >= 7) scoreIncrease += 10; // Passive
    else scoreIncrease += 5; // Detractor (still engaged)
  }

  if (feedbackType === 'campaign_experience' && rating !== null) {
    scoreIncrease += Math.max(0, (rating - 3) * 5); // Higher ratings = more points
  }

  // Update lead score
  const { error } = await supabase.rpc('increment_lead_score', {
    p_session_id: sessionId,
    p_score_increase: scoreIncrease
  });

  if (error) {
    console.error('Failed to update lead score:', error);
  }
}

async function triggerFeedbackAnalytics(
  supabase: any,
  campaignId: string,
  variant: string,
  feedbackType: string
) {
  // Store analytics event for feedback submission
  await supabase
    .from('campaign_events')
    .insert({
      event_name: 'campaign_feedback_submitted',
      event_properties: {
        feedback_type: feedbackType,
        campaign_id: campaignId,
        variant: variant
      },
      utm_campaign: campaignId,
      campaign_variant: variant,
      created_at: new Date().toISOString()
    });
}