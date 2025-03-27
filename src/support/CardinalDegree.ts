class CardinalDegree {
  value: number;

  constructor(value: number) {
    this.value = value < 0 ? 0 : value % 360;
  }

  static fromDegrees(value: number): CardinalDegree {
    return new CardinalDegree(value);
  }

  static fromRadians(value: number): CardinalDegree {
    return new CardinalDegree(value * (180 / Math.PI));
  }

  get degrees(): number {
    return this.value;
  }

  get radians(): number {
    return this.value * (Math.PI / 180);
  }
}

export default CardinalDegree;