/**
 * K6 Stress Testing - Concurrent Users & System Limits
 * 
 * Tests system behavior under extreme load to find breaking points
 * and ensure graceful degradation under stress conditions.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import ws from 'k6/ws';

// Custom metrics for stress testing
const concurrentUsers = new Gauge('concurrent_users');
const errorRate = new Rate('stress_errors');
const memoryPressure = new Gauge('memory_pressure_indicator');
const cpuPressure = new Gauge('cpu_pressure_indicator');
const connectionFailures = new Counter('connection_failures');
const successfulConnections = new Counter('successful_connections');
const websocketConnections = new Counter('websocket_connections');
const realtimeLatency = new Trend('realtime_latency');

// Test configuration for stress scenarios
export const options = {
  scenarios: {
    // Gradual stress increase
    gradual_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Baseline load
        { duration: '3m', target: 300 },   // Medium stress
        { duration: '3m', target: 600 },   // High stress
        { duration: '3m', target: 1000 },  // Maximum stress
        { duration: '2m', target: 1200 },  // Beyond capacity
        { duration: '3m', target: 0 },     // Recovery
      ],
      gracefulStop: '1m',
      tags: { test_type: 'gradual_stress' },
    },

    // Spike stress test
    spike_stress: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '30s', target: 50 },   // Baseline
        { duration: '10s', target: 2000 }, // Sudden spike
        { duration: '2m', target: 2000 },  // Sustain spike
        { duration: '30s', target: 50 },   // Return to baseline
      ],
      gracefulStop: '1m',
      tags: { test_type: 'spike_stress' },
    },

    // Sustained high load
    sustained_high_load: {
      executor: 'constant-vus',
      vus: 800,
      duration: '10m',
      gracefulStop: '1m',
      tags: { test_type: 'sustained_load' },
    },

    // Real-time connection stress
    realtime_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 200 },   // Ramp up WebSocket connections
        { duration: '5m', target: 500 },   // Sustain many connections
        { duration: '2m', target: 1000 },  // Push to limits
        { duration: '2m', target: 0 },     // Cleanup
      ],
      exec: 'realtimeStressTest',
      gracefulStop: '1m',
      tags: { test_type: 'realtime_stress' },
    },

    // Memory pressure test
    memory_pressure_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Build up data
        { duration: '5m', target: 300 },   // Maintain pressure
        { duration: '3m', target: 0 },     // Allow cleanup
      ],
      exec: 'memoryPressureTest',
      gracefulStop: '2m',
      tags: { test_type: 'memory_pressure' },
    },
  },

  thresholds: {
    // System should handle at least 1000 concurrent users
    concurrent_users: ['value>=1000'],
    
    // Error rate should stay reasonable even under stress
    stress_errors: ['rate<0.20'],  // Less than 20% error rate under stress
    
    // Connection success rate
    'connection_failures': ['count<1000'], // Limit connection failures
    
    // Response times under stress (more lenient than normal load)
    http_req_duration: ['p(95)<2000'], // 95th percentile under 2 seconds under stress
    http_req_duration: ['p(50)<500'],  // Median under 500ms
    
    // Real-time performance under stress
    realtime_latency: ['p(95)<1000'],  // WebSocket latency under 1 second
    
    // System shouldn't completely fail
    http_req_failed: ['rate<0.50'],    // Less than 50% failure rate
    
    // Memory and CPU pressure indicators
    memory_pressure_indicator: ['value<100'], // Custom memory pressure metric
    cpu_pressure_indicator: ['value<100'],    // Custom CPU pressure metric
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = BASE_URL.replace('http', 'ws');
const API_BASE = `${BASE_URL}/api`;

// Large payload for memory pressure testing
const LARGE_PAYLOAD = 'A'.repeat(10000); // 10KB string

export default function() {
  concurrentUsers.add(__VU);

  group('Stress Test - API Endpoints', () => {
    stressTestAPIs();
  });

  group('Stress Test - Static Assets', () => {
    stressTestStaticAssets();
  });

  group('Stress Test - Form Submissions', () => {
    stressTestFormSubmissions();
  });

  // Short sleep to prevent overwhelming the system
  sleep(Math.random() * 2 + 1);
}

// Real-time stress test function
export function realtimeStressTest() {
  const wsUrl = `${WS_URL}/ws`; // Assuming WebSocket endpoint
  
  group('WebSocket Stress Test', () => {
    const response = ws.connect(wsUrl, {}, function(socket) {
      const connectionStart = Date.now();
      
      socket.on('open', () => {
        successfulConnections.add(1);
        websocketConnections.add(1);
        console.log(`WebSocket connection opened for VU ${__VU}`);
        
        // Send periodic messages to test real-time performance
        const interval = setInterval(() => {
          const messageStart = Date.now();
          
          socket.send(JSON.stringify({
            type: 'performance_test',
            timestamp: messageStart,
            vu: __VU,
            data: Math.random().toString(36),
          }));
        }, 1000);

        // Close after some time to simulate real usage
        setTimeout(() => {
          clearInterval(interval);
          socket.close();
        }, 30000); // 30 seconds
      });

      socket.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.timestamp) {
            const latency = Date.now() - message.timestamp;
            realtimeLatency.add(latency);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });

      socket.on('close', () => {
        websocketConnections.add(-1);
        console.log(`WebSocket connection closed for VU ${__VU}`);
      });

      socket.on('error', (e) => {
        connectionFailures.add(1);
        errorRate.add(1);
        console.log(`WebSocket error for VU ${__VU}: ${e.error()}`);
      });

      // Wait for the connection to be established and messages to be sent
      socket.setTimeout(() => {
        socket.close();
      }, 35000);
    });

    if (!response) {
      connectionFailures.add(1);
      errorRate.add(1);
    }
  });

  sleep(1);
}

// Memory pressure test function
export function memoryPressureTest() {
  group('Memory Pressure Test', () => {
    // Generate large payloads to stress memory
    const largeData = {
      businessName: `Stress Test Business ${__VU}`,
      email: `stress-test-${__VU}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      phoneNumber: `+123456${String(__VU).padStart(4, '0')}`,
      industry: 'stress-testing',
      monthlyMessages: 999999,
      useCase: 'memory-pressure-test',
      description: LARGE_PAYLOAD, // Large payload
      metadata: {
        stress_test: true,
        vu: __VU,
        timestamp: Date.now(),
        large_data: Array(100).fill(LARGE_PAYLOAD), // Even larger payload
      },
    };

    const response = http.post(
      `${API_BASE}/leads`,
      JSON.stringify(largeData),
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `k6-stress-test-vu-${__VU}`,
        },
        tags: { test_type: 'memory_pressure' },
      }
    );

    const success = check(response, {
      'memory pressure: request completed': (r) => r.status > 0, // Any response is better than timeout
      'memory pressure: not server error': (r) => r.status < 500 || r.status === 503, // 503 is acceptable under stress
    });

    if (!success) {
      errorRate.add(1);
    }

    // Simulate memory pressure indicator based on response time
    if (response.timings && response.timings.duration > 5000) {
      memoryPressure.add(90); // High memory pressure
    } else if (response.timings && response.timings.duration > 2000) {
      memoryPressure.add(60); // Medium memory pressure
    } else {
      memoryPressure.add(30); // Low memory pressure
    }
  });

  sleep(2);
}

function stressTestAPIs() {
  const endpoints = [
    { url: `${API_BASE}/leads`, method: 'POST', data: generateLeadData() },
    { url: `${API_BASE}/analytics/web-vitals`, method: 'POST', data: generateWebVitalsData() },
    { url: `${API_BASE}/onboarding`, method: 'POST', data: generateOnboardingData() },
    { url: `${API_BASE}/notifications`, method: 'GET', data: null },
  ];

  endpoints.forEach((endpoint, index) => {
    const startTime = Date.now();
    let response;

    if (endpoint.method === 'POST') {
      response = http.post(endpoint.url, JSON.stringify(endpoint.data), {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `k6-stress-${__VU}-${index}`,
        },
        tags: { endpoint: endpoint.url, method: endpoint.method },
      });
    } else {
      response = http.get(endpoint.url, {
        headers: {
          'User-Agent': `k6-stress-${__VU}-${index}`,
        },
        tags: { endpoint: endpoint.url, method: endpoint.method },
      });
    }

    const duration = Date.now() - startTime;

    // Check for various stress indicators
    const checks = check(response, {
      'stress API: not timeout': (r) => r.timings.duration < 30000, // 30 second timeout
      'stress API: server responsive': (r) => r.status !== 0,
      'stress API: not complete failure': (r) => r.status !== 500 || response.body.includes('overload'),
    });

    if (!checks) {
      errorRate.add(1);
    }

    // Simulate CPU pressure based on response patterns
    if (response.status === 503 || response.timings.duration > 10000) {
      cpuPressure.add(95); // Very high CPU pressure
    } else if (response.status === 429 || response.timings.duration > 5000) {
      cpuPressure.add(75); // High CPU pressure
    } else if (response.timings.duration > 2000) {
      cpuPressure.add(50); // Medium CPU pressure
    } else {
      cpuPressure.add(25); // Normal CPU pressure
    }

    // Brief pause between requests to simulate real user behavior
    sleep(0.1);
  });
}

function stressTestStaticAssets() {
  const assets = [
    '/',
    '/favicon.ico',
    '/vercel.svg',
    '/_next/static/css/app.css', // May not exist, but worth testing
  ];

  assets.forEach(asset => {
    const response = http.get(`${BASE_URL}${asset}`, {
      headers: {
        'User-Agent': `k6-stress-static-${__VU}`,
        'Cache-Control': 'no-cache', // Force fresh requests
      },
      tags: { asset_type: 'static', asset: asset },
    });

    check(response, {
      'static asset: accessible': (r) => r.status === 200 || r.status === 404, // 404 is acceptable
      'static asset: reasonable time': (r) => r.timings.duration < 5000,
    });
  });
}

function stressTestFormSubmissions() {
  // Simulate multiple rapid form submissions
  const submissions = Array.from({ length: 5 }, (_, i) => ({
    businessName: `Stress Business ${__VU}-${i}`,
    email: `stress-${__VU}-${i}@example.com`,
    phoneNumber: `+12345${String(__VU * 10 + i).padStart(5, '0')}`,
    industry: ['technology', 'healthcare', 'finance', 'retail', 'education'][i % 5],
    monthlyMessages: Math.floor(Math.random() * 10000) + 1000,
    useCase: 'stress-test',
    urgency: 'high',
    timestamp: Date.now(),
  }));

  submissions.forEach((submission, index) => {
    const response = http.post(
      `${API_BASE}/leads`,
      JSON.stringify(submission),
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `k6-stress-form-${__VU}-${index}`,
        },
        tags: { submission_type: 'rapid_form' },
      }
    );

    check(response, {
      'rapid form: handled': (r) => r.status < 500 || r.status === 503,
      'rapid form: reasonable time': (r) => r.timings.duration < 10000,
    });

    // Very brief pause between rapid submissions
    sleep(0.05);
  });
}

// Data generation functions
function generateLeadData() {
  return {
    businessName: `Stress Test Business ${__VU}-${Math.random().toString(36).substr(2, 5)}`,
    email: `stress-${__VU}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    industry: ['technology', 'healthcare', 'finance', 'retail', 'education', 'manufacturing'][
      Math.floor(Math.random() * 6)
    ],
    monthlyMessages: Math.floor(Math.random() * 50000) + 1000,
    useCase: ['customer-support', 'marketing', 'sales', 'notifications'][
      Math.floor(Math.random() * 4)
    ],
    source: 'stress-test',
    stress_test: true,
    vu: __VU,
    timestamp: Date.now(),
  };
}

function generateWebVitalsData() {
  return {
    name: ['LCP', 'FID', 'CLS', 'INP'][Math.floor(Math.random() * 4)],
    value: Math.random() * 3000 + 500, // Random value between 500-3500
    rating: ['good', 'needs-improvement', 'poor'][Math.floor(Math.random() * 3)],
    url: `/stress-test-${__VU}`,
    timestamp: Date.now(),
    user_agent: `k6-stress-${__VU}`,
    stress_test: true,
  };
}

function generateOnboardingData() {
  return {
    sessionId: `stress-session-${__VU}-${Date.now()}`,
    step: ['business-info', 'whatsapp-integration', 'bot-setup', 'testing'][
      Math.floor(Math.random() * 4)
    ],
    data: {
      businessName: `Stress Business ${__VU}`,
      industry: 'stress-testing',
      stress_test: true,
      vu: __VU,
    },
    timestamp: Date.now(),
  };
}

// Setup function
export function setup() {
  console.log(`🔥 Starting stress tests against ${BASE_URL}`);
  console.log('⚠️ This test will push the system to its limits');
  
  // Health check
  const health = http.get(`${BASE_URL}/`);
  if (health.status !== 200) {
    throw new Error(`System not healthy before stress test: ${health.status}`);
  }
  
  return { startTime: Date.now() };
}

// Teardown function
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🔥 Stress test completed in ${duration.toFixed(1)}s`);
  console.log('📊 Check system recovery and error rates above');
  console.log('⚠️ System may need time to recover after stress test');
}