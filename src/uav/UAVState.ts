import {
  Acceleration,
  CardinalDegree,
  Degrees,
  Environment,
  Feet,
  Gravity,
  Knots,
} from "../support";
import { BoardsStatus } from "./BoardsStatus";
import { GearStatus } from "./GearStatus";
import UAV from "./UAV";
import UAVControlMode from "./UAVControlMode";
import { radToDeg } from "three/src/math/MathUtils.js";

class UAVState {
  /**
   * The UAV instance
   */
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

  /**
   * The control mode of the UAV. This is the mode that the UAV is in.
   *
   * Enum: UAVControlMode
   */
  controlMode: UAVControlMode = UAVControlMode.MANUAL;
  
  /**
   * The gear status of the UAV. This is the status of the gear of the UAV.
   *
   * Enum: GearStatus
   */
  gearStatus: GearStatus = GearStatus.UP;

  /**
   * The boards status of the UAV. This is the status of the boards of the UAV.
   *
   * Enum: BoardsStatus
   */
  boardsStatus: BoardsStatus = BoardsStatus.NONE;

  /**
   * The position of the UAV. This is the position of the UAV in the world.
   * 
   * It will be relative to the starting position of the UAV.
   *
   * Units: unitless
   */
  position: {
    x: number;
    y: number;
  } = { x: 0, y: 0 };

  constructor(uav: UAV) {
    this.uav = uav;
  }

  setIntialAttitude({
    heading,
    keas,
    altitude,
    gamma,
    bank,
    position,
  }: {
    heading: number | CardinalDegree;
    keas: number | Knots;
    altitude: number | Feet;
    gamma: number | Degrees;
    bank: number | Degrees;
    position: {
      x: number;
      y: number;
    };
  }) {
    this.heading =
      heading instanceof CardinalDegree ? heading : new CardinalDegree(heading);
    this.keas = keas instanceof Knots ? keas : new Knots(keas);
    this.altitude = altitude instanceof Feet ? altitude : new Feet(altitude);
    this.gamma = gamma instanceof Degrees ? gamma : new Degrees(gamma);
    this.bank = bank instanceof Degrees ? bank : new Degrees(bank);
    this.position = position;
  }

  /**
   * Update the performance values of the UAV. This will 
   * be used to calculate and update the performance values
   * based on the current state of the UAV and the environmental 
   * conditions. For example, the true airspeed will be calculated
   * based on the equivalent airspeed and the current altitude.
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
    return parseFloat((1 / Math.cos(this.bank.radians)).toFixed(2));
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
        Math.tan(this.bank.radians)) /
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

    let verticalVelocity = kgsFeetPerMinute * Math.sin(this.gamma.radians);

    return parseFloat(verticalVelocity.toFixed(2));
  }
}

export default UAVState;
