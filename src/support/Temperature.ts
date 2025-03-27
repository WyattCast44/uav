class Temperature {
  temperature: number;
  units: "F" | "C";
  /**
   * The temperature in degrees Fahrenheit.
   *
   * Units: degrees Fahrenheit
   */
  constructor(temperature: number, units: "F" | "C" = "F") {
    this.temperature = temperature;
    this.units = units;
  }

  static standardDayAtSeaLevel(units: "F" | "C" = "F"): Temperature {
    if (units === "F") {
      return new Temperature(68);
    } else {
      return new Temperature(20);
    }
  }

  static fromFahrenheit(temperature: number): Temperature {
    return new Temperature(temperature, "F");
  }

  static fromCelsius(temperature: number): Temperature {
    return new Temperature(temperature * (9 / 5) + 32, "F");
  }

  get temperatureFahrenheit(): number {
    if (this.units === "F") {
      return this.temperature;
    } else if (this.units === "C") {
      return this.temperature * (9 / 5) + 32;
    } else {
      throw new Error("Invalid units");
    }
  }

  get temperatureCelsius(): number {
    if (this.units === "F") {
      return (this.temperature - 32) * (5 / 9);
    } else if (this.units === "C") {
      return this.temperature;
    } else {
      throw new Error("Invalid units");
    }
  }
}

export default Temperature;
