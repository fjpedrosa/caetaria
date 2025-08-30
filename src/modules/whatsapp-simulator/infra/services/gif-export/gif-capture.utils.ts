/**
 * GIF Capture Utilities
 * DOM capture utilities for GIF export functionality
 */

import html2canvas from 'html2canvas';
import { CaptureUtils, DeviceFrameConfig } from './types';

export class GifCaptureUtilsImpl implements CaptureUtils {
  /**
   * Capture a single frame from DOM element
   */
  async captureFrame(
    element: HTMLElement,
    options: html2canvas.Options = {}
  ): Promise<HTMLCanvasElement> {
    // Ensure element is visible and properly rendered
    this.prepareElementForCapture(element);

    // Default capture options optimized for GIF generation
    const defaultOptions: html2canvas.Options = {
      backgroundColor: null, // Transparent background
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      removeContainer: true,
      imageTimeout: 5000,
      // Optimize for performance
      foreignObjectRendering: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      ...options
    };

    try {
      const canvas = await html2canvas(element, defaultOptions);
      
      // Post-process canvas for better GIF compatibility
      return this.postProcessCanvas(canvas);
      
    } catch (error) {
      console.error('Frame capture failed:', error);
      throw new Error(`Failed to capture frame: ${error}`);
    }
  }

  /**
   * Optimize canvas for GIF encoding
   */
  optimizeCanvas(
    canvas: HTMLCanvasElement,
    quality: number
  ): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    // Create optimized canvas
    const optimizedCanvas = document.createElement('canvas');
    const optimizedCtx = optimizedCanvas.getContext('2d');
    if (!optimizedCtx) throw new Error('Cannot get optimized canvas context');

    optimizedCanvas.width = canvas.width;
    optimizedCanvas.height = canvas.height;

    // Apply quality-based optimizations
    if (quality < 0.8) {
      // Reduce color depth for lower quality
      optimizedCtx.globalCompositeOperation = 'source-over';
      optimizedCtx.filter = `contrast(${0.8 + quality * 0.2}) saturate(${0.7 + quality * 0.3})`;
    }

    optimizedCtx.drawImage(canvas, 0, 0);

    // Apply dithering for better compression
    if (quality < 0.6) {
      this.applyDithering(optimizedCtx, optimizedCanvas.width, optimizedCanvas.height);
    }

