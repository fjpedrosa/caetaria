/**
 * GIF Optimization Utilities
 * Compression and optimization utilities for GIF export
 */

import { ExportOptions, Frame,OptimizationUtils } from './types';

export class GifOptimizationUtilsImpl implements OptimizationUtils {
  /**
   * Calculate optimal settings based on content and constraints
   */
  calculateOptimalSettings(
    element: HTMLElement,
    constraints: {
      maxFileSize?: number; // in bytes
      maxDuration?: number; // in seconds
      targetQuality?: number; // 0.1-1.0
    }
  ): ExportOptions {
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;

    // Base settings
    let quality = constraints.targetQuality || 0.7;
    let frameRate = 15;
    let duration = Math.min(constraints.maxDuration || 20, 30);
    let scale = 1.0;

    // Adjust based on element size
    if (area > 800000) { // Very large (>800k pixels)
      quality = Math.min(quality, 0.5);
      frameRate = 10;
      scale = 0.6;
    } else if (area > 400000) { // Large (>400k pixels)
      quality = Math.min(quality, 0.6);
      frameRate = 12;
      scale = 0.7;
    } else if (area > 200000) { // Medium (>200k pixels)
      quality = Math.min(quality, 0.7);
      frameRate = 15;
      scale = 0.8;
    }

    // Mobile device optimization
    if (this.isMobileDevice()) {
      quality = Math.min(quality, 0.6);
      frameRate = Math.min(frameRate, 12);
      scale = Math.min(scale, 0.8);
      duration = Math.min(duration, 15);
    }

    // Memory constraints
    const availableMemory = this.getAvailableMemory();
    if (availableMemory < 500) { // Less than 500MB
      quality = Math.min(quality, 0.5);
      frameRate = Math.min(frameRate, 10);
      scale = Math.min(scale, 0.6);
      duration = Math.min(duration, 10);
    }

    // File size constraints
    if (constraints.maxFileSize) {
      const estimatedFrames = duration * frameRate;
      const estimatedSizePerFrame = (area * scale * scale * quality) / 1000; // rough estimate
      const estimatedTotalSize = estimatedFrames * estimatedSizePerFrame;

      if (estimatedTotalSize > constraints.maxFileSize) {
        const reductionFactor = constraints.maxFileSize / estimatedTotalSize;
        quality *= Math.sqrt(reductionFactor);
        frameRate = Math.max(5, Math.floor(frameRate * reductionFactor));
        scale *= Math.sqrt(reductionFactor);
      }
    }

    // Ensure values are within valid ranges
    quality = Math.max(0.1, Math.min(1.0, quality));
    frameRate = Math.max(5, Math.min(30, frameRate));
    duration = Math.max(5, Math.min(60, duration));
    scale = Math.max(0.5, Math.min(2.0, scale));

    return {
      quality,
      frameRate,
      duration,
      scale,
      delay: Math.round(1000 / frameRate),
      includeDeviceFrame: false,
      format: {
        type: 'gif',
        compression: Math.round((1 - quality) * 80 + 20), // 20-100
        optimize: true,
        dither: quality > 0.7 ? 'floyd-steinberg' : 'ordered'
      }
    };
  }

  /**
   * Compress GIF blob using various techniques
   */
  async compressGif(
    blob: Blob,
    compressionLevel: number // 0-100
  ): Promise<Blob> {
    if (compressionLevel === 0) return blob;

    try {
      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Apply various compression techniques
      const compressed = this.applyGifCompression(uint8Array, compressionLevel);

      return new Blob([compressed], { type: 'image/gif' });
    } catch (error) {
      console.warn('GIF compression failed, returning original:', error);
      return blob;
    }
  }

  /**
   * Analyze frame differences for optimization
   */
  analyzeFrames(frames: Frame[]): {
    duplicateFrames: number[];
    optimalFrameRate: number;
    recommendedQuality: number;
  } {
    if (frames.length === 0) {
      return {
        duplicateFrames: [],
        optimalFrameRate: 15,
        recommendedQuality: 0.7
      };
    }

    // Find duplicate or nearly identical frames
    const duplicateFrames = this.findDuplicateFrames(frames);

    // Analyze motion between frames
    const motionAnalysis = this.analyzeMotion(frames);

    // Calculate optimal frame rate based on motion
    const optimalFrameRate = this.calculateOptimalFrameRate(motionAnalysis);

    // Recommend quality based on content complexity
    const recommendedQuality = this.calculateRecommendedQuality(frames);

    return {
      duplicateFrames,
      optimalFrameRate,
      recommendedQuality
    };
  }

