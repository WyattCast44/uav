import { degToRad, radToDeg } from "./math";
import {
  Knots,
  Feet,
  Gravity,
  CardinalDegree,
  Acceleration,
  Environment,
  Degrees,
} from "./support";

class UAVDynamics {
  rollRate: number;
  rollRateCompensator: number;

  constructor(rollRate: number, rollRateCompensator: number) {
    this.rollRate = rollRate;
    this.rollRateCompensator = rollRateCompensator;
  }

  get effectiveRollRate(): number {
    return this.rollRate * this.rollRateCompensator;
  }
}

class UAVLimits {
  maxBankAngle: number;
  maxLoadFactor: number;

  constructor(maxBankAngle: number, maxLoadFactor: number) {
    this.maxBankAngle = maxBankAngle;
    this.maxLoadFactor = maxLoadFactor;
  }
}

enum UAVControlMode {
  MANUAL = "manual",
  AUTOPILOT = "autopilot",
  MSN = "msn",
}

class UAV {
  dynamics: UAVDynamics = new UAVDynamics(10, 1);
  limits: UAVLimits = new UAVLimits(60, 8);
  tailNumber: string = "";

  setTailNumber(tailNumber: string) {
    this.tailNumber = tailNumber;
  }
}

class UAVState {
  uav: UAV;

  /**
   * The heading of the UAV. This is the direction the UAV is facing.
   *
   * 0 is North
   * 360 is North
   *
   * Will be in cardinal degrees.
   *
   * Units: degrees
   */
  heading: CardinalDegree = new CardinalDegree(360);

  /**
   * The equivalent airspeed of the UAV. This is the speed of the UAV relative to the air.
   *
   * Units: knots
   */
  keas: Knots = new Knots(0);

  /**
   * The altitude of the UAV. This is the height of the UAV above the ground.
   *
   * Units: feet
   */
  altitude: Feet = new Feet(0);

  /**
   * The flight path angle of the UAV. This is the angle between the UAV's flight path and the horizontal. Will be in degrees. Positive is up. Negative is down.
   *
   * Units: degrees
   */
  gamma: Degrees = new Degrees(0);

  /**
   * The bank angle of the UAV. This is the angle between the UAV's wings and the horizontal. Will be in degrees.
   *
   * Positive is right wing down. Negative is left wing down.
   *
   * Units: degrees
   */
  bank: Degrees = new Degrees(0);

  /**
   * |---------------------------
   * | Performance Values
   * |---------------------------
   */

  /**
   * The true airspeed of the UAV. This is the speed of the UAV relative to the air.
   *
   * Units: knots
   */
  ktas: Knots = new Knots(0);

  /**
   * The mach number of the UAV. This is the speed of the UAV relative to the speed of sound.
   *
   * Units: unitless
   */
  mach: number = 0;

  /**
   * The ground speed of the UAV. This is the speed of the UAV relative to the ground.
   *
   * Units: knots
   */
  groundSpeed: Knots = new Knots(0);

  /**
   * The course of the UAV. This is the direction the UAV is heading.
   *
   * Units: degrees cardinal
   */
  course: CardinalDegree = new CardinalDegree(0);

  /**
   * The load factor of the UAV. This is the ratio of the lift force to the weight of the UAV.
   *
   * Aka "g-force"
   *
   * Units: unitless
   */
  loadFactor: number = 0;

  /**
   * The gravity experienced by the UAV.
   *
   * This is the gravity that the UAV is experiencing due to the Earth's gravity at the UAV's altitude.
   *
   * Defaults to gravity at sea level.
   *
   * Units: Acceleration
   */
  experiencedGravity: Acceleration = Gravity.ftPerSecondSquaredAtSeaLevel;

  /**
   * The turn rate of the UAV. This is the rate at which the UAV is turning.
   *
   * Units: degrees per second
   */
  turnRate: number = 0;

