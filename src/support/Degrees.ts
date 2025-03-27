class Degrees {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  static fromRadians(radians: number): Degrees {
    return new Degrees(radians * (180 / Math.PI));
  }

  get degrees(): number {
    return this.value;
  }

  get radians(): number {
    return this.value * (Math.PI / 180);
  }
}

export default Degrees;
