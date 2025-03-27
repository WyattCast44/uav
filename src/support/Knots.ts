class Knots {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get knots(): number {
    return this.value;
  }

  get kilometersPerSecond(): number {
    return this.value * 0.000514444444;
  }

  get kilometersPerMinute(): number {
    return this.value * 0.0308666;
  }
  get kilometersPerHour(): number {
    return this.value * 1.852;
  } 

  get metersPerSecond(): number {
    return this.value * 0.514444444;
  }

  get metersPerMinute(): number {
    return this.value * 30.8666;
  }

  get metersPerHour(): number {
    return this.value * 1852;
  }

  get feetPerSecond(): number {
    return this.value * 1.687809857;
  }

  get feetPerMinute(): number {
    return this.value * 101.268591424;
  }

  get feetPerHour(): number {
    return this.value * 6076.1154855643;
  }
}

export default Knots;
