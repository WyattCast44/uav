import UAV from "./UAV";
import UAVState from "./UAVState";
import { Degrees, Feet, Knots } from "../support";
import { normalizeHeading } from "../support/math";

class UAVAttitudeEstimator {
  constructor(public uav: UAV, public uavState: UAVState) {
    this.uav = uav;
  }

  /**
   * Estimate the attitude of the UAV based on the time increment.
   * This will smoothly transition from the current attitude to the commanded attitude
   * based on the UAV's dynamics and the time increment.
   * 
   * @param timeIncrement The time increment to estimate the attitude for in milliseconds.
   */
  estimateAttitudeBasedOnTimeIncrement(timeIncrement: number): void {
    const timeInSeconds = timeIncrement / 1000;
    const commanded = this.uav.commandedAttitude;
    const dynamics = this.uav.dynamics;

    // Update bank angle
    if (commanded.bank !== undefined) {
      const currentBank = this.uavState.bank.degrees;
      const targetBank = commanded.bank.degrees;
      const bankDiff = targetBank - currentBank;
      
      // Calculate the maximum possible change based on dynamics
      const maxBankChange = dynamics.effectiveRollRate * timeInSeconds;
      
      // Apply the change, limited by the maximum possible change
      const newBank = currentBank + Math.max(
        // minus because we want to move in the opposite direction of the commanded bank
        -maxBankChange,
        Math.min(maxBankChange, bankDiff)
      );
      
      this.uavState.bank = new Degrees(newBank);
    }

    // Update flight path angle (gamma)
    if (commanded.gamma !== undefined) {
      const currentGamma = this.uavState.gamma.degrees;
      const targetGamma = commanded.gamma.degrees;
      const gammaDiff = targetGamma - currentGamma;
      
      // Calculate the maximum possible change based on dynamics
      const maxGammaChange = dynamics.effectivePitchRate * timeInSeconds;
      
      // Apply the change, limited by the maximum possible change
      const newGamma = currentGamma + Math.max(
        -maxGammaChange,
        Math.min(maxGammaChange, gammaDiff)
      );
      
      this.uavState.gamma = new Degrees(newGamma);
    }

    // Update airspeed
    if (commanded.keas !== undefined) {
      const currentKeas = this.uavState.keas.knots;
      const targetKeas = commanded.keas.knots;
      const keasDiff = targetKeas - currentKeas;
      
      // Calculate the maximum possible change based on dynamics
      const maxKeasChange = dynamics.effectiveAccelKeasPerSecond * timeInSeconds;
      
      // Apply the change, limited by the maximum possible change
      const newKeas = currentKeas + Math.max(
        -maxKeasChange,
        Math.min(maxKeasChange, keasDiff)
      );
      
      this.uavState.keas = new Knots(newKeas);
    }

    // update the altitude
    if(this.uav.state.gamma.degrees !== 0) {
      const currentAltitude = this.uavState.altitude.feet;
      
      let verticalVelocityInFeetPerMinute = this.uav.state.verticalVelocity;
      let verticalVelocityInFeetPerSecond = verticalVelocityInFeetPerMinute / 60;

      const altitudeChangeInTimeIncrement = verticalVelocityInFeetPerSecond * timeInSeconds;

      const newAltitude = currentAltitude + altitudeChangeInTimeIncrement;
  
      this.uavState.altitude = new Feet(newAltitude);
    }

    // update the heading based on the commanded bank angle and subsequent roll rate
    if(commanded.bank !== undefined) {
      let currentHeading = this.uavState.heading.degrees;
      
      let currentTurnRateDegreesPerSecond = this.uavState.turnRate;

      let headingChangeInTimeIncrement = currentTurnRateDegreesPerSecond * timeInSeconds;

      const newHeading = normalizeHeading(currentHeading + headingChangeInTimeIncrement);

      this.uavState.heading = new Degrees(newHeading)
    }
  }
}

export default UAVAttitudeEstimator;
