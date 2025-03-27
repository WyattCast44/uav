class Radians {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  static fromDegrees(degrees: number): Radians {
    return new Radians(degrees * (Math.PI / 180));
  }

  get degrees(): number {
    return this.value * (180 / Math.PI);
  }
}

export default Radians;