    return optimizedCanvas;
  }

  /**
   * Add device frame to canvas
   */
  addDeviceFrame(
    canvas: HTMLCanvasElement,
    config: DeviceFrameConfig
  ): HTMLCanvasElement {
    const framedCanvas = document.createElement('canvas');
    const ctx = framedCanvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get framed canvas context');

    const { dimensions, style } = config;
    
    // Set canvas dimensions to include frame
    framedCanvas.width = dimensions.width;
    framedCanvas.height = dimensions.height;

    // Draw device frame background
    this.drawDeviceFrame(ctx, dimensions, style);

    // Calculate screen area scaling
    const scaleX = dimensions.screenWidth / canvas.width;
    const scaleY = dimensions.screenHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY);

    // Center the content within the screen area
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = dimensions.screenX + (dimensions.screenWidth - scaledWidth) / 2;
    const offsetY = dimensions.screenY + (dimensions.screenHeight - scaledHeight) / 2;

    // Draw the content on the screen area
    ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);

    return framedCanvas;
  }

  /**
   * Scale canvas to target dimensions
   */
  scaleCanvas(
    canvas: HTMLCanvasElement,
    scale: number
  ): HTMLCanvasElement {
    if (scale === 1) return canvas;

    const scaledCanvas = document.createElement('canvas');
    const ctx = scaledCanvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get scaled canvas context');

    const newWidth = Math.round(canvas.width * scale);
    const newHeight = Math.round(canvas.height * scale);

    scaledCanvas.width = newWidth;
    scaledCanvas.height = newHeight;

    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = scale > 1 ? 'high' : 'medium';

    ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

    return scaledCanvas;
  }

  /**
   * Batch capture multiple frames efficiently
   */
  async batchCapture(
    element: HTMLElement,
    options: html2canvas.Options,
    frameCount: number,
    onProgress?: (captured: number, total: number) => void
  ): Promise<HTMLCanvasElement[]> {
    const frames: HTMLCanvasElement[] = [];
    const batchSize = Math.min(5, frameCount); // Capture in batches to manage memory

    for (let i = 0; i < frameCount; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, frameCount);
      const batchPromises: Promise<HTMLCanvasElement>[] = [];

      // Capture batch of frames
      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(this.captureFrame(element, options));
      }

      try {
        const batchFrames = await Promise.all(batchPromises);
        frames.push(...batchFrames);
        
        onProgress?.(frames.length, frameCount);
        
        // Small delay to prevent overwhelming the browser
        if (i + batchSize < frameCount) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
      } catch (error) {
        console.warn(`Batch capture failed for frames ${i}-${batchEnd - 1}:`, error);
        // Continue with partial results
      }
    }

    return frames;
  }

  /**
   * Create canvas from image data URL
   */
  createCanvasFromDataURL(dataURL: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });
  }

  /**
   * Convert canvas to optimized blob
   */
  async canvasToBlob(
    canvas: HTMLCanvasElement,
    quality: number = 0.8,
    format: string = 'image/png'
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        format,
        quality
      );
    });
  }

  // Private methods

  private prepareElementForCapture(element: HTMLElement): void {
    // Ensure element is visible
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      console.warn('Element is not visible, capture may fail');
    }

    // Ensure all images are loaded
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        console.warn('Image not fully loaded, may affect capture quality');
      }
    });

    // Force layout recalculation
    element.offsetHeight; // Trigger reflow
  }

  private postProcessCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Create processed canvas
    const processedCanvas = document.createElement('canvas');
    const processedCtx = processedCanvas.getContext('2d');
    if (!processedCtx) return canvas;

    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;

    // Apply post-processing filters for better GIF compatibility
    processedCtx.imageSmoothingEnabled = false; // Crisp pixels for GIF
    processedCtx.drawImage(canvas, 0, 0);

    // Remove potential artifacts
    this.removeArtifacts(processedCtx, processedCanvas.width, processedCanvas.height);

    return processedCanvas;
  }

  private drawDeviceFrame(
    ctx: CanvasRenderingContext2D,
    dimensions: DeviceFrameConfig['dimensions'],
    style: DeviceFrameConfig['style']
  ): void {
    const { width, height, screenX, screenY, screenWidth, screenHeight } = dimensions;
    const { backgroundColor, borderRadius, shadow } = style;

    // Draw shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
    }

    // Draw device body
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, borderRadius);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw screen cutout (if needed)
    if (screenX > 0 || screenY > 0 || screenWidth < width || screenHeight < height) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
    }
  }

  private applyDithering(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple Floyd-Steinberg dithering for better GIF compression
    for (let y = 0; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        // Process each color channel
        for (let c = 0; c < 3; c++) {
          const oldPixel = data[i + c];
          const newPixel = oldPixel < 128 ? 0 : 255;
          data[i + c] = newPixel;
          
          const quantError = oldPixel - newPixel;
          
          // Distribute error to neighboring pixels
          data[i + 4 + c] += quantError * 7 / 16;
          data[i + width * 4 - 4 + c] += quantError * 3 / 16;
          data[i + width * 4 + c] += quantError * 5 / 16;
          data[i + width * 4 + 4 + c] += quantError * 1 / 16;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private removeArtifacts(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    // Remove single-pixel artifacts that can cause GIF compression issues
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        // Check if this pixel is significantly different from neighbors
        let neighborSum = [0, 0, 0];
        let neighborCount = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const ni = ((y + dy) * width + (x + dx)) * 4;
            neighborSum[0] += data[ni];
            neighborSum[1] += data[ni + 1];
            neighborSum[2] += data[ni + 2];
            neighborCount++;
          }
        }
        
        // If pixel is too different from average, smooth it
        for (let c = 0; c < 3; c++) {
          const avgNeighbor = neighborSum[c] / neighborCount;
          const diff = Math.abs(data[i + c] - avgNeighbor);
          
          if (diff > 100) { // Threshold for artifact detection
            data[i + c] = Math.round(avgNeighbor);
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

/**
 * Singleton instance
 */
export const gifCaptureUtils = new GifCaptureUtilsImpl();