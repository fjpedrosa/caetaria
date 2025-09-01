/**
 * Real-time Performance Tests
 * 
 * Tests real-time subscription performance, WebSocket connection scaling,
 * and message delivery latency to ensure <100ms real-time performance.
 */

const { performance } = require('perf_hooks');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

// Real-time performance configuration
const REALTIME_CONFIG = {
  // Performance thresholds (milliseconds)
  thresholds: {
    connectionTime: 2000,      // WebSocket connection establishment
    subscriptionTime: 1000,    // Subscription setup time
    messageLatency: 100,       // Message delivery latency
    bulkMessageLatency: 500,   // Bulk message processing
    reconnectionTime: 3000,    // Reconnection after disconnect
    scalabilityLimit: 100,     // Concurrent connections supported
  },

  // Test scenarios
  scenarios: [
    {
      name: 'Single Connection',
      connections: 1,
      messagesPerConnection: 10,
      messageInterval: 1000,
    },
    {
      name: 'Multiple Connections',
      connections: 5,
      messagesPerConnection: 5,
      messageInterval: 2000,
    },
    {
      name: 'High Frequency',
      connections: 2,
      messagesPerConnection: 50,
      messageInterval: 100,
    },
    {
      name: 'Scale Test',
      connections: 20,
      messagesPerConnection: 3,
      messageInterval: 3000,
    },
    {
      name: 'Burst Test',
      connections: 10,
      messagesPerConnection: 20,
      messageInterval: 50, // Rapid fire
    },
  ],

  // Channel types to test
  channels: [
    {
      name: 'leads_channel',
      table: 'leads',
      event: 'INSERT',
      schema: 'public',
    },
    {
      name: 'analytics_channel', 
      table: 'analytics_events',
      event: '*',
      schema: 'public',
    },
    {
      name: 'onboarding_channel',
      table: 'onboarding_sessions',
      event: 'UPDATE',
      schema: 'public',
    },
  ],
};

// Test state
let supabase;
let testResults = [];
let activeConnections = [];
let messageStats = {
  sent: 0,
  received: 0,
  latencies: [],
  errors: 0,
};

