class Feet {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get feet(): number {
    return this.value;
  }

  get meters(): number {
    return this.value * 0.3048;
  }

  get nauticalMiles(): number {
    return this.value * 0.000164579;
  }

  get kilometers(): number {
    return this.value * 0.00030480031;
  }
}

export default Feet;
