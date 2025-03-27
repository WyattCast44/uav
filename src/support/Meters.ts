
class Meters {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  get meters(): number {
    return this.value;
  }

  get kilometers(): number {
    return this.value * 0.001;
  }

  get feet(): number {
    return this.value * 3.28084;
  }

  get nauticalMiles(): number {
    return this.value * 0.000539957;
  }
}

export default Meters;