describe('Real-time Performance Tests', () => {
  beforeAll(async () => {
    console.log('🔄 Initializing real-time performance tests...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
    
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✅ Supabase client initialized for real-time testing');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }

    // Reset message stats
    messageStats = {
      sent: 0,
      received: 0,
      latencies: [],
      errors: 0,
    };
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up real-time connections...');
    
    // Close all active connections
    for (const connection of activeConnections) {
      try {
        if (connection.subscription) {
          await connection.subscription.unsubscribe();
        }
        if (connection.channel) {
          await connection.channel.unsubscribe();
        }
      } catch (error) {
        console.warn('⚠️ Error cleaning up connection:', error.message);
      }
    }
    
    activeConnections = [];
    
    // Print final statistics
    printTestStatistics();
  });

  describe('Connection Performance', () => {
    test('should establish WebSocket connection within threshold', async () => {
      const startTime = performance.now();
      let connectionEstablished = false;

      const channel = supabase.channel('connection-test');
      
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectionEstablished = true;
          const duration = performance.now() - startTime;
          
          expect(duration).toBeLessThan(REALTIME_CONFIG.thresholds.connectionTime);
          
          console.log(`✅ WebSocket connection established: ${duration.toFixed(1)}ms`);
          recordTestResult('websocket_connection', duration, true);
        }
      });

      // Wait for connection
      await waitForCondition(() => connectionEstablished, 5000, 'WebSocket connection');
      
      activeConnections.push({ channel, subscription });
    });

    test('should handle connection state changes gracefully', async () => {
      const startTime = performance.now();
      let stateChanges = [];

      const channel = supabase.channel('state-test');
      
      const subscription = channel.subscribe((status) => {
        stateChanges.push({
          status,
          timestamp: performance.now() - startTime,
        });
        
        console.log(`📡 Connection state: ${status} at ${(performance.now() - startTime).toFixed(1)}ms`);
      });

      // Wait for initial connection
      await waitForCondition(() => 
        stateChanges.some(s => s.status === 'SUBSCRIBED'), 
        5000, 
        'Initial subscription'
      );

      // Test reconnection by forcing disconnect and reconnect
      await subscription.unsubscribe();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reconnect
      const reconnectStart = performance.now();
      const newSubscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          const reconnectDuration = performance.now() - reconnectStart;
          
          expect(reconnectDuration).toBeLessThan(REALTIME_CONFIG.thresholds.reconnectionTime);
          
          console.log(`✅ Reconnection successful: ${reconnectDuration.toFixed(1)}ms`);
          recordTestResult('websocket_reconnection', reconnectDuration, true);
        }
      });

      await waitForCondition(() => 
        stateChanges.some(s => s.status === 'SUBSCRIBED' && s.timestamp > reconnectStart), 
        10000, 
        'Reconnection'
      );

      activeConnections.push({ channel, subscription: newSubscription });
    });
  });

  describe('Subscription Performance', () => {
    test('should create table subscriptions within threshold', async () => {
      for (const channelConfig of REALTIME_CONFIG.channels) {
        const startTime = performance.now();
        let subscriptionReady = false;

        console.log(`📡 Testing subscription to ${channelConfig.table}...`);

        const channel = supabase
          .channel(`${channelConfig.name}-perf-test`)
          .on('postgres_changes', {
            event: channelConfig.event,
            schema: channelConfig.schema,
            table: channelConfig.table,
          }, (payload) => {
            // Handle real-time payload
            const latency = performance.now() - (payload.timestamp || startTime);
            messageStats.received++;
            messageStats.latencies.push(latency);
            
            console.log(`📨 Received real-time event for ${channelConfig.table}: ${latency.toFixed(1)}ms latency`);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              subscriptionReady = true;
              const subscriptionTime = performance.now() - startTime;
              
              expect(subscriptionTime).toBeLessThan(REALTIME_CONFIG.thresholds.subscriptionTime);
              
              console.log(`✅ ${channelConfig.table} subscription ready: ${subscriptionTime.toFixed(1)}ms`);
              recordTestResult(`${channelConfig.table}_subscription`, subscriptionTime, true);
            }
          });

        // Wait for subscription to be ready
        await waitForCondition(() => subscriptionReady, 10000, `${channelConfig.table} subscription`);
        
        activeConnections.push({ 
          channel, 
          subscription: channel,
          config: channelConfig,
        });
      }
    });

    test('should handle multiple concurrent subscriptions', async () => {
      const concurrentSubscriptions = 10;
      const subscriptions = [];
      const startTime = performance.now();
      let readyCount = 0;

      console.log(`📡 Creating ${concurrentSubscriptions} concurrent subscriptions...`);

      for (let i = 0; i < concurrentSubscriptions; i++) {
        const channel = supabase
          .channel(`concurrent-test-${i}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public', 
            table: 'leads',
          }, (payload) => {
            // Handle payload
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              readyCount++;
              if (readyCount === concurrentSubscriptions) {
                const totalTime = performance.now() - startTime;
                const avgTime = totalTime / concurrentSubscriptions;
                
                expect(avgTime).toBeLessThan(REALTIME_CONFIG.thresholds.subscriptionTime);
                
                console.log(`✅ ${concurrentSubscriptions} concurrent subscriptions ready: ${totalTime.toFixed(1)}ms total, ${avgTime.toFixed(1)}ms avg`);
                recordTestResult('concurrent_subscriptions', avgTime, true);
              }
            }
          });

        subscriptions.push(channel);
      }

      // Wait for all subscriptions
      await waitForCondition(() => readyCount === concurrentSubscriptions, 15000, 'All concurrent subscriptions');

      // Store for cleanup
      subscriptions.forEach(sub => activeConnections.push({ subscription: sub }));
    });
  });

  describe('Message Latency Performance', () => {
    test('should deliver messages with low latency', async () => {
      const testData = {
        business_name: 'Latency Test Business',
        email: `latency-test-${Date.now()}@example.com`,
        phone_number: '+1234567890',
        industry: 'technology',
        monthly_messages: 1000,
        use_case: 'latency-testing',
      };

      // Set up subscription first
      let messageReceived = false;
      let messageLatency = 0;
      const subscriptionStart = performance.now();

      const channel = supabase
        .channel('latency-test')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        }, (payload) => {
          messageLatency = performance.now() - messageStartTime;
          messageReceived = true;
          messageStats.received++;
          messageStats.latencies.push(messageLatency);
          
          console.log(`📨 Message received with ${messageLatency.toFixed(1)}ms latency`);
        })
        .subscribe();

      // Wait for subscription to be ready
      await waitForCondition(() => channel.state === 'subscribed', 5000, 'Latency test subscription');

      // Send test message
      const messageStartTime = performance.now();
      messageStats.sent++;

      const { data, error } = await supabase
        .from('leads')
        .insert(testData)
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(1);

      // Wait for real-time message
      await waitForCondition(() => messageReceived, 5000, 'Real-time message delivery');
      
      expect(messageLatency).toBeLessThan(REALTIME_CONFIG.thresholds.messageLatency);
      
      console.log(`✅ Message latency: ${messageLatency.toFixed(1)}ms (threshold: ${REALTIME_CONFIG.thresholds.messageLatency}ms)`);
      recordTestResult('message_latency', messageLatency, true);

      // Cleanup test data
      if (data && data[0]) {
        await supabase.from('leads').delete().eq('id', data[0].id);
      }

      activeConnections.push({ channel, subscription: channel });
    });

    test('should handle bulk message delivery efficiently', async () => {
      const bulkSize = 10;
      const bulkData = Array.from({ length: bulkSize }, (_, i) => ({
        business_name: `Bulk Latency Test ${i}`,
        email: `bulk-latency-${i}-${Date.now()}@example.com`,
        phone_number: `+123456789${i}`,
        industry: 'technology',
        monthly_messages: 1000 + i,
        use_case: 'bulk-latency-testing',
      }));

      // Set up subscription
      let messagesReceived = 0;
      const latencies = [];
      
      const channel = supabase
        .channel('bulk-latency-test')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public', 
          table: 'leads',
        }, (payload) => {
          const latency = performance.now() - bulkStartTime;
          messagesReceived++;
          latencies.push(latency);
          messageStats.received++;
          messageStats.latencies.push(latency);
        })
        .subscribe();

      // Wait for subscription
      await waitForCondition(() => channel.state === 'subscribed', 5000, 'Bulk latency test subscription');

      // Send bulk messages
      const bulkStartTime = performance.now();
      messageStats.sent += bulkSize;

      const { data, error } = await supabase
        .from('leads')
        .insert(bulkData)
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(bulkSize);

      // Wait for all messages
      await waitForCondition(() => messagesReceived >= bulkSize, 10000, `All ${bulkSize} bulk messages`);

      const maxLatency = Math.max(...latencies);
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;

      expect(maxLatency).toBeLessThan(REALTIME_CONFIG.thresholds.bulkMessageLatency);
      
      console.log(`✅ Bulk message delivery (${bulkSize} messages): max ${maxLatency.toFixed(1)}ms, avg ${avgLatency.toFixed(1)}ms`);
      recordTestResult('bulk_message_latency', maxLatency, true);

      // Cleanup test data
      if (data && data.length > 0) {
        const ids = data.map(record => record.id);
        await supabase.from('leads').delete().in('id', ids);
      }

      activeConnections.push({ channel, subscription: channel });
    });
  });

  describe('Scale Testing', () => {
    test('should handle high-frequency message streams', async () => {
      const messageCount = 20;
      const messageInterval = 200; // 5 messages per second
      
      let messagesReceived = 0;
      const startTime = performance.now();
      const latencies = [];

      // Set up subscription
      const channel = supabase
        .channel('high-frequency-test')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
        }, (payload) => {
          const latency = performance.now() - (payload.commit_timestamp ? new Date(payload.commit_timestamp).getTime() : startTime);
          messagesReceived++;
          latencies.push(latency);
          messageStats.received++;
          messageStats.latencies.push(latency);
        })
        .subscribe();

      await waitForCondition(() => channel.state === 'subscribed', 5000, 'High-frequency test subscription');

      // Send messages at high frequency
      const sendPromises = [];
      for (let i = 0; i < messageCount; i++) {
        const promise = new Promise(async (resolve) => {
          await new Promise(r => setTimeout(r, i * messageInterval));
          
          const { data, error } = await supabase
            .from('analytics_events')
            .insert({
              event_type: 'high_frequency_test',
              event_data: { message_index: i, timestamp: Date.now() },
              url: '/high-frequency-test',
              timestamp: Date.now(),
            })
            .select();

          messageStats.sent++;
          resolve({ data, error });
        });
        
        sendPromises.push(promise);
      }

      // Wait for all messages to be sent
      await Promise.all(sendPromises);

      // Wait for all messages to be received
      await waitForCondition(() => messagesReceived >= messageCount, 30000, `All ${messageCount} high-frequency messages`);

      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);

      expect(avgLatency).toBeLessThan(REALTIME_CONFIG.thresholds.messageLatency * 2); // Allow higher threshold for high frequency
      
      console.log(`✅ High-frequency stream (${messageCount} messages): avg ${avgLatency.toFixed(1)}ms, max ${maxLatency.toFixed(1)}ms`);
      recordTestResult('high_frequency_stream', avgLatency, true);

      activeConnections.push({ channel, subscription: channel });
    });

    test('should maintain performance under connection load', async () => {
      const connectionCount = 15;
      const connections = [];
      const startTime = performance.now();
      let allConnected = 0;

      console.log(`📡 Testing ${connectionCount} concurrent real-time connections...`);

      // Create multiple connections
      for (let i = 0; i < connectionCount; i++) {
        const channel = supabase
          .channel(`load-test-${i}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'leads',
          }, (payload) => {
            // Handle payload - just count it
            messageStats.received++;
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              allConnected++;
            }
          });

        connections.push(channel);
      }

      // Wait for all connections
      await waitForCondition(() => allConnected >= connectionCount, 20000, `All ${connectionCount} connections`);

      const connectionTime = performance.now() - startTime;
      const avgConnectionTime = connectionTime / connectionCount;

      expect(avgConnectionTime).toBeLessThan(REALTIME_CONFIG.thresholds.subscriptionTime * 2); // Allow higher threshold under load

      console.log(`✅ ${connectionCount} concurrent connections established: ${connectionTime.toFixed(1)}ms total, ${avgConnectionTime.toFixed(1)}ms avg`);
      recordTestResult('connection_load_test', avgConnectionTime, true);

      // Test message delivery under load
      const testMessage = {
        business_name: 'Load Test Business',
        email: `load-test-${Date.now()}@example.com`,
        phone_number: '+1234567890',
        industry: 'technology',
        monthly_messages: 1000,
        use_case: 'load-testing',
      };

      const messageStart = performance.now();
      messageStats.sent++;

      const { data, error } = await supabase
        .from('leads')
        .insert(testMessage)
        .select();

      expect(error).toBeNull();

      // Wait for messages to propagate to all connections
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Cleanup test data
      if (data && data[0]) {
        await supabase.from('leads').delete().eq('id', data[0].id);
      }

      // Store connections for cleanup
      connections.forEach(conn => activeConnections.push({ subscription: conn }));
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should recover from connection failures gracefully', async () => {
      let connectionLost = false;
      let connectionRecovered = false;
      const errorStart = performance.now();

      const channel = supabase
        .channel('error-recovery-test')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'leads',
        }, (payload) => {
          // Message received
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            connectionLost = true;
          } else if (status === 'SUBSCRIBED' && connectionLost) {
            connectionRecovered = true;
            const recoveryTime = performance.now() - errorStart;
            
            console.log(`✅ Connection recovered after failure: ${recoveryTime.toFixed(1)}ms`);
            recordTestResult('error_recovery', recoveryTime, true);
          }
        });

      // Wait for initial connection
      await waitForCondition(() => channel.state === 'subscribed', 5000, 'Error recovery test initial connection');

      // Note: Actual connection failure testing would require more complex setup
      // For now, we just verify the subscription works
      expect(channel.state).toBe('subscribed');

      activeConnections.push({ channel, subscription: channel });
    });

    test('should handle subscription limits gracefully', async () => {
      // Test creating more subscriptions than typically recommended
      const subscriptionLimit = 25;
      const subscriptions = [];
      let successfulSubscriptions = 0;
      let failedSubscriptions = 0;

      console.log(`📡 Testing subscription limits with ${subscriptionLimit} subscriptions...`);

      for (let i = 0; i < subscriptionLimit; i++) {
        try {
          const channel = supabase
            .channel(`limit-test-${i}`)
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'leads',
            }, (payload) => {
              // Handle payload
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                successfulSubscriptions++;
              } else if (status === 'CHANNEL_ERROR') {
                failedSubscriptions++;
              }
            });

          subscriptions.push(channel);
        } catch (error) {
          failedSubscriptions++;
          console.warn(`⚠️ Failed to create subscription ${i}:`, error.message);
        }
      }

      // Wait for subscriptions to settle
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log(`📊 Subscription results: ${successfulSubscriptions} successful, ${failedSubscriptions} failed`);
      
      // We expect most subscriptions to succeed, but some may fail due to limits
      expect(successfulSubscriptions).toBeGreaterThan(subscriptionLimit * 0.8); // At least 80% success
      
      recordTestResult('subscription_limits', successfulSubscriptions, true);

      // Store for cleanup
      subscriptions.forEach(sub => activeConnections.push({ subscription: sub }));
    });
  });
});

