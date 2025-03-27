/**
 * Convert a degree to a radian
 *
 * @param deg - The degree to convert
 * @returns The radian value
 */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Convert a radian to a degree
 *
 * @param rad - The radian to convert
 * @returns The degree value
 */
function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Convert a polar coordinate to a cartesian coordinate
 *
 * @param centerX - The x coordinate of the center of the circle
 * @param centerY - The y coordinate of the center of the circle
 * @param radius - The radius of the circle
 * @param angleInDegrees - The angle in degrees
 * @returns The cartesian coordinate
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = degToRad(angleInDegrees);

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Normalize a heading to be between 1 and 360
 *
 * @param heading - The heading to normalize
 * @returns The normalized heading
 */
function normalizeHeading(heading: number) {
  heading = ((heading - 1) % 360) + 1;

  if (heading == 0) heading = 360;

  if (heading < 1) heading += 360;

  return heading;
}

/**
 * Rotates a point around a center point by a given angle
 *
 * @param point - The point to rotate
 * @param center - The center point
 * @param angle - The angle to rotate the point by
 * @returns The rotated point
 */
function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  angle: number
) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export { degToRad, radToDeg, polarToCartesian, normalizeHeading, rotatePoint };
