import { Degrees, Feet } from "../support";

class UAVLimits {
  maxAltitude: Feet;
  maxBankAngle: Degrees;
  maxLoadFactor: number;

  constructor({
    maxAltitude,
    maxBankAngle,
    maxLoadFactor,
  }: {
    maxAltitude: Feet;
    maxBankAngle: Degrees;
    maxLoadFactor: number;
  }) {
    this.maxAltitude = maxAltitude;
    this.maxBankAngle = maxBankAngle;
    this.maxLoadFactor = maxLoadFactor;
  }
}

export default UAVLimits;
