/**
 * Triangle Safe Zone Utility
 *
 * Implementa la lógica de zona segura triangular para mejorar la experiencia
 * de navegación en mega menús, permitiendo movimiento diagonal del cursor
 * sin perder el hover state.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface TrianglePath {
  cursor: Point;
  menuCorner1: Point;
  menuCorner2: Point;
  timestamp: number;
}

export interface SafeZoneConfig {
  enabled: boolean;
  tolerance: number; // Pixels of tolerance
  angleThreshold: number; // Max angle in degrees
  timeWindow: number; // Time window in ms for velocity calculation
}

export const DEFAULT_SAFE_ZONE_CONFIG: SafeZoneConfig = {
  enabled: true,
  tolerance: 75,
  angleThreshold: 75,
  timeWindow: 300
};

/**
 * Calculate the area of a triangle using the Shoelace formula
 * More efficient than the traditional cross-product method
 */
export function calculateTriangleArea(p1: Point, p2: Point, p3: Point): number {
  return Math.abs(
    (p1.x * (p2.y - p3.y) +
     p2.x * (p3.y - p1.y) +
     p3.x * (p1.y - p2.y)) / 2
  );
}

/**
 * Check if a point is inside a triangle using barycentric coordinates
 * This is more efficient than the sign-based method for many checks
 */
export function isPointInTriangle(point: Point, triangle: TrianglePath): boolean {
  const { cursor, menuCorner1, menuCorner2 } = triangle;

  // Calculate the area of the main triangle
  const areaMain = calculateTriangleArea(cursor, menuCorner1, menuCorner2);

  // If the area is too small, the triangle is essentially a line
  if (areaMain < 1) return false;

  // Calculate areas of sub-triangles
  const area1 = calculateTriangleArea(point, menuCorner1, menuCorner2);
  const area2 = calculateTriangleArea(cursor, point, menuCorner2);
  const area3 = calculateTriangleArea(cursor, menuCorner1, point);

  // Check if the sum of sub-triangles equals the main triangle
  // Add small epsilon for floating-point comparison
  const epsilon = 0.1;
  return Math.abs(areaMain - (area1 + area2 + area3)) < epsilon;
}

/**
 * Calculate the optimal triangle corners based on cursor movement direction
 * This creates a more natural safe zone that follows user intent
 */
export function calculateOptimalTriangle(
  cursor: Point,
  menuRect: Rectangle,
  previousCursor?: Point,
  config: SafeZoneConfig = DEFAULT_SAFE_ZONE_CONFIG
): TrianglePath {
  // Calculate cursor velocity if we have previous position
  let velocityX = 0;
  let velocityY = 0;

  if (previousCursor) {
    velocityX = cursor.x - previousCursor.x;
    velocityY = cursor.y - previousCursor.y;
  }

  // Determine which corners to use based on cursor position and velocity
  let corner1: Point;
  let corner2: Point;

  // If cursor is moving right, use left corners of menu
  // If moving left, use right corners
  const movingRight = velocityX > 0 || (!previousCursor && cursor.x < menuRect.left);

  if (movingRight) {
    // User is likely moving from left to right
    corner1 = { x: menuRect.left, y: menuRect.top - config.tolerance };
    corner2 = { x: menuRect.left, y: menuRect.bottom + config.tolerance };
  } else {
    // User is likely moving from right to left
    corner1 = { x: menuRect.right, y: menuRect.top - config.tolerance };
    corner2 = { x: menuRect.right, y: menuRect.bottom + config.tolerance };
  }

  // Adjust corners based on cursor Y position for better coverage
  const cursorYRatio = (cursor.y - menuRect.top) / menuRect.height;

  if (cursorYRatio < 0.3) {
    // Cursor is near top, expand top corner
    corner1.y -= config.tolerance * 0.5;
  } else if (cursorYRatio > 0.7) {
    // Cursor is near bottom, expand bottom corner
    corner2.y += config.tolerance * 0.5;
  }

  return {
    cursor,
    menuCorner1: corner1,
    menuCorner2: corner2,
    timestamp: Date.now()
  };
}

/**
 * Calculate the angle between cursor movement and menu direction
 * Used to determine if user is intentionally moving towards the menu
 */
export function calculateMovementAngle(
  currentPos: Point,
  previousPos: Point,
  menuCenter: Point
): number {
  // Calculate movement vector
  const moveX = currentPos.x - previousPos.x;
  const moveY = currentPos.y - previousPos.y;

  // Calculate vector from current position to menu center
  const toMenuX = menuCenter.x - currentPos.x;
  const toMenuY = menuCenter.y - currentPos.y;

  // Calculate magnitudes
  const moveMagnitude = Math.sqrt(moveX * moveX + moveY * moveY);
  const toMenuMagnitude = Math.sqrt(toMenuX * toMenuX + toMenuY * toMenuY);

  // Avoid division by zero
  if (moveMagnitude === 0 || toMenuMagnitude === 0) return 90;

  // Calculate dot product and angle
  const dotProduct = (moveX * toMenuX + moveY * toMenuY);
  const cosAngle = dotProduct / (moveMagnitude * toMenuMagnitude);

  // Clamp to valid range for acos
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));

  // Return angle in degrees
  return Math.acos(clampedCos) * (180 / Math.PI);
}

