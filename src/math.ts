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

export { degToRad, radToDeg, polarToCartesian };
