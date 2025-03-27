import { CardinalDegree, Degrees, Knots } from ".";

class Wind {
  cardinalDirection: CardinalDegree;
  speed: Knots;

  constructor({
    direction = new CardinalDegree(0),
    speed = new Knots(0),
  }: {
    direction: number | CardinalDegree;
    speed: number | Knots;
  }) {
    this.cardinalDirection =
      direction instanceof CardinalDegree
        ? direction
        : new CardinalDegree(direction);
    this.speed = speed instanceof Knots ? speed : new Knots(speed);
  }

  /**
   * The direction the wind is coming FROM.
   *
   * Units: degrees cardinal
   */
  get directionFromCardinal(): CardinalDegree {
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
    return new Degrees(this.directionFromMath).radians;
  }

  /**
   * The direction the wind is pointing TO.
   *
   * Units: degrees cardinal
   */
  get directionToCardinal(): number {
    return (this.cardinalDirection.degrees - 180) % 360;
  }

  /**
   * The direction the wind is pointing TO.
   *
   * Units: radians
   */
  get directionToCardinalRadians(): number {
    return new CardinalDegree(this.directionToCardinal).radians;
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
    return new Degrees(this.directionToMath).radians;
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

export default Wind;
