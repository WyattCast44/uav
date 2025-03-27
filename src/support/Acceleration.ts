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
    return this.convertTo("ft/s^2").value;
  }

  get metersPerSecondSquared(): number {
    return this.convertTo("m/s^2").value;
  }

  convertTo(units: "ft/s^2" | "m/s^2"): Acceleration {
    if (this.units === units) {
      // current units are the same as the requested units
      return this;
    }

    let currentUnits = this.units;

    if (currentUnits === "ft/s^2" && units === "m/s^2") {
      // convert from ft/s^2 to m/s^2
      return new Acceleration(this.value * 0.3048, units);
    } else if (currentUnits === "m/s^2" && units === "ft/s^2") {
      // convert from m/s^2 to ft/s^2
      return new Acceleration(this.value * 3.28084, units);
    }

    throw new Error(`Unsupported units: ${currentUnits}`);
  }
}

export default Acceleration;
