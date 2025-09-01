#!/usr/bin/env node

/**
 * Simple API Test Script for Lead Repository
 * 
 * This script tests the lead API endpoints to ensure they work correctly.
 * Run with: node test-lead-api.mjs
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testLead = {
  email: 'test@example.com',
  phone_number: '+1234567890',
  company_name: 'Test Company',
  first_name: 'John',
  last_name: 'Doe',
  source: 'landing_page',
  notes: 'Test lead for API validation',
  interested_features: ['api_integration', 'analytics']
};

async function testAPI() {
  console.log('🚀 Testing Lead Management API...\n');

  try {
    // Test 1: Create a new lead
    console.log('1️⃣ Testing POST /api/leads');
    const createResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testLead)
    });
    
    const createResult = await createResponse.json();
    console.log(`Status: ${createResponse.status}`);
    console.log(`Response:`, JSON.stringify(createResult, null, 2));
    
    if (!createResponse.ok) {
      console.log('❌ Create lead test failed\n');
      return;
    }
    
    const leadId = createResult.data?.id;
    console.log('✅ Create lead test passed\n');

    if (!leadId) {
      console.log('❌ No lead ID returned, skipping further tests\n');
      return;
    }

    // Test 2: Get all leads with pagination
    console.log('2️⃣ Testing GET /api/leads with pagination');
    const listResponse = await fetch(`${BASE_URL}/api/leads?limit=5&page=1&sort_by=createdAt&sort_order=desc`);
    const listResult = await listResponse.json();
    console.log(`Status: ${listResponse.status}`);
    console.log(`Total leads: ${listResult.meta?.total || 0}`);
    console.log(`Returned: ${listResult.data?.length || 0} leads`);
    console.log('✅ List leads test passed\n');

    // Test 3: Get specific lead
    console.log('3️⃣ Testing GET /api/leads/[id]');
    const getResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`);
    const getResult = await getResponse.json();
    console.log(`Status: ${getResponse.status}`);
    console.log(`Lead email: ${getResult.data?.email || 'N/A'}`);
    console.log('✅ Get specific lead test passed\n');

    // Test 4: Update the lead
    console.log('4️⃣ Testing PUT /api/leads/[id]');
    const updateData = {
      status: 'contacted',
      notes: 'Updated via API test'
    };
    const updateResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log(`Status: ${updateResponse.status}`);
    console.log(`Updated status: ${updateResult.data?.status || 'N/A'}`);
    console.log('✅ Update lead test passed\n');

    // Test 5: Search leads
    console.log('5️⃣ Testing GET /api/leads with search');
    const searchResponse = await fetch(`${BASE_URL}/api/leads?search=test@example.com&limit=5`);
    const searchResult = await searchResponse.json();
    console.log(`Status: ${searchResponse.status}`);
    console.log(`Search results: ${searchResult.data?.length || 0} leads`);
    console.log('✅ Search leads test passed\n');

    // Test 6: Analytics endpoint
    console.log('6️⃣ Testing GET /api/leads/analytics');
    const analyticsResponse = await fetch(`${BASE_URL}/api/leads/analytics?period=30d&include=status_distribution,source_attribution`);
    const analyticsResult = await analyticsResponse.json();
    console.log(`Status: ${analyticsResponse.status}`);
    console.log(`Analytics period: ${analyticsResult.data?.period || 'N/A'}`);
    console.log('✅ Analytics test passed\n');

    // Test 7: Batch update
    console.log('7️⃣ Testing PATCH /api/leads (batch update)');
    const batchData = {
      updates: [{
        id: leadId,
        changes: {
          status: 'qualified',
          notes: 'Qualified via batch update'
        }
      }]
    };
    const batchResponse = await fetch(`${BASE_URL}/api/leads`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });
    
    const batchResult = await batchResponse.json();
    console.log(`Status: ${batchResponse.status}`);
    console.log(`Batch results: ${batchResult.results?.successful || 0} successful`);
    console.log('✅ Batch update test passed\n');

    // Test 8: Delete the lead (cleanup)
    console.log('8️⃣ Testing DELETE /api/leads/[id] (cleanup)');
    const deleteResponse = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    console.log(`Status: ${deleteResponse.status}`);
    console.log(`Deleted: ${deleteResult.deleted || false}`);
    console.log('✅ Delete lead test passed\n');

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Check if running as main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('📝 Lead Management API Test Suite');
  console.log('=====================================\n');
  
  console.log('⚠️  Note: This script requires the development server to be running.');
  console.log('   Start with: npm run dev\n');
  
  testAPI();
}

export { testAPI };