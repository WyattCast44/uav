function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

class Knots {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get knots(): number {
    return this.value;
  }

  get metersPerSecond(): number {
    return this.value * 0.514444444;
  }

  get feetPerSecond(): number {
    return this.value * 1.687809857;
  }

  get kilometersPerSecond(): number {
    return this.value * 0.000514444444;
  }
}

class CardinalDirection {
  value: number;

  /**
   * The value of the cardinal direction in degrees.
   *
   * Units: degrees
   */
  constructor(value: number) {
    this.value = value < 0 ? 0 : value % 360;
  }

  get degrees(): number {
    return this.value;
  }

  get radians(): number {
    return degToRad(this.value);
  }
}

class Feet {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get feet(): number {
    return this.value;
  }

  get meters(): number {
    return this.value * 0.3048;
  }
}

class Meters {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get meters(): number {
    return this.value;
  }

  get feet(): Feet {
    return new Feet(this.value * 3.28084);
  }
}

class Acceleration {
  value: number;
  units: "ft/s^2" | "m/s^2";

  constructor(value: number, units: "ft/s^2" | "m/s^2" = "ft/s^2") {
    this.value = value;
    this.units = units;
  }

  static fromFeetPerSecondSquared(value: number): Acceleration {
    return new Acceleration(value, "ft/s^2");
  }

  static fromMetersPerSecondSquared(value: number): Acceleration {
    return new Acceleration(value, "m/s^2");
  }

  get ftPerSecondSquared(): number {
    if (this.units === "ft/s^2") {
      return parseFloat(this.value.toFixed(6));
    } else {
      return parseFloat((this.value * 0.3048).toFixed(6));
    }
  }

  get metersPerSecondSquared(): number {
    if (this.units === "m/s^2") {
      return parseFloat(this.value.toFixed(6));
    } else {
      return parseFloat((this.value * 0.3048).toFixed(6));
    }
  }

  convertTo(units: "ft/s^2" | "m/s^2"): Acceleration {
    if (this.units === units) {
      return this;
    }

    if (units === "ft/s^2") {
      return new Acceleration(this.metersPerSecondSquared * 3.28084, "ft/s^2");
    } else {
      return new Acceleration(this.ftPerSecondSquared * 0.3048, "m/s^2");
    }
  }
}

class Gravity {
  static get ftPerSecondSquaredAtSeaLevel(): Acceleration {
    return new Acceleration(32.174049, "ft/s^2");
  }

  static get metersPerSecondSquaredAtSeaLevel(): Acceleration {
    return new Acceleration(9.80665, "m/s^2");
  }

  static estimateGravityAtAltitude(altitude: Feet): Acceleration {
    let meanRadiusOfEarth = new Meters(6_378_100);

    // m/s^2
    let gravity =
      this.metersPerSecondSquaredAtSeaLevel.metersPerSecondSquared *
      Math.pow(
        meanRadiusOfEarth.meters / (meanRadiusOfEarth.meters + altitude.meters),
        2
      );

    return new Acceleration(gravity, "m/s^2").convertTo("ft/s^2");
  }
}

class Wind {
  cardinalDirection: CardinalDirection;
  speed: Knots;

  constructor(direction: number | CardinalDirection, speed: number | Knots) {
    this.cardinalDirection =
      direction instanceof CardinalDirection
        ? direction
        : new CardinalDirection(direction);
    this.speed = speed instanceof Knots ? speed : new Knots(speed);
  }

  /**
   * The direction the wind is coming FROM.
   *
   * Units: degrees cardinal
   */
  get directionFromCardinal(): CardinalDirection {
    return this.cardinalDirection;
  }

  /**
   * The direction the wind is coming FROM.
   *
   * Units: radians
   */
  get directionFromCardinalRadians(): number {
    return this.directionFromCardinal.radians;
  }

  /**
   * The direction the wind is coming FROM.
   *
   * Units: degrees math
   */
  get directionFromMath(): number {
    return 90 - this.cardinalDirection.degrees;
  }

  /**
   * The direction the wind is coming FROM.
   *
   * Units: radians
   */
  get directionFromMathRadians(): number {
    return degToRad(this.directionFromMath);
  }

  /**
   * The direction the wind is pointing TO.
   *
   * Units: degrees cardinal
   */
  get directionToCardinal(): number {
    return (this.cardinalDirection.degrees - 180) % 360;
  }

  get directionToCardinalRadians(): number {
    return degToRad(this.directionToCardinal);
  }

  /**
   * The direction the wind is pointing TO.
   *
   * Units: degrees math
   */
  get directionToMath(): number {
    return 90 - ((this.cardinalDirection.degrees - 180) % 360);
  }

  /**
   * The direction the wind is pointing TO.
   *
   * Units: radians
   */
  get directionToMathRadians(): number {
    return degToRad(this.directionToMath);
  }

  /**
   * The north component of the wind.
   *
   * Units: knots
   */
  get windNorthComponent(): Knots {
    return new Knots(
      this.speed.knots * Math.cos(this.directionToCardinalRadians)
    );
  }

