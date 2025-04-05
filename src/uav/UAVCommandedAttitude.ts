import { Degrees, Knots } from "../support";
import { BoardsStatus } from "./BoardsStatus";
import { GearStatus } from "./GearStatus";
import UAV from "./UAV";

class UAVCommandedAttitude {
  /**
   * The equivalent airspeed of the UAV. This is the speed of the UAV relative to the air.
   *
   * Units: knots
   */
  keas?: Knots;

  /**
   * The flight path angle of the UAV. This is the angle between the UAV's flight path and the horizontal. Will be in degrees. Positive is up. Negative is down.
   *
   * Units: degrees
   */
  gamma?: Degrees;

  /**
   * The bank angle of the UAV. This is the angle between the UAV's wings and the horizontal. Will be in degrees.
   *
   * Positive is right wing down. Negative is left wing down.
   *
   * Units: degrees
   */
  bank?: Degrees;

  /**
   * The gear status of the UAV. This is the status of the gear of the UAV.
   *
   * Enum: GearStatus
   */
  gearStatus?: GearStatus;

  /**
   * The boards status of the UAV. This is the status of the boards of the UAV.
   *
   * Enum: BoardsStatus
   */
  boardsStatus?: BoardsStatus;

  constructor(public uav: UAV) {}

  pitchUp(amount: number | Degrees) {
    let gamma = amount instanceof Degrees ? amount.degrees : amount;

    let clampedGamma = this.#clampGamma(gamma);

    this.uav.state.gamma = clampedGamma;
  }

  pitchDown(amount: number | Degrees) {
    let gamma = amount instanceof Degrees ? amount.degrees : amount;

    let clampedGamma = this.#clampGamma(-gamma);

    this.uav.state.gamma = clampedGamma;
  }

  #clampGamma(gamma: number): Degrees {
    let commandedGamma = this.uav.state.gamma.degrees + gamma;

    if (commandedGamma > this.uav.limits.maxGamma.degrees) {
      gamma = this.uav.limits.maxGamma.degrees;
    } else if (commandedGamma < -this.uav.limits.maxGamma.degrees) {
      gamma = -this.uav.limits.maxGamma.degrees;
    } else {
      gamma = commandedGamma;
    }

    return new Degrees(gamma);
  }
}

export default UAVCommandedAttitude;
