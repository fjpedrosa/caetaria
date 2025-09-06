'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface TestResult {
  connection: boolean;
  leads: number;
  flows: number;
  events: number;
  experiments: number;
  writeTest: boolean;
  error?: string;
}

export default function TestLocalPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // Create Supabase client with local credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const testResult: TestResult = {
          connection: false,
          leads: 0,
          flows: 0,
          events: 0,
          experiments: 0,
          writeTest: false
        };

        // Test 1: Count leads
        const { count: leadsCount, error: leadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        if (!leadsError && leadsCount !== null) {
          testResult.leads = leadsCount;
          testResult.connection = true;
        }

        // Test 2: Count onboarding flows
        const { count: flowsCount } = await supabase
          .from('onboarding_flows')
          .select('*', { count: 'exact', head: true });

        if (flowsCount !== null) {
          testResult.flows = flowsCount;
        }

        // Test 3: Count analytics events  
        const { count: eventsCount } = await supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true });

        if (eventsCount !== null) {
          testResult.events = eventsCount;
        }

        // Test 4: Count experiments
        const { count: experimentsCount } = await supabase
          .from('experiments')
          .select('*', { count: 'exact', head: true });

        if (experimentsCount !== null) {
          testResult.experiments = experimentsCount;
        }

        // Test 5: Write test
        const testEmail = `client-test-${Date.now()}@example.com`;
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            email: testEmail,
            business_name: 'Client Test Business',
            business_type: 'test',
            status: 'test'
          })
          .select()
          .single();

        if (!insertError && newLead) {
          // Clean up
          await supabase
            .from('leads')
            .delete()
            .eq('id', newLead.id);
          
          testResult.writeTest = true;
        }

        setResult(testResult);
      } catch (error) {
        setResult({
          connection: false,
          leads: 0,
          flows: 0,
          events: 0,
          experiments: 0,
          writeTest: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing local Supabase connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Local Supabase Connection Test
        </h1>

        {result?.connection ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Connection Successful!
            </h2>
            <p className="text-green-700">
              Local Supabase is running and accessible.
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Connection Failed
            </h2>
            <p className="text-red-700">
              {result?.error || 'Unable to connect to local Supabase.'}
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Results
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Database Connection</span>
              <span className={`font-medium ${result?.connection ? 'text-green-600' : 'text-red-600'}`}>
                {result?.connection ? '✅ Working' : '❌ Failed'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Leads Table</span>
              <span className="font-medium text-gray-900">
                {result?.leads || 0} records
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Onboarding Flows</span>
              <span className="font-medium text-gray-900">
                {result?.flows || 0} records
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Analytics Events</span>
              <span className="font-medium text-gray-900">
                {result?.events || 0} records
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Experiments</span>
              <span className="font-medium text-gray-900">
                {result?.experiments || 0} records
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Write Operations</span>
              <span className={`font-medium ${result?.writeTest ? 'text-green-600' : 'text-red-600'}`}>
                {result?.writeTest ? '✅ Working' : '❌ Failed'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Useful Links
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li>
              <a href="http://localhost:54323" target="_blank" rel="noopener noreferrer" className="hover:underline">
                📊 Supabase Studio (localhost:54323)
              </a>
            </li>
            <li>
              <a href="http://localhost:54321" target="_blank" rel="noopener noreferrer" className="hover:underline">
                🔌 API Endpoint (localhost:54321)
              </a>
            </li>
            <li>
              <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="hover:underline">
                📧 Inbucket Email Testing (localhost:54324)
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Test Again
          </button>
        </div>
      </div>
    </div>
  );
}