/**
 * Determine if cursor is likely heading towards the menu
 * based on movement history and angle
 */
export function isMovingTowardsMenu(
  currentPos: Point,
  previousPositions: Point[],
  menuRect: Rectangle,
  config: SafeZoneConfig = DEFAULT_SAFE_ZONE_CONFIG
): boolean {
  if (previousPositions.length < 2) return false;

  const menuCenter: Point = {
    x: menuRect.left + menuRect.width / 2,
    y: menuRect.top + menuRect.height / 2
  };

  // Check angle for last few positions
  let angleSum = 0;
  let validAngles = 0;

  for (let i = 1; i < Math.min(previousPositions.length, 4); i++) {
    const angle = calculateMovementAngle(
      currentPos,
      previousPositions[previousPositions.length - i],
      menuCenter
    );

    if (angle <= config.angleThreshold) {
      angleSum += angle;
      validAngles++;
    }
  }

  // Consider moving towards menu if average angle is below threshold
  return validAngles > 0 && (angleSum / validAngles) < config.angleThreshold;
}

/**
 * Enhanced safe zone check with multiple factors
 */
export function isInEnhancedSafeZone(
  cursor: Point,
  triangle: TrianglePath,
  menuRect: Rectangle,
  previousPositions: Point[],
  config: SafeZoneConfig = DEFAULT_SAFE_ZONE_CONFIG
): boolean {
  if (!config.enabled) return false;

  // Check if cursor is inside the triangle
  const inTriangle = isPointInTriangle(cursor, triangle);

  // Check if cursor is moving towards the menu
  const movingTowards = isMovingTowardsMenu(cursor, previousPositions, menuRect, config);

  // Check if triangle is still fresh (within time window)
  const triangleAge = Date.now() - triangle.timestamp;
  const isFresh = triangleAge < config.timeWindow;

  // Enhanced logic: in safe zone if either:
  // 1. Inside triangle AND fresh
  // 2. Moving towards menu with good angle
  return (inTriangle && isFresh) || movingTowards;
}

/**
 * Create an invisible bridge element between trigger and menu
 * for additional hover stability
 */
export function createHoverBridge(
  triggerRect: Rectangle,
  menuRect: Rectangle
): {
  position: 'absolute';
  left: string;
  top: string;
  width: string;
  height: string;
  pointerEvents: 'none';
  zIndex: number;
} {
  // Calculate bridge dimensions
  const bridgeLeft = Math.min(triggerRect.left, menuRect.left);
  const bridgeTop = Math.min(triggerRect.bottom, menuRect.top);
  const bridgeRight = Math.max(triggerRect.right, menuRect.right);
  const bridgeBottom = Math.max(triggerRect.bottom, menuRect.top);

  return {
    position: 'absolute',
    left: `${bridgeLeft}px`,
    top: `${bridgeTop}px`,
    width: `${bridgeRight - bridgeLeft}px`,
    height: `${bridgeBottom - bridgeTop}px`,
    pointerEvents: 'none',
    zIndex: 49 // Just below the menu
  };
}

/**
 * Smooth cursor path with requestAnimationFrame
 * for better performance tracking
 */
export class CursorTracker {
  private positions: Point[] = [];
  private maxPositions = 10;
  private animationId: number | null = null;
  private lastUpdate = 0;
  private updateInterval = 16; // ~60fps

  constructor(maxPositions = 10) {
    this.maxPositions = maxPositions;
  }

  start(onUpdate?: (positions: Point[]) => void) {
    const track = (timestamp: number) => {
      if (timestamp - this.lastUpdate >= this.updateInterval) {
        this.lastUpdate = timestamp;
        onUpdate?.(this.positions);
      }
      this.animationId = requestAnimationFrame(track);
    };

    this.animationId = requestAnimationFrame(track);
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  addPosition(point: Point) {
    this.positions.push(point);
    if (this.positions.length > this.maxPositions) {
      this.positions.shift();
    }
  }

  getPositions(): Point[] {
    return [...this.positions];
  }

  getLatest(): Point | undefined {
    return this.positions[this.positions.length - 1];
  }

  getPrevious(): Point | undefined {
    return this.positions[this.positions.length - 2];
  }

  clear() {
    this.positions = [];
  }

  getVelocity(): Point {
    if (this.positions.length < 2) return { x: 0, y: 0 };

    const current = this.positions[this.positions.length - 1];
    const previous = this.positions[this.positions.length - 2];

    return {
      x: current.x - previous.x,
      y: current.y - previous.y
    };
  }

  getAverageVelocity(samples = 3): Point {
    if (this.positions.length < 2) return { x: 0, y: 0 };

    const sampleCount = Math.min(samples, this.positions.length - 1);
    let totalX = 0;
    let totalY = 0;

    for (let i = 0; i < sampleCount; i++) {
      const idx = this.positions.length - 1 - i;
      if (idx > 0) {
        totalX += this.positions[idx].x - this.positions[idx - 1].x;
        totalY += this.positions[idx].y - this.positions[idx - 1].y;
      }
    }

    return {
      x: totalX / sampleCount,
      y: totalY / sampleCount
    };
  }
}