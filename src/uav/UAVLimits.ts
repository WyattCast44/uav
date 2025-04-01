import { Degrees, Feet } from "../support";

class UAVLimits {
  maxAltitude: Feet;
  maxBankAngle: Degrees;
  maxLoadFactor: number;
  maxGamma: Degrees;

  constructor({
    maxAltitude,
    maxBankAngle,
    maxLoadFactor,
    maxGamma,
  }: {
    maxAltitude: Feet;
    maxBankAngle: Degrees;
    maxLoadFactor: number;
    maxGamma: Degrees;
  }) {
    this.maxAltitude = maxAltitude;
    this.maxBankAngle = maxBankAngle;
    this.maxLoadFactor = maxLoadFactor;
    this.maxGamma = maxGamma;
  }
}

export default UAVLimits;