  /**
   * The turn radius of the UAV. This is the radius of the circle that the UAV is turning.
   *
   * DOES NOT account for wind
   *
   * Units: feet
   */
  turnRadius: Feet = new Feet(0);

  /**
   * The vertical velocity of the UAV. This is the velocity of the UAV in the vertical direction.
   *
   * Units: feet per minute
   */
  verticalVelocity: number = 0;

  controlMode: UAVControlMode = UAVControlMode.MANUAL;

  constructor(uav: UAV) {
    this.uav = uav;
  }

  setIntialAttitude({
    heading,
    keas,
    altitude,
    gamma,
    bank,
  }: {
    heading: number | CardinalDegree;
    keas: number | Knots;
    altitude: number | Feet;
    gamma: number | Degrees;
    bank: number | Degrees;
  }) {
    this.heading =
      heading instanceof CardinalDegree ? heading : new CardinalDegree(heading);
    this.keas = keas instanceof Knots ? keas : new Knots(keas);
    this.altitude = altitude instanceof Feet ? altitude : new Feet(altitude);
    this.gamma = gamma instanceof Degrees ? gamma : new Degrees(gamma);
    this.bank = bank instanceof Degrees ? bank : new Degrees(bank);
  }

  /**
   * Update the performance values of the UAV.
   *
   * @param environment - The environment of the UAV.
   */
  updatePerformanceValues(environment: Environment) {
    this.ktas = this.#calculateTrueAirspeed(environment);
    this.mach = this.#calculateMachNumber();
    this.groundSpeed = this.#calculateGroundSpeed(environment);
    this.course = this.#calculateCourse(environment);
    this.loadFactor = this.#calculateLoadFactor();
    this.experiencedGravity = this.#calculateExperiencedGravity();
    this.turnRate = this.#calculateTurnRate();
    this.turnRadius = this.#calculateTurnRadius();
    this.verticalVelocity = this.#calculateVerticalVelocity();
  }

