/**
 * Manual Validation Script for WhatsApp Simulator
 * This script can be run in the browser console to validate simulator functionality
 * Usage: Copy and paste this script into the browser console on a page with the simulator
 */

declare global {
  interface Window {
    validateWhatsAppSimulator: () => Promise<void>;
    simulatorValidation: {
      results: any[];
      errors: any[];
      warnings: any[];
    };
  }
}

window.simulatorValidation = {
  results: [],
  errors: [],
  warnings: []
};

async function validateWhatsAppSimulator() {
  console.log('🚀 Starting WhatsApp Simulator Validation...');

  const results = window.simulatorValidation.results;
  const errors = window.simulatorValidation.errors;
  const warnings = window.simulatorValidation.warnings;

  // Clear previous results
  results.length = 0;
  errors.length = 0;
  warnings.length = 0;

  // Test 1: Check if simulator container exists
  console.log('📱 Test 1: Checking simulator container...');
  const simulatorContainer = document.querySelector('[role="img"][aria-label*="Demostración avanzada de interfaz de WhatsApp"]');

  if (simulatorContainer) {
    results.push('✅ Simulator container found');
    console.log('✅ Simulator container found');
  } else {
    errors.push('❌ Simulator container not found');
    console.error('❌ Simulator container not found');
  }

  // Test 2: Check for loading state
  console.log('⏳ Test 2: Checking loading state...');
  const loadingElement = document.querySelector('*:contains("Cargando simulador...")');

  if (loadingElement) {
    warnings.push('⚠️  Simulator still in loading state');
    console.warn('⚠️  Simulator still in loading state');
  } else {
    results.push('✅ Simulator has finished loading');
    console.log('✅ Simulator has finished loading');
  }

  // Test 3: Check for WhatsApp header
  console.log('📱 Test 3: Checking WhatsApp header...');
  const whatsappHeader = document.querySelector('.bg-gradient-to-r.from-green-600');

  if (whatsappHeader) {
    results.push('✅ WhatsApp header found');
    console.log('✅ WhatsApp header found');
  } else {
    errors.push('❌ WhatsApp header not found');
    console.error('❌ WhatsApp header not found');
  }

  // Test 4: Check for business name
  console.log('🏢 Test 4: Checking business name display...');
  const businessNameElements = document.querySelectorAll('*');
  let businessNameFound = false;

  businessNameElements.forEach(el => {
    if (el.textContent && (
      el.textContent.includes('Trattoria Nonna') ||
      el.textContent.includes('Demo Business') ||
      el.textContent.includes('Test Restaurant')
    )) {
      businessNameFound = true;
    }
  });

  if (businessNameFound) {
    results.push('✅ Business name displayed');
    console.log('✅ Business name displayed');
  } else {
    errors.push('❌ Business name not found');
    console.error('❌ Business name not found');
  }

  // Test 5: Check for online status
  console.log('🟢 Test 5: Checking online status...');
  const onlineStatusElements = document.querySelectorAll('*');
  let onlineStatusFound = false;

  onlineStatusElements.forEach(el => {
    if (el.textContent && el.textContent.includes('en línea')) {
      onlineStatusFound = true;
    }
  });

  if (onlineStatusFound) {
    results.push('✅ Online status displayed');
    console.log('✅ Online status displayed');
  } else {
    errors.push('❌ Online status not found');
    console.error('❌ Online status not found');
  }

  // Test 6: Check for messages container
  console.log('💬 Test 6: Checking messages container...');
  const messagesContainer = document.querySelector('.bg-\\[\\#e5ddd5\\]');

  if (messagesContainer) {
    results.push('✅ Messages container found');
    console.log('✅ Messages container found');
  } else {
    warnings.push('⚠️  Messages container not found (might use different styling)');
    console.warn('⚠️  Messages container not found (might use different styling)');
  }

  // Test 7: Check for console errors
  console.log('🐛 Test 7: Checking for critical console errors...');
  const originalConsoleError = console.error;
  const consoleErrors: string[] = [];

  console.error = (...args) => {
    consoleErrors.push(args.join(' '));
    originalConsoleError(...args);
  };

  // Wait a bit to collect any errors
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check for specific critical errors
  const criticalErrors = consoleErrors.filter(error =>
    error.includes('Can\'t perform a React state update on a component that hasn\'t mounted yet') ||
    error.includes('performanceMonitor.endOperation is not a function') ||
    error.includes('Maximum update depth exceeded')
  );

  if (criticalErrors.length === 0) {
    results.push('✅ No critical console errors detected');
    console.log('✅ No critical console errors detected');
  } else {
    errors.push(`❌ Critical console errors found: ${criticalErrors.length}`);
    console.error('❌ Critical console errors found:', criticalErrors);
  }

  console.error = originalConsoleError;

  // Test 8: Check for typing indicators functionality
  console.log('⌨️  Test 8: Checking typing indicators...');
  const typingElements = document.querySelectorAll('*');
  let typingFound = false;

  typingElements.forEach(el => {
    if (el.textContent && el.textContent.includes('escribiendo...')) {
      typingFound = true;
    }
  });

  if (typingFound) {
    results.push('✅ Typing indicators are active');
    console.log('✅ Typing indicators are active');
  } else {
    warnings.push('⚠️  No typing indicators currently visible (may be normal)');
    console.warn('⚠️  No typing indicators currently visible (may be normal)');
  }

  // Test 9: Check for phone frame structure
  console.log('📱 Test 9: Checking phone frame structure...');
  const phoneFrame = document.querySelector('.rounded-\\[3\\.2rem\\]');

  if (phoneFrame) {
    results.push('✅ Phone frame structure found');
    console.log('✅ Phone frame structure found');
  } else {
    warnings.push('⚠️  Phone frame structure not found (might use different styling)');
    console.warn('⚠️  Phone frame structure not found (might use different styling)');
  }

  // Test 10: Check for Dynamic Island
  console.log('🏝️  Test 10: Checking Dynamic Island...');
  const dynamicIsland = document.querySelector('.w-36.h-9.bg-black.rounded-full');

  if (dynamicIsland) {
    results.push('✅ Dynamic Island found');
    console.log('✅ Dynamic Island found');
  } else {
    warnings.push('⚠️  Dynamic Island not found (might use different styling)');
    console.warn('⚠️  Dynamic Island not found (might use different styling)');
  }

  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful tests: ${results.length}`);
  console.log(`❌ Failed tests: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);

  if (results.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    results.forEach(result => console.log(result));
  }

  if (errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    errors.forEach(error => console.log(error));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(warning));
  }

  // Overall result
  const overallResult = errors.length === 0 ? 'PASS' : 'FAIL';
  console.log(`\n🎯 OVERALL RESULT: ${overallResult}`);

  if (overallResult === 'PASS') {
    console.log('🎉 WhatsApp Simulator is working correctly!');
  } else {
    console.log('🚨 WhatsApp Simulator has issues that need to be addressed.');
  }

  return {
    overallResult,
    results,
    errors,
    warnings,
    summary: {
      successful: results.length,
      failed: errors.length,
      warnings: warnings.length
    }
  };
}

// Make the function globally available
window.validateWhatsAppSimulator = validateWhatsAppSimulator;

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
  console.log('🔧 WhatsApp Simulator Validation Script Loaded');
  console.log('👉 Run: validateWhatsAppSimulator() to start validation');
  console.log('👉 Or it will auto-run in 3 seconds...');

  setTimeout(() => {
    validateWhatsAppSimulator();
  }, 3000);
}

export { validateWhatsAppSimulator };