  /**
   * The east component of the wind.
   *
   * Units: knots
   */
  get windEastComponent(): Knots {
    return new Knots(
      this.speed.knots * Math.sin(this.directionToCardinalRadians)
    );
  }
}

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

class UAV {
  dynamics: UAVDynamics = new UAVDynamics(10, 1);
  limits: UAVLimits = new UAVLimits(60, 8);
}

class MQ9 extends UAV {
  dynamics = new UAVDynamics(10, 0.6);
  limits = new UAVLimits(45, 2.5);
}

class Temperature {
  temperature: number;

  /**
   * The temperature in degrees Fahrenheit.
   *
   * Units: degrees Fahrenheit
   */
  constructor(temperature: number) {
    this.temperature = temperature;
  }

  get temperatureFahrenheit(): number {
    return this.temperature;
  }

  get temperatureCelsius(): number {
    return (this.temperature - 32) * (5 / 9);
  }

  get temperatureKelvin(): number {
    return this.temperatureCelsius + 273.15;
  }
}

class Environment {
  wind: Wind;
  surfaceTemperature: Temperature;

  constructor() {
    // 0 knots, 0 degrees
    this.wind = new Wind(0, 0);
    // 20 degrees Celsius, standard day at sea level
    this.surfaceTemperature = new Temperature(68);
  }

  setWind(wind: Wind) {
    this.wind = wind;
  }

  setSurfaceTemperature(temperature: Temperature) {
    this.surfaceTemperature = temperature;
  }

  /**
   * Calculate the density of the air at a given altitude.
   *
   * Based on an analysis of the NASA standard atmosphere of 1976.
   *
   * @param altitude - The altitude in feet
   * @returns The density of the air at the given altitude. Units are kg/m^3
   */
  estimateAirDensityAtAltitude(altitude: Feet): number {
    return (
      1.22 +
      -3.39 * Math.pow(10, -5) * altitude.feet +
      2.8 * Math.pow(10, -10) * Math.pow(altitude.feet, 2)
    );
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
  heading: CardinalDirection = new CardinalDirection(360);

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
  gamma: number = 0;

  /**
   * The bank angle of the UAV. This is the angle between the UAV's wings and the horizontal. Will be in degrees.
   *
   * Positive is right wing down. Negative is left wing down.
   *
   * Units: degrees
   */
  bank: number = 0;

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
  course: CardinalDirection = new CardinalDirection(0);

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

  constructor(uav: UAV) {
    this.uav = uav;
  }

  setIntialAttitude(
    heading: number | CardinalDirection,
    keas: number | Knots,
    altitude: number | Feet,
    gamma: number,
    bank: number
  ) {
    this.heading =
      heading instanceof CardinalDirection
        ? heading
        : new CardinalDirection(heading);
    this.keas = keas instanceof Knots ? keas : new Knots(keas);
    this.altitude = altitude instanceof Feet ? altitude : new Feet(altitude);
    this.gamma = gamma;
    this.bank = bank;
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
  #calculateCourse(environment: Environment): CardinalDirection {
    let ktasNorth = this.ktas.knots * Math.cos(this.heading.radians);
    let ktasEast = this.ktas.knots * Math.sin(this.heading.radians);

    let windNorth = environment.wind.windNorthComponent.knots;
    let windEast = environment.wind.windEastComponent.knots;

    let groundSpeedNorth = ktasNorth + windNorth;
    let groundSpeedEast = ktasEast + windEast;

    let courseRadians = Math.atan2(groundSpeedEast, groundSpeedNorth);
    let courseDegrees = radToDeg(courseRadians);

    return new CardinalDirection(Math.round(courseDegrees));
  }

  /**
   * Calculate the load factor of the UAV.
   *
   * @returns The load factor of the UAV. Units are unitless.
   */
  #calculateLoadFactor(): number {
    return parseFloat((1 / Math.cos(degToRad(this.bank))).toFixed(2));
  }

  /**
   * Calculate the gravity experienced by the UAV.
   *
   * @returns The gravity experienced by the UAV. Units are ft/s^2.
   */
  #calculateExperiencedGravity(): Acceleration {
    return Gravity.estimateGravityAtAltitude(this.altitude).convertTo("ft/s^2");
  }

  /**
   * Calculate the turn rate of the UAV.
   *
   * @returns The turn rate of the UAV. Units are degrees per second.
   */
  #calculateTurnRate(): number {
    let turnRateDegreesPerSecond = radToDeg(
      (this.experiencedGravity.convertTo("m/s^2").value *
        Math.tan(degToRad(this.bank))) /
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

    let verticalVelocity = kgsFeetPerMinute * Math.sin(degToRad(this.gamma));

    return parseFloat(verticalVelocity.toFixed(2));
  }
}

// create the world
let reaper = new MQ9();
let reaperState = new UAVState(reaper);
let environment = new Environment();

// init the environment
environment.setWind(new Wind(270, 30));
environment.setSurfaceTemperature(new Temperature(80));

// init the UAV
reaperState.setIntialAttitude(
  new CardinalDirection(360),
  new Knots(120),
  new Feet(20_000),
  -3,
  0
);

// init the performance values
reaperState.updatePerformanceValues(environment);

console.log(reaperState);

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
