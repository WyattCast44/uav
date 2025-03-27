class UAVDynamics {
  rollRate: number;
  rollRateCompensator: number;

  constructor({
    rollRate,
    rollRateCompensator,
  }: {
    rollRate: number;
    rollRateCompensator: number;
  }) {
    this.rollRate = rollRate;
    this.rollRateCompensator = rollRateCompensator;
  }

  get effectiveRollRate(): number {
    return this.rollRate * this.rollRateCompensator;
  }
}

export default UAVDynamics;
