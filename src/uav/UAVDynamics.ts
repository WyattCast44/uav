class UAVDynamics {
  rollRate: number;
  rollRateCompensator: number;
  pitchRate: number;
  pitchRateCompensator: number;
  accelKeasPerSecond: number;
  accelKnotsPerSecondCompensator: number;

  constructor({
    rollRate,
    rollRateCompensator,
    pitchRate,
    pitchRateCompensator,
    accelKeasPerSecond,
    accelKnotsPerSecondCompensator,
  }: {
    rollRate: number;
    rollRateCompensator: number;
    pitchRate: number;
    pitchRateCompensator: number;
    accelKeasPerSecond: number;
    accelKnotsPerSecondCompensator: number;
  }) {
    this.rollRate = rollRate;
    this.rollRateCompensator = rollRateCompensator;
    this.pitchRate = pitchRate;
    this.pitchRateCompensator = pitchRateCompensator;
    this.accelKeasPerSecond = accelKeasPerSecond;
    this.accelKnotsPerSecondCompensator = accelKnotsPerSecondCompensator;
  }

  get effectiveRollRate(): number {
    return this.rollRate * this.rollRateCompensator;
  }

  get effectivePitchRate(): number {
    return this.pitchRate * this.pitchRateCompensator;
  }

  get effectiveAccelKeasPerSecond(): number {
    return this.accelKeasPerSecond * this.accelKnotsPerSecondCompensator;
  }
}

export default UAVDynamics;
