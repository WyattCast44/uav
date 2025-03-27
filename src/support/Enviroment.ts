import { Wind, Temperature, Feet } from ".";

class Environment {
  wind: Wind;
  surfaceTemperature: Temperature;

  constructor({
    wind = new Wind({ direction: 0, speed: 0 }),
    surfaceTemperature = Temperature.standardDayAtSeaLevel("F"),
  }: {
    wind: Wind;
    surfaceTemperature: Temperature;
  }) {
    this.wind = wind;
    this.surfaceTemperature = surfaceTemperature;
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

export default Environment;
