/**
 * Convert a degree value to a radian value
 *
 * @param deg - The degree value to convert
 * @returns The radian value
 */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Convert a radian value to a degree value
 *
 * @param rad - The radian value to convert
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

  if (heading < 1) heading += 360;

  return heading;
}

/**
 * Calculate the density of the air at a given altitude.
 *
 * Based on an analysis of the NASA standard atmosphere of 1976.
 *
 * @param altitude - The altitude in feet
 * @returns The density of the air at the given altitude. Units are kg/m^3
 */
function calculateDensity(altitude: number): number {
  return (
    1.22 +
    -3.39 * Math.pow(10, -5) * altitude +
    2.8 * Math.pow(10, -10) * Math.pow(altitude, 2)
  );
}

/**
 * Calculate the true airspeed (KTAS) from the equivalent airspeed (KEAS) at a given altitude.
 *
 * @param keas - The equivalent airspeed in knots
 * @param altitude - The altitude in feet
 * @returns The true airspeed in knots
 */
function calculateKTAS(keas: number, altitude: number): number {
  return Math.round(keas * Math.sqrt(1.225 / calculateDensity(altitude)));
}

function calculateMachNumber(keas: number, altitude: number): number {
  return (
    calculateKTAS(keas, altitude) /
    ((-1.2188 * (altitude / 1000) + 341.59) * 1.944)
  );
}

function calculateGsAtBankAngle(bankAngle: number): number {
  return 1 / Math.cos(degToRad(Math.abs(bankAngle)));
}

/**
 * Calculate the wind corrected course from the true airspeed, heading, wind direction, and wind speed.
 *
 * @param ktas - The true airspeed in knots
 * @param heading - The heading in degrees
 * @param windDirectionCardinal - The wind direction in degrees
 * @param windSpeed - The wind speed in knots
 * @returns The wind corrected course in degrees
 */
function calculateWindCorrectedCourse(ktas: number, heading: number, windDirectionCardinal: number, windSpeed: number): number {
  let windDirectionToCardinal = windDirectionCardinal + 180;
  let windDirectionToRadians = degToRad(windDirectionToCardinal);
  let headingRadians = degToRad(heading);

  let tasNorth = ktas * Math.cos(headingRadians);
  let tasEast = ktas * Math.sin(headingRadians);

  let windNorth = windSpeed * Math.cos(windDirectionToRadians);
  let windEast = windSpeed * Math.sin(windDirectionToRadians);  

  let groundSpeedNorth = tasNorth + windNorth;
  let groundSpeedEast = tasEast + windEast;

  let courseRadians = Math.atan2(groundSpeedEast, groundSpeedNorth);
  let courseDegrees = radToDeg(courseRadians);

  let courseNormalized = normalizeHeading(courseDegrees);

  return courseNormalized;
}

/**
 * Calculate the ground speed from the true airspeed, heading, wind direction, and wind speed.
 *
 * @param ktas - The true airspeed in knots
 * @param heading - The heading in degrees
 * @param windDirectionCardinal - The wind direction in degrees
 * @param windSpeed - The wind speed in knots
 * @returns The ground speed in knots
 */
function calculateGroundSpeed(ktas: number, heading: number, windDirectionCardinal: number, windSpeed: number): number {
  let windDirectionToCardinal = windDirectionCardinal + 180;
  let windDirectionToRadians = degToRad(windDirectionToCardinal);
  let headingRadians = degToRad(heading);

  let tasNorth = ktas * Math.cos(headingRadians);
  let tasEast = ktas * Math.sin(headingRadians);

  let windNorth = windSpeed * Math.cos(windDirectionToRadians);
  let windEast = windSpeed * Math.sin(windDirectionToRadians);  

  let groundSpeedNorth = tasNorth + windNorth;
  let groundSpeedEast = tasEast + windEast;

  let groundSpeed = Math.sqrt(Math.pow(groundSpeedNorth, 2) + Math.pow(groundSpeedEast, 2));

  return Math.round(groundSpeed);
}

/**
 * Calculate the vertical speed from the ground speed and the gamma angle.
 *  
 * @param groundSpeed - The ground speed in knots
 * @param gamma - The gamma angle in degrees
 * @returns The vertical speed in feet per minute
 */
function calculateVerticalSpeed(groundSpeed: number, gamma: number): number {
  return Math.round(groundSpeed * Math.tan(degToRad(gamma)) * 101.27);
}

export {
  degToRad,
  polarToCartesian,
  normalizeHeading,
  calculateDensity,
  calculateKTAS,
  calculateMachNumber,
  calculateGsAtBankAngle,
  calculateWindCorrectedCourse,
  calculateGroundSpeed,
  calculateVerticalSpeed,
};
