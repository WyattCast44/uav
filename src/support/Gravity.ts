import { Meters, Feet, Acceleration } from ".";

class Gravity {
  static get ftPerSecondSquaredAtSeaLevel(): Acceleration {
    return new Acceleration(32.174049, "ft/s^2");
  }

  static get metersPerSecondSquaredAtSeaLevel(): Acceleration {
    return new Acceleration(9.80665, "m/s^2");
  }

  static estimateGravityAtAltitude(altitude: Feet, units: "ft/s^2" | "m/s^2"): Acceleration {
    let meanRadiusOfEarth = new Meters(6_378_100);

    // m/s^2
    let gravity =
      this.metersPerSecondSquaredAtSeaLevel.metersPerSecondSquared *
      Math.pow(
        meanRadiusOfEarth.meters / (meanRadiusOfEarth.meters + altitude.meters),
        2
      );

    return new Acceleration(gravity, "m/s^2").convertTo(units);
  }
}

export default Gravity;