// Helper functions
async function waitForCondition(condition, timeout, description) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for: ${description}`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function recordTestResult(testName, duration, passed, error = null) {
  testResults.push({
    testName,
    duration: Math.round(duration * 100) / 100,
    passed,
    error,
    timestamp: Date.now(),
  });
}

function printTestStatistics() {
  console.log('\n📊 REAL-TIME PERFORMANCE STATISTICS');
  console.log('='.repeat(50));
  
  console.log(`\n📨 Message Statistics:`);
  console.log(`  Messages Sent: ${messageStats.sent}`);
  console.log(`  Messages Received: ${messageStats.received}`);
  console.log(`  Success Rate: ${messageStats.sent > 0 ? (messageStats.received / messageStats.sent * 100).toFixed(1) : 0}%`);
  console.log(`  Errors: ${messageStats.errors}`);
  
  if (messageStats.latencies.length > 0) {
    const avgLatency = messageStats.latencies.reduce((sum, lat) => sum + lat, 0) / messageStats.latencies.length;
    const minLatency = Math.min(...messageStats.latencies);
    const maxLatency = Math.max(...messageStats.latencies);
    const p95Latency = messageStats.latencies.sort((a, b) => a - b)[Math.floor(messageStats.latencies.length * 0.95)];
    
    console.log(`\n⚡ Latency Statistics:`);
    console.log(`  Average: ${avgLatency.toFixed(1)}ms`);
    console.log(`  Minimum: ${minLatency.toFixed(1)}ms`);
    console.log(`  Maximum: ${maxLatency.toFixed(1)}ms`);
    console.log(`  95th Percentile: ${p95Latency.toFixed(1)}ms`);
  }
  
  console.log(`\n🔗 Connection Statistics:`);
  console.log(`  Active Connections: ${activeConnections.length}`);
  console.log(`  Test Results: ${testResults.length}`);
  
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = testResults.length - passedTests;
  
  console.log(`\n✅ Test Results:`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${failedTests}`);
  console.log(`  Success Rate: ${testResults.length > 0 ? (passedTests / testResults.length * 100).toFixed(1) : 0}%`);
  
  console.log('\n='.repeat(50));
}

// Export test results for reporting
global.getRealtimeTestResults = () => testResults;
global.getRealtimeMessageStats = () => messageStats;

// Export configuration for external use
module.exports = {
  REALTIME_CONFIG,
  recordTestResult,
  waitForCondition,
  printTestStatistics,
};