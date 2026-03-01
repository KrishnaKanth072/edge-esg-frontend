#!/usr/bin/env node

/**
 * Test Backend Connection Script
 * Tests if backend API is accessible and responding correctly
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function testHealthEndpoint() {
  console.log('🔍 Testing backend health endpoint...');
  console.log(`   URL: ${API_URL}/health\n`);
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is HEALTHY');
      console.log(`   Status: ${data.status}`);
      console.log(`   Version: ${data.version}`);
      console.log(`   Uptime: ${data.uptime}s\n`);
      return true;
    } else {
      console.log('❌ Backend returned error');
      console.log(`   Status Code: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is OFFLINE');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function testAnalyzeEndpoint() {
  console.log('🔍 Testing analyze endpoint...');
  console.log(`   URL: ${API_URL}/api/v1/analyze\n`);
  
  try {
    const response = await fetch(`${API_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: 'Test Company',
        metrics: ['environmental', 'social', 'governance'],
      }),
    });
    
    if (response.ok) {
      console.log('✅ Analyze endpoint is WORKING');
      const data = await response.json();
      console.log(`   Response received: ${JSON.stringify(data).substring(0, 100)}...\n`);
      return true;
    } else {
      console.log('⚠️  Analyze endpoint returned error (may need authentication)');
      console.log(`   Status Code: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log('❌ Analyze endpoint FAILED');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  EDGE ESG - Backend Connection Test');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const healthOk = await testHealthEndpoint();
  const analyzeOk = await testAnalyzeEndpoint();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Health Endpoint:   ${healthOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Analyze Endpoint:  ${analyzeOk ? '✅ PASS' : '⚠️  NEEDS AUTH'}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (healthOk) {
    console.log('🎉 Backend is ready for frontend integration!\n');
    console.log('Next steps:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Test with company name: "Tata Steel"\n');
  } else {
    console.log('⚠️  Backend is not running. Start it with:');
    console.log('   cd edge-esg-backend');
    console.log('   docker-compose up -d\n');
  }
}

runTests();