  /**
   * Optimize color palette for better compression
   */
  optimizeColorPalette(
    frames: Frame[],
    maxColors: number = 256
  ): Frame[] {
    if (frames.length === 0) return frames;

    // Collect all unique colors across frames
    const colorMap = new Map<string, number>();

    frames.forEach(frame => {
      const colors = this.extractColors(frame.canvas);
      colors.forEach(color => {
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
      });
    });

    // Select most frequent colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors)
      .map(([color]) => color);

    // Apply optimized palette to all frames
    return frames.map(frame => ({
      ...frame,
      canvas: this.applyColorPalette(frame.canvas, sortedColors)
    }));
  }

  /**
   * Remove redundant frames to reduce file size
   */
  removeRedundantFrames(
    frames: Frame[],
    threshold: number = 0.95 // Similarity threshold
  ): Frame[] {
    if (frames.length <= 1) return frames;

    const optimizedFrames: Frame[] = [frames[0]]; // Always keep first frame

    for (let i = 1; i < frames.length; i++) {
      const similarity = this.calculateFrameSimilarity(
        frames[i - 1].canvas,
        frames[i].canvas
      );

      if (similarity < threshold) {
        optimizedFrames.push(frames[i]);
      } else {
        // Extend delay of last kept frame
        const lastFrame = optimizedFrames[optimizedFrames.length - 1];
        lastFrame.delay += frames[i].delay;
      }
    }

    return optimizedFrames;
  }

  /**
   * Estimate final file size
   */
  estimateFileSize(frames: Frame[], options: ExportOptions): number {
    if (frames.length === 0) return 0;

    const avgCanvas = frames[0].canvas;
    const pixelCount = avgCanvas.width * avgCanvas.height;

    // Base size calculation
    let baseSize = pixelCount * 0.5; // Rough estimate for GIF compression

    // Adjust for quality
    baseSize *= options.quality;

    // Adjust for number of frames
    baseSize *= frames.length;

    // Adjust for compression level
    if (options.format?.compression) {
      baseSize *= (100 - options.format.compression) / 100;
    }

    // Add GIF headers and metadata (rough estimate)
    const overhead = 1024 + (frames.length * 50);

    return Math.round(baseSize + overhead);
  }

  /**
   * Adaptive quality adjustment based on content
   */
  adaptiveQualityAdjustment(
    frames: Frame[],
    targetFileSize: number,
    currentOptions: ExportOptions
  ): ExportOptions {
    const estimatedSize = this.estimateFileSize(frames, currentOptions);

    if (estimatedSize <= targetFileSize) {
      return currentOptions; // No adjustment needed
    }

    const reductionRatio = targetFileSize / estimatedSize;
    const adjustedOptions = { ...currentOptions };

    // Reduce quality first
    adjustedOptions.quality *= Math.sqrt(reductionRatio);
    adjustedOptions.quality = Math.max(0.1, adjustedOptions.quality);

    // If still too large, reduce frame rate
    if (reductionRatio < 0.5) {
      adjustedOptions.frameRate *= reductionRatio;
      adjustedOptions.frameRate = Math.max(5, Math.round(adjustedOptions.frameRate));
    }

    // If still too large, reduce scale
    if (reductionRatio < 0.25) {
      adjustedOptions.scale *= Math.sqrt(reductionRatio);
      adjustedOptions.scale = Math.max(0.5, adjustedOptions.scale);
    }

    return adjustedOptions;
  }

