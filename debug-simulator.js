/**
 * Debug script para detectar errores del WhatsApp Simulator
 * Ejecuta la página y captura errores de JavaScript
 */

const puppeteer = require('puppeteer');

async function debugSimulator() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const page = await browser.newPage();
    
    // Capturar errores de consola
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text, timestamp: new Date() });
      
      if (type === 'error') {
        console.log(`\u001b[31m[BROWSER ERROR]\u001b[0m ${text}`);
      } else if (type === 'warn') {
        console.log(`\u001b[33m[BROWSER WARNING]\u001b[0m ${text}`);
      } else if (type === 'log' && text.includes('WhatsAppSimulator')) {
        console.log(`\u001b[36m[SIMULATOR LOG]\u001b[0m ${text}`);
      }
    });
    
    // Capturar errores de red
    page.on('requestfailed', request => {
      console.log(`\u001b[31m[NETWORK ERROR]\u001b[0m ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Capturar errores no manejados
    page.on('pageerror', error => {
      console.log(`\u001b[31m[PAGE ERROR]\u001b[0m ${error.message}`);
      console.log(error.stack);
    });
    
    console.log('🚀 Navegando a http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('✅ Página cargada, esperando por el simulador...');
    
    // Esperar que el simulador se inicialice
    await page.waitForTimeout(5000);
    
    // Verificar si el simulador está presente
    const simulatorExists = await page.evaluate(() => {
      return document.querySelector('[aria-label*="WhatsApp"]') !== null ||
             document.querySelector('.whatsapp-simulator') !== null ||
             document.querySelector('[data-testid*="simulator"]') !== null;
    });
    
    console.log(`📱 Simulador detectado: ${simulatorExists ? 'SÍ' : 'NO'}`);
    
    // Buscar elementos del simulador
    const simulatorElements = await page.evaluate(() => {
      const elements = [];
      
      // Buscar por diferentes selectores posibles
      const selectors = [
        '[aria-label*="WhatsApp"]',
        '[aria-label*="Demostración"]',
        '.whatsapp-simulator',
        '[data-testid*="simulator"]',
        '[class*="simulator"]',
        '[class*="whatsapp"]',
        '[class*="demo"]'
      ];
      
      selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach(el => {
          elements.push({
            selector,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            textContent: el.textContent?.substring(0, 100)
          });
        });
      });
      
      return elements;
    });
    
    console.log('🔍 Elementos del simulador encontrados:', simulatorElements.length);
    simulatorElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName} - ${el.className} - ${el.selector}`);
    });
    
    // Verificar errores React específicos
    await page.waitForTimeout(2000);
    
    const reactErrors = await page.evaluate(() => {
      const errors = [];
      
      // Buscar errores de hidratación
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (hook.onCommitFiberRoot) {
          errors.push('React DevTools detectado');
        }
      }
      
      // Buscar errores en el DOM
      const errorElements = document.querySelectorAll('[data-reacterror], .react-error');
      errorElements.forEach(el => {
        errors.push(`Error element: ${el.outerHTML.substring(0, 200)}`);
      });
      
      return errors;
    });
    
    if (reactErrors.length > 0) {
      console.log('⚛️ Errores React detectados:');
      reactErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Ejecutar análisis de rendimiento
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        resourceCount: performance.getEntriesByType('resource').length,
        memoryUsed: performance.memory ? performance.memory.usedJSHeapSize : 'N/A'
      };
    });
    
    console.log('📊 Métricas de rendimiento:');
    console.log(`  - DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`  - Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`  - Resources Loaded: ${performanceMetrics.resourceCount}`);
    console.log(`  - Memory Used: ${performanceMetrics.memoryUsed}`);
    
    // Ejecutar tests específicos del simulador
    await page.waitForTimeout(3000);
    
    const simulatorTests = await page.evaluate(() => {
      const results = {
        conversationEngineExists: typeof window.ConversationEngine !== 'undefined',
        rxjsAvailable: typeof window.rxjs !== 'undefined' || typeof window.Observable !== 'undefined',
        framerMotionLoaded: typeof window.Motion !== 'undefined' || typeof window.motion !== 'undefined',
        errors: []
      };
      
      // Test si hay elementos de loading infinito
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
      if (loadingElements.length > 3) {
        results.errors.push(`Demasiados elementos loading: ${loadingElements.length}`);
      }
      
      // Test si hay elementos duplicados
      const allElements = document.querySelectorAll('*');
      const ids = new Map();
      allElements.forEach(el => {
        if (el.id && el.id !== '') {
          if (ids.has(el.id)) {
            results.errors.push(`ID duplicado encontrado: ${el.id}`);
          } else {
            ids.set(el.id, true);
          }
        }
      });
      
      return results;
    });
    
    console.log('🧪 Tests específicos del simulador:');
    console.log(`  - ConversationEngine disponible: ${simulatorTests.conversationEngineExists}`);
    console.log(`  - RxJS disponible: ${simulatorTests.rxjsAvailable}`);
    console.log(`  - Framer Motion cargado: ${simulatorTests.framerMotionLoaded}`);
    
    if (simulatorTests.errors.length > 0) {
      console.log('❌ Errores detectados:');
      simulatorTests.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Resumen final
    const errorCount = consoleMessages.filter(msg => msg.type === 'error').length;
    const warningCount = consoleMessages.filter(msg => msg.type === 'warn').length;
    
    console.log('\n📋 RESUMEN DE DEBUG:');
    console.log(`  - Errores de consola: ${errorCount}`);
    console.log(`  - Advertencias: ${warningCount}`);
    console.log(`  - Simulador detectado: ${simulatorExists ? 'SÍ' : 'NO'}`);
    console.log(`  - Elementos simulador: ${simulatorElements.length}`);
    console.log(`  - Errores React: ${reactErrors.length}`);
    console.log(`  - Tests fallidos: ${simulatorTests.errors.length}`);
    
    if (errorCount === 0 && simulatorExists && simulatorElements.length > 0) {
      console.log('\n✅ El simulador parece estar funcionando correctamente');
    } else {
      console.log('\n❌ Se detectaron problemas con el simulador');
    }
    
    // Mantener abierto para inspección manual
    console.log('\n🔍 Browser abierto para inspección manual. Presiona Ctrl+C para cerrar.');
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
  } catch (error) {
    console.error('💥 Error durante el debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugSimulator().catch(console.error);
}

module.exports = debugSimulator;