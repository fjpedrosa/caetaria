#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...');

// Check if we're in production
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Build optimization is only recommended for production builds');
}

async function optimizeBuild() {
  try {
    // 1. Analyze bundle
    console.log('📊 Analyzing bundle size...');
    if (process.env.ANALYZE === 'true') {
      execSync('npm run build', { stdio: 'inherit' });
    }

    // 2. Check for unused dependencies
    console.log('🔍 Checking for unused dependencies...');
    try {
      execSync('npx depcheck', { stdio: 'inherit' });
    } catch (error) {
      console.log('📦 Consider installing depcheck: npm install -g depcheck');
    }

    // 3. Optimize images in public directory
    console.log('🖼️  Optimizing images...');
    await optimizeImages();

    // 4. Check for large files
    console.log('📏 Checking for large files...');
    checkLargeFiles();

    // 5. Generate performance report
    console.log('📈 Generating performance tips...');
    generatePerformanceTips();

    console.log('✅ Build optimization completed!');
    
  } catch (error) {
    console.error('❌ Build optimization failed:', error.message);
    process.exit(1);
  }
}

async function optimizeImages() {
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.log('📁 No public directory found');
    return;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  
  function findImages(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...findImages(fullPath));
      } else if (imageExtensions.includes(path.extname(item.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  const images = findImages(publicDir);
  
  console.log(`📸 Found ${images.length} images to analyze`);
  
  for (const imagePath of images) {
    const stats = fs.statSync(imagePath);
    const sizeKB = Math.round(stats.size / 1024);
    
    if (sizeKB > 500) {
      console.log(`⚠️  Large image detected: ${path.relative(process.cwd(), imagePath)} (${sizeKB}KB)`);
      console.log('   Consider optimizing with tools like:');
      console.log('   - https://tinypng.com/');
      console.log('   - https://squoosh.app/');
      console.log('   - imagemin or sharp packages');
    }
  }
}

function checkLargeFiles() {
  const nextDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(nextDir)) {
    console.log('📁 No .next directory found - run build first');
    return;
  }

  const staticDir = path.join(nextDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    return;
  }

  function findLargeFiles(dir, threshold = 500 * 1024) { // 500KB threshold
    const largeFiles = [];
    
    function scan(currentDir) {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          scan(fullPath);
        } else {
          const stats = fs.statSync(fullPath);
          if (stats.size > threshold) {
            largeFiles.push({
              path: path.relative(process.cwd(), fullPath),
              size: Math.round(stats.size / 1024),
            });
          }
        }
      }
    }
    
    scan(dir);
    return largeFiles;
  }

  const largeFiles = findLargeFiles(staticDir);
  
  if (largeFiles.length > 0) {
    console.log('📦 Large files detected:');
    largeFiles.forEach(file => {
      console.log(`   ${file.path} (${file.size}KB)`);
    });
    console.log('   Consider code splitting or lazy loading for large chunks');
  } else {
    console.log('✅ No large files detected');
  }
}

function generatePerformanceTips() {
  console.log('\n🎯 Performance Optimization Tips:');
  console.log('');
  console.log('1. 🖼️  Image Optimization:');
  console.log('   - Use Next.js Image component for automatic optimization');
  console.log('   - Prefer WebP/AVIF formats when possible');
  console.log('   - Add appropriate alt text for accessibility');
  console.log('');
  console.log('2. 📦 Bundle Optimization:');
  console.log('   - Use dynamic imports for heavy components');
  console.log('   - Enable compression in next.config.js');
  console.log('   - Remove unused dependencies');
  console.log('');
  console.log('3. 🚀 Loading Performance:');
  console.log('   - Implement proper Suspense boundaries');
  console.log('   - Use appropriate loading states');
  console.log('   - Preload critical resources');
  console.log('');
  console.log('4. 📊 Monitoring:');
  console.log('   - Track Core Web Vitals');
  console.log('   - Use Lighthouse for performance auditing');
  console.log('   - Monitor real user metrics');
  console.log('');
  console.log('5. 💾 Caching:');
  console.log('   - Configure appropriate cache headers');
  console.log('   - Use service workers for offline support');
  console.log('   - Implement stale-while-revalidate strategies');
  console.log('');
  console.log('Run with ANALYZE=true npm run build to analyze bundle');
  console.log('');
}

// Run optimization
if (require.main === module) {
  optimizeBuild();
}

module.exports = { optimizeBuild };