  // Private methods

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private getAvailableMemory(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.totalJSHeapSize - memory.usedJSHeapSize) / (1024 * 1024); // MB
    }
    return 1000; // Default assumption
  }

  private applyGifCompression(data: Uint8Array, level: number): Uint8Array {
    // This is a simplified compression - in a real implementation,
    // you might use a proper GIF compression library

    if (level === 0) return data;

    // Simple byte-level compression (placeholder)
    const compressed = new Uint8Array(data.length);
    let writeIndex = 0;

    for (let i = 0; i < data.length; i++) {
      // Skip some bytes based on compression level (very basic)
      if (Math.random() * 100 > level) {
        compressed[writeIndex++] = data[i];
      }
    }

    return compressed.slice(0, writeIndex);
  }

  private findDuplicateFrames(frames: Frame[]): number[] {
    const duplicates: number[] = [];
    const threshold = 0.98; // Similarity threshold for considering frames as duplicates

    for (let i = 1; i < frames.length; i++) {
      const similarity = this.calculateFrameSimilarity(
        frames[i - 1].canvas,
        frames[i].canvas
      );

      if (similarity > threshold) {
        duplicates.push(i);
      }
    }

    return duplicates;
  }

  private calculateFrameSimilarity(canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): number {
    if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
      return 0;
    }

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    if (!ctx1 || !ctx2) return 0;

    const data1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height).data;
    const data2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data;

    let differences = 0;
    const sampleSize = Math.min(data1.length, 10000); // Sample for performance
    const step = Math.floor(data1.length / sampleSize);

    for (let i = 0; i < data1.length; i += step) {
      if (Math.abs(data1[i] - data2[i]) > 10) { // Threshold for pixel difference
        differences++;
      }
    }

    return 1 - (differences / (sampleSize / 4)); // Normalize to 0-1
  }

  private analyzeMotion(frames: Frame[]): { averageMotion: number; motionVariance: number } {
    if (frames.length < 2) {
      return { averageMotion: 0, motionVariance: 0 };
    }

    const motionScores: number[] = [];

    for (let i = 1; i < frames.length; i++) {
      const motion = 1 - this.calculateFrameSimilarity(frames[i - 1].canvas, frames[i].canvas);
      motionScores.push(motion);
    }

    const averageMotion = motionScores.reduce((a, b) => a + b, 0) / motionScores.length;
    const variance = motionScores.reduce((sum, score) => sum + Math.pow(score - averageMotion, 2), 0) / motionScores.length;

    return { averageMotion, motionVariance: variance };
  }

  private calculateOptimalFrameRate(motionAnalysis: { averageMotion: number; motionVariance: number }): number {
    const { averageMotion, motionVariance } = motionAnalysis;

    // High motion = higher frame rate needed
    let frameRate = 10 + (averageMotion * 20);

    // High variance = need consistent frame rate
    if (motionVariance > 0.1) {
      frameRate = Math.min(frameRate + 5, 30);
    }

    return Math.max(5, Math.min(30, Math.round(frameRate)));
  }

  private calculateRecommendedQuality(frames: Frame[]): number {
    if (frames.length === 0) return 0.7;

    // Analyze first frame for complexity
    const canvas = frames[0].canvas;
    const complexity = this.calculateImageComplexity(canvas);

    // Higher complexity = higher quality needed for good results
    let quality = 0.4 + (complexity * 0.5);

    // Adjust based on frame count
    if (frames.length > 100) {
      quality = Math.min(quality, 0.6); // Reduce quality for long animations
    }

    return Math.max(0.1, Math.min(1.0, quality));
  }

  private calculateImageComplexity(canvas: HTMLCanvasElement): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0.5;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate edge density as a measure of complexity
    let edgeCount = 0;
    const threshold = 30;

    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const i = (y * canvas.width + x) * 4;

        const intensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const rightIntensity = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        const bottomIntensity = (data[i + canvas.width * 4] + data[i + canvas.width * 4 + 1] + data[i + canvas.width * 4 + 2]) / 3;

        if (Math.abs(intensity - rightIntensity) > threshold || Math.abs(intensity - bottomIntensity) > threshold) {
          edgeCount++;
        }
      }
    }

    // Normalize edge density
    const totalPixels = canvas.width * canvas.height;
    return Math.min(1.0, edgeCount / (totalPixels * 0.1));
  }

  private extractColors(canvas: HTMLCanvasElement): string[] {
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colors = new Set<string>();

    // Sample colors (not every pixel for performance)
    const step = Math.max(1, Math.floor(data.length / 10000));

    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a > 0) { // Skip fully transparent pixels
        colors.add(`rgba(${r},${g},${b},${a})`);
      }
    }

    return Array.from(colors);
  }

  private applyColorPalette(canvas: HTMLCanvasElement, palette: string[]): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Parse palette colors
    const paletteRGB = palette.map(color => {
      const match = color.match(/rgba?\((\d+),(\d+),(\d+)(?:,(\d+))?\)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
    });

    // Map each pixel to closest palette color
    for (let i = 0; i < data.length; i += 4) {
      const pixel = [data[i], data[i + 1], data[i + 2]];
      const closestColor = this.findClosestColor(pixel, paletteRGB);

      data[i] = closestColor[0];
      data[i + 1] = closestColor[1];
      data[i + 2] = closestColor[2];
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private findClosestColor(pixel: number[], palette: number[][]): number[] {
    let minDistance = Infinity;
    let closestColor = palette[0];

    for (const color of palette) {
      const distance = Math.sqrt(
        Math.pow(pixel[0] - color[0], 2) +
        Math.pow(pixel[1] - color[1], 2) +
        Math.pow(pixel[2] - color[2], 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor;
  }
}

/**
 * Singleton instance
 */
export const gifOptimizationUtils = new GifOptimizationUtilsImpl();