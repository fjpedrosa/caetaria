#!/usr/bin/env node

/**
 * Test script to verify local Supabase connection
 * Run with: node scripts/test-local-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load local environment variables
dotenv.config({ path: join(__dirname, '..', '.env.development.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.development.local');
  process.exit(1);
}

console.log('🔄 Testing Supabase local connection...');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📊 Testing database connection...\n');

    // Test 1: Query leads table
    console.log('1️⃣ Fetching leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(3);

    if (leadsError) throw leadsError;
    console.log(`   ✅ Found ${leads.length} leads`);
    leads.forEach(lead => {
      console.log(`   - ${lead.business_name} (${lead.email})`);
    });

    // Test 2: Query onboarding flows
    console.log('\n2️⃣ Fetching onboarding flows...');
    const { data: flows, error: flowsError } = await supabase
      .from('onboarding_flows')
      .select('*');

    if (flowsError) throw flowsError;
    console.log(`   ✅ Found ${flows.length} onboarding flows`);
    flows.forEach(flow => {
      console.log(`   - ${flow.name}: ${flow.description}`);
    });

    // Test 3: Query analytics events
    console.log('\n3️⃣ Fetching analytics events...');
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_name, event_category')
      .limit(5);

    if (eventsError) throw eventsError;
    console.log(`   ✅ Found ${events.length} analytics events`);
    const eventTypes = [...new Set(events.map(e => e.event_category))];
    console.log(`   Event categories: ${eventTypes.join(', ')}`);

    // Test 4: Query experiments
    console.log('\n4️⃣ Fetching experiments...');
    const { data: experiments, error: experimentsError } = await supabase
      .from('experiments')
      .select('name, status');

    if (experimentsError) throw experimentsError;
    console.log(`   ✅ Found ${experiments.length} experiments`);
    experiments.forEach(exp => {
      console.log(`   - ${exp.name} (${exp.status})`);
    });

    // Test 5: Test write operation (create and delete a test lead)
    console.log('\n5️⃣ Testing write operations...');
    const testLead = {
      email: `test-${Date.now()}@example.com`,
      business_name: 'Test Business',
      business_type: 'test',
      status: 'test'
    };

    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single();

    if (insertError) throw insertError;
    console.log(`   ✅ Created test lead with ID: ${newLead.id}`);

    // Clean up test lead
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', newLead.id);

    if (deleteError) throw deleteError;
    console.log(`   ✅ Deleted test lead`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\n📝 Summary:');
    console.log('- Database connection: ✅ Working');
    console.log('- Read operations: ✅ Working');
    console.log('- Write operations: ✅ Working');
    console.log('- RLS policies: ✅ Configured (allowing all operations)');
    console.log('\n🎉 Local Supabase environment is ready for development!');
    console.log('\nUseful URLs:');
    console.log('- Supabase Studio: http://localhost:54323');
    console.log('- API: http://localhost:54321');
    console.log('- Inbucket (emails): http://localhost:54324');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if Supabase is running: pnpm supabase:status');
    console.error('2. Start Supabase if needed: pnpm supabase:start');
    console.error('3. Reset database if needed: pnpm db:reset');
    process.exit(1);
  }
}

testConnection();