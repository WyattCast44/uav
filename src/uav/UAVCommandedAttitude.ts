import { Degrees, Knots } from "../support";
import { BoardsStatus } from "./BoardsStatus";
import KeyboardUAVController from "./controllers/KeyboardUAVController";
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

  /**
   * The current commanded bank angle rate of change
   */
  private bankRate: number = 0;

  /**
   * The current commanded pitch rate of change
   */
  private pitchRate: number = 0;

  /**
   * The current commanded airspeed rate of change
   */
  private airspeedRate: number = 0;

  constructor(public uav: UAV) {}

  /**
   * Updates the commanded attitude based on keyboard inputs
   * @param timeIncrement Time since last update in milliseconds
   */
  updateFromKeyboardInputs(timeIncrement: number): void {
    const controller = this.uav.controller as KeyboardUAVController;
    const dynamics = this.uav.dynamics;
    const limits = this.uav.limits;

    // Convert time increment to seconds for rate calculations
    const timeInSeconds = timeIncrement / 1000;

    // Handle bank angle changes
    if (controller.commands.rollLeft) {
      this.bankRate = -dynamics.effectiveRollRate;
    } else if (controller.commands.rollRight) {
      this.bankRate = dynamics.effectiveRollRate;
    } else {
      this.bankRate = 0;
    }

    // Handle pitch changes
    if (controller.commands.pitchUp) {
      this.pitchRate = dynamics.effectivePitchRate;
    } else if (controller.commands.pitchDown) {
      this.pitchRate = -dynamics.effectivePitchRate;
    } else {
      this.pitchRate = 0;
    }

    // Handle airspeed changes
    if (controller.commands.throttleUp) {
      this.airspeedRate = dynamics.effectiveAccelKeasPerSecond;
    } else if (controller.commands.throttleDown) {
      this.airspeedRate = -dynamics.effectiveAccelKeasPerSecond;
    } else {
      this.airspeedRate = 0;
    }

    // so we know need to set the actual commanded attitude
    if(this.bankRate !== 0) {
      this.bank = new Degrees(this.uav.state.bank.degrees + (this.bankRate * timeInSeconds));
    }

    if(this.pitchRate !== 0) {
      this.gamma = new Degrees(this.uav.state.gamma.degrees + (this.pitchRate * timeInSeconds));
    }

    if(this.airspeedRate !== 0) {
      this.keas = new Knots(this.uav.state.keas.knots + (this.airspeedRate * timeInSeconds));
    }

    // Apply rate changes
    if (this.bank) { 
      const newBank = this.bank.degrees + (this.bankRate * timeInSeconds);
      this.bank = new Degrees(Math.max(
        -limits.maxBankAngle.degrees,
        Math.min(limits.maxBankAngle.degrees, newBank)
      ));
    }

    if (this.gamma) {
      const newGamma = this.gamma.degrees + (this.pitchRate * timeInSeconds);
      this.gamma = new Degrees(Math.max(
        -limits.maxGamma.degrees,
        Math.min(limits.maxGamma.degrees, newGamma)
      ));
    }

    if (this.keas) {
      const newKeas = this.keas.knots + (this.airspeedRate * timeInSeconds);
      this.keas = new Knots(Math.max(0, newKeas));
    }
  }
}

export default UAVCommandedAttitude;