  /**
   * Calculate the true airspeed of the UAV.
   *
   * @param environment - The environment of the UAV.
   *
   * @references keas - The equivalent airspeed of the UAV in knots.
   * @references altitude - The altitude of the UAV in feet.
   *
   * @returns The true airspeed of the UAV. Units are knots.
   */
  #calculateTrueAirspeed(environment: Environment): Knots {
    return new Knots(
      Math.round(
        this.keas.knots *
          Math.sqrt(
            1.225 / environment.estimateAirDensityAtAltitude(this.altitude)
          )
      )
    );
  }

  /**
   * Calculate the mach number of the UAV.
   *
   * @param environment - The environment of the UAV.
   *
   * @references keas - The equivalent airspeed of the UAV in knots.
   * @references altitude - The altitude of the UAV in feet.
   *
   * @returns The mach number of the UAV. Units are unitless.
   */
  #calculateMachNumber(): number {
    return parseFloat(
      (
        this.ktas.knots /
        ((-1.2188 * (this.altitude.feet / 1000) + 341.59) * 1.944)
      ).toFixed(2)
    );
  }

  /**
   * Calculate the ground speed of the UAV.
   *
   * @param environment - The environment of the UAV.
   *
   * @references ktas - The true airspeed of the UAV in knots.
   * @references heading - The heading of the UAV in degrees.
   *
   * @returns The ground speed of the UAV. Units are knots.
   */
  #calculateGroundSpeed(environment: Environment): Knots {
    let ktasNorth = this.ktas.knots * Math.cos(this.heading.radians);
    let ktasEast = this.ktas.knots * Math.sin(this.heading.radians);

    let windNorth = environment.wind.windNorthComponent;
    let windEast = environment.wind.windEastComponent;

    let groundSpeedNorth = ktasNorth + windNorth.knots;
    let groundSpeedEast = ktasEast + windEast.knots;

    let groundSpeed = Math.sqrt(
      Math.pow(groundSpeedNorth, 2) + Math.pow(groundSpeedEast, 2)
    );

    return new Knots(Math.round(groundSpeed));
  }

  /**
   * Calculate the course of the UAV.
   *
   * @param environment - The environment of the UAV.
   *
   * @returns The course of the UAV. Units are degrees cardinal.
   */
  #calculateCourse(environment: Environment): CardinalDegree {
    let ktasNorth = this.ktas.knots * Math.cos(this.heading.radians);
    let ktasEast = this.ktas.knots * Math.sin(this.heading.radians);

    let windNorth = environment.wind.windNorthComponent.knots;
    let windEast = environment.wind.windEastComponent.knots;

    let groundSpeedNorth = ktasNorth + windNorth;
    let groundSpeedEast = ktasEast + windEast;

    let courseRadians = Math.atan2(groundSpeedEast, groundSpeedNorth);
    let courseDegrees = radToDeg(courseRadians);

    return new CardinalDegree(Math.round(courseDegrees));
  }

  /**
   * Calculate the load factor of the UAV.
   *
   * @returns The load factor of the UAV. Units are unitless.
   */
  #calculateLoadFactor(): number {
    return parseFloat((1 / Math.cos(degToRad(this.bank.degrees))).toFixed(2));
  }

  /**
   * Calculate the gravity experienced by the UAV.
   *
   * @returns The gravity experienced by the UAV. Units are ft/s^2.
   */
  #calculateExperiencedGravity(): Acceleration {
    return Gravity.estimateGravityAtAltitude(this.altitude, "ft/s^2");
  }

  /**
   * Calculate the turn rate of the UAV.
   *
   * @returns The turn rate of the UAV. Units are degrees per second.
   */
  #calculateTurnRate(): number {
    let turnRateDegreesPerSecond = radToDeg(
      (this.experiencedGravity.convertTo("m/s^2").value *
        Math.tan(degToRad(this.bank.degrees))) /
        this.ktas.metersPerSecond
    );

    return parseFloat(turnRateDegreesPerSecond.toFixed(2));
  }

  /**
   * Calculate the turn radius of the UAV.
   *
   * @returns The turn radius of the UAV. Units are feet.
   */
  #calculateTurnRadius(): Feet {
    let radius =
      Math.pow(this.ktas.feetPerSecond, 2) /
      (this.experiencedGravity.convertTo("ft/s^2").value *
        Math.sqrt(Math.pow(this.loadFactor, 2) - 1));

    return new Feet(parseFloat(radius.toFixed(4)));
  }

  /**
   * Calculate the vertical velocity of the UAV.
   *
   * @returns The vertical velocity of the UAV. Units are feet per minute.
   */
  #calculateVerticalVelocity(): number {
    let kgsFeetPerMinute = this.groundSpeed.feetPerSecond * 60;

    let verticalVelocity = kgsFeetPerMinute * Math.sin(degToRad(this.gamma.degrees));

    return parseFloat(verticalVelocity.toFixed(2));
  }
}

class MQ9 extends UAV {
  dynamics = new UAVDynamics(10, 0.6);
  limits = new UAVLimits(45, 2.5);
}

export {
  Environment,
  UAVDynamics,
  UAVLimits,
  UAVControlMode,
  UAV,
  UAVState,
  MQ9,
};

// type UAVState = {

//   // Commanded Attitude - will be set by the pilot or autopilot
//   commandedHeading: number;
//   commandedKeas: number;
//   commandedAltitude: number;
//   commandedGamma: number;
//   commandedBank: number;

//   // Position
//   position?: {
//     x: number; // is relative to earth. Will be in longitude.
//     y: number; // is relative to earth. Will be in latitude.
//     z: number; // is relative to earth. Will be in altitude. Will be in feet.
//   };

//   positionThreeJs?: {
//     x: number; // is relative to the origin of the scene. Is aligned with the LONGITUDINAL axis of the aircraft.
//     y: number; // is relative to the origin of the scene. Is aligned with the VERTICAL axis of the aircraft.
//     z: number; // is relative to the origin of the scene. Is aligned with the LATERAL axis of the aircraft.
//   };
// };
