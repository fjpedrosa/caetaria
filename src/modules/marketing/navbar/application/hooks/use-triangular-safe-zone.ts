/**
 * Hook for implementing triangular safe zone for mega menu navigation
 * Allows diagonal cursor movement without accidentally triggering other items
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface TriangleZone {
  anchor: Point;      // Menu item position
  topCorner: Point;   // Top corner of mega menu
  bottomCorner: Point; // Bottom corner of mega menu
}

export function useTriangularSafeZone(activeItemId: string | null) {
  const [isInSafeZone, setIsInSafeZone] = useState(false);
  const triangleZone = useRef<TriangleZone | null>(null);
  const cursorPosition = useRef<Point>({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check if a point is inside a triangle using barycentric coordinates
  const isPointInTriangle = useCallback((point: Point, triangle: TriangleZone): boolean => {
    const { anchor, topCorner, bottomCorner } = triangle;
    
    // Calculate barycentric coordinates
    const v0x = bottomCorner.x - anchor.x;
    const v0y = bottomCorner.y - anchor.y;
    const v1x = topCorner.x - anchor.x;
    const v1y = topCorner.y - anchor.y;
    const v2x = point.x - anchor.x;
    const v2y = point.y - anchor.y;

    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    // Check if point is in triangle
    return (u >= 0) && (v >= 0) && (u + v <= 1);
  }, []);

  // Update triangle zone when active item changes
  const updateTriangleZone = useCallback((
    itemElement: HTMLElement,
    panelElement: HTMLElement
  ) => {
    const itemRect = itemElement.getBoundingClientRect();
    const panelRect = panelElement.getBoundingClientRect();

    // Define triangle with item center as anchor and panel corners
    triangleZone.current = {
      anchor: {
        x: itemRect.left + itemRect.width / 2,
        y: itemRect.bottom
      },
      topCorner: {
        x: panelRect.left,
        y: panelRect.top
      },
      bottomCorner: {
        x: panelRect.right,
        y: panelRect.top
      }
    };
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    cursorPosition.current = { x: e.clientX, y: e.clientY };

    if (triangleZone.current) {
      const inZone = isPointInTriangle(cursorPosition.current, triangleZone.current);
      setIsInSafeZone(inZone);

      // Clear zone after a delay if cursor leaves
      if (!inZone) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          triangleZone.current = null;
          setIsInSafeZone(false);
        }, 300);
      }
    }
  }, [isPointInTriangle]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutRef.current);
    };
  }, [handleMouseMove]);

  // Clear zone when active item changes to null
  useEffect(() => {
    if (!activeItemId) {
      triangleZone.current = null;
      setIsInSafeZone(false);
    }
  }, [activeItemId]);

  return {
    isInSafeZone,
    updateTriangleZone,
    clearSafeZone: () => {
      triangleZone.current = null;
      setIsInSafeZone(false);
    }
  };
}