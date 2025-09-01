/**
 * K6 Load Testing - API Endpoints
 * 
 * Tests all critical API endpoints under various load conditions
 * to ensure they meet the <200ms 95th percentile requirement.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time', true);
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  scenarios: {
    // Light load - baseline performance
    light_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      gracefulStop: '30s',
      tags: { load_type: 'light' },
    },
    
    // Medium load - typical usage
    medium_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Ramp up to 50 users
        { duration: '2m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulStop: '30s',
      tags: { load_type: 'medium' },
    },

    // Heavy load - peak usage
    heavy_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },  // Ramp up to 100 users
        { duration: '3m', target: 100 },  // Stay at 100 users
        { duration: '1m', target: 200 },  // Spike to 200 users
        { duration: '2m', target: 200 },  // Stay at spike
        { duration: '1m', target: 0 },    // Ramp down
      ],
      gracefulStop: '30s',
      tags: { load_type: 'heavy' },
    },

    // Spike testing - sudden load increase
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 300 }, // Sudden spike
        { duration: '1m', target: 300 },  // Sustain spike
        { duration: '10s', target: 0 },   // Drop back to 0
      ],
      gracefulStop: '30s',
      tags: { load_type: 'spike' },
    },

    // Breakpoint testing - find system limits
    breakpoint_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 100 }, // 100 RPS
        { duration: '2m', target: 200 }, // 200 RPS
        { duration: '2m', target: 300 }, // 300 RPS
        { duration: '2m', target: 400 }, // 400 RPS - finding breaking point
      ],
      gracefulStop: '30s',
      tags: { load_type: 'breakpoint' },
    },
  },

  thresholds: {
    // API response time requirements
    http_req_duration: ['p(95)<200'], // 95th percentile under 200ms
    http_req_duration: ['p(99)<500'], // 99th percentile under 500ms
    http_req_duration: ['med<100'],   // Median under 100ms
    
    // Error rate requirements
    http_req_failed: ['rate<0.01'],   // Less than 1% error rate
    errors: ['rate<0.05'],            // Less than 5% custom errors
    
    // Success metrics
    'http_reqs{status:200}': ['count>1000'], // Minimum successful requests
    
    // Response time by endpoint
    'response_time{endpoint:leads}': ['p(95)<200'],
    'response_time{endpoint:analytics}': ['p(95)<200'],
    'response_time{endpoint:onboarding}': ['p(95)<200'],
    'response_time{endpoint:notifications}': ['p(95)<200'],
  },
};

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testData = {
  lead: {
    businessName: 'Performance Test Business',
    email: `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
    phoneNumber: '+1234567890',
    industry: 'technology',
    monthlyMessages: 1000,
    useCase: 'customer-support',
    source: 'performance-test',
  },
  
  analytics: {
    event_type: 'page_view',
    page: '/performance-test',
    user_agent: 'k6-load-test',
    timestamp: new Date().toISOString(),
  },
  
  onboarding: {
    sessionId: `perf-test-${Math.random().toString(36).substr(2, 9)}`,
    step: 'business-info',
    data: {
      businessName: 'Test Business',
      industry: 'technology',
    },
  },
};

export default function() {
  // Group related tests
  group('API Endpoint Load Tests', () => {
    
    // Test leads endpoint
    group('Leads API', () => {
      testLeadsEndpoint();
    });

    // Test analytics endpoints
    group('Analytics API', () => {
      testAnalyticsEndpoints();
    });

    // Test onboarding endpoints
    group('Onboarding API', () => {
      testOnboardingEndpoints();
    });

    // Test notifications endpoints
    group('Notifications API', () => {
      testNotificationsEndpoints();
    });

    // Test web vitals endpoint
    group('Web Vitals API', () => {
      testWebVitalsEndpoint();
    });
  });

  // Brief pause between iterations
  sleep(1);
}

function testLeadsEndpoint() {
  const startTime = Date.now();

  // Test POST /api/leads - Lead capture
  const createResponse = http.post(
    `${API_BASE}/leads`,
    JSON.stringify(testData.lead),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'leads', method: 'POST' },
    }
  );

  const responseTime = Date.now() - startTime;
  responseTimeTrend.add(responseTime, { endpoint: 'leads' });

  const success = check(createResponse, {
    'leads POST: status is 201': (r) => r.status === 201,
    'leads POST: response time < 200ms': (r) => r.timings.duration < 200,
    'leads POST: has lead ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch (e) {
        return false;
      }
    },
    'leads POST: valid response structure': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data;
      } catch (e) {
        return false;
      }
    },
  });

  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
    errorRate.add(1);
  }

  // Test GET /api/leads/analytics - Lead analytics
  if (createResponse.status === 201) {
    const analyticsResponse = http.get(
      `${API_BASE}/leads/analytics`,
      {
        headers: {
          'User-Agent': 'k6-performance-test',
        },
        tags: { endpoint: 'leads', method: 'GET' },
      }
    );

    check(analyticsResponse, {
      'leads analytics GET: status is 200': (r) => r.status === 200,
      'leads analytics GET: response time < 200ms': (r) => r.timings.duration < 200,
      'leads analytics GET: has analytics data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && typeof body.data === 'object';
        } catch (e) {
          return false;
        }
      },
    });
  }
}

function testAnalyticsEndpoints() {
  // Test POST /api/analytics/web-vitals - Web Vitals tracking
  const webVitalsData = {
    name: 'LCP',
    value: 1200 + Math.random() * 1000, // Random value between 1200-2200ms
    rating: 'good',
    url: '/performance-test',
    timestamp: Date.now(),
  };

  const webVitalsResponse = http.post(
    `${API_BASE}/analytics/web-vitals`,
    JSON.stringify(webVitalsData),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'analytics', method: 'POST' },
    }
  );

  const success = check(webVitalsResponse, {
    'web-vitals POST: status is 200': (r) => r.status === 200,
    'web-vitals POST: response time < 200ms': (r) => r.timings.duration < 200,
    'web-vitals POST: successful tracking': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Test POST /api/analytics/ab-testing - A/B test tracking
  const abTestData = {
    test_name: 'pricing_display',
    variant: Math.random() > 0.5 ? 'control' : 'treatment',
    event: 'view',
    user_id: `k6-user-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  const abTestResponse = http.post(
    `${API_BASE}/analytics/ab-testing`,
    JSON.stringify(abTestData),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'analytics', method: 'POST' },
    }
  );

  check(abTestResponse, {
    'ab-testing POST: status is 200': (r) => r.status === 200,
    'ab-testing POST: response time < 200ms': (r) => r.timings.duration < 200,
    'ab-testing POST: successful tracking': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
  });
}

function testOnboardingEndpoints() {
  const sessionId = `k6-session-${Math.random().toString(36).substr(2, 9)}`;

  // Test POST /api/onboarding - Start onboarding session
  const startOnboardingResponse = http.post(
    `${API_BASE}/onboarding`,
    JSON.stringify({
      ...testData.onboarding,
      sessionId,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'onboarding', method: 'POST' },
    }
  );

  const success = check(startOnboardingResponse, {
    'onboarding POST: status is 200 or 201': (r) => [200, 201].includes(r.status),
    'onboarding POST: response time < 200ms': (r) => r.timings.duration < 200,
    'onboarding POST: has session data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.sessionId;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Test GET /api/onboarding/sessions/[sessionId] - Get session
  if (startOnboardingResponse.status < 300) {
    const getSessionResponse = http.get(
      `${API_BASE}/onboarding/sessions/${sessionId}`,
      {
        headers: {
          'User-Agent': 'k6-performance-test',
        },
        tags: { endpoint: 'onboarding', method: 'GET' },
      }
    );

    check(getSessionResponse, {
      'onboarding GET: status is 200': (r) => r.status === 200,
      'onboarding GET: response time < 200ms': (r) => r.timings.duration < 200,
      'onboarding GET: has session data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.sessionId === sessionId;
        } catch (e) {
          return false;
        }
      },
    });
  }
}

function testNotificationsEndpoints() {
  // Test GET /api/notifications - List notifications
  const listResponse = http.get(
    `${API_BASE}/notifications`,
    {
      headers: {
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'notifications', method: 'GET' },
    }
  );

  const success = check(listResponse, {
    'notifications GET: status is 200': (r) => r.status === 200,
    'notifications GET: response time < 200ms': (r) => r.timings.duration < 200,
    'notifications GET: has notifications array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Test POST /api/notifications - Create notification
  const createNotificationResponse = http.post(
    `${API_BASE}/notifications`,
    JSON.stringify({
      type: 'performance_test',
      title: 'K6 Performance Test',
      message: 'This is a test notification from k6 load testing',
      priority: 'low',
      metadata: {
        test_run: Date.now(),
        user_agent: 'k6',
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-performance-test',
      },
      tags: { endpoint: 'notifications', method: 'POST' },
    }
  );

  check(createNotificationResponse, {
    'notifications POST: status is 201': (r) => r.status === 201,
    'notifications POST: response time < 200ms': (r) => r.timings.duration < 200,
    'notifications POST: has notification ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch (e) {
        return false;
      }
    },
  });
}

function testWebVitalsEndpoint() {
  const vitalsData = [
    { name: 'LCP', value: 1200 + Math.random() * 1000, rating: 'good' },
    { name: 'FID', value: 50 + Math.random() * 100, rating: 'good' },
    { name: 'CLS', value: 0.05 + Math.random() * 0.1, rating: 'good' },
    { name: 'INP', value: 100 + Math.random() * 200, rating: 'needs-improvement' },
  ];

  vitalsData.forEach(vital => {
    const response = http.post(
      `${API_BASE}/analytics/web-vitals`,
      JSON.stringify({
        ...vital,
        url: '/performance-test',
        timestamp: Date.now(),
        user_agent: 'k6-performance-test',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'k6-performance-test',
        },
        tags: { endpoint: 'web-vitals', method: 'POST', vital: vital.name },
      }
    );

    check(response, {
      [`web-vitals ${vital.name}: status is 200`]: (r) => r.status === 200,
      [`web-vitals ${vital.name}: response time < 200ms`]: (r) => r.timings.duration < 200,
    });
  });
}

// Setup function - runs once before all VUs start
export function setup() {
  console.log(`🚀 Starting API load tests against ${BASE_URL}`);
  console.log('📊 Test scenarios:', Object.keys(options.scenarios).join(', '));
  
  // Verify API is accessible
  const healthCheck = http.get(`${BASE_URL}/`);
  if (healthCheck.status !== 200) {
    throw new Error(`API health check failed: ${healthCheck.status}`);
  }
  
  return { startTime: Date.now() };
}

// Teardown function - runs once after all VUs finish
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`✅ Load test completed in ${duration.toFixed(1)}s`);
  console.log('📈 Check the results above for performance metrics');
}