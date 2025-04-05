import UAV from "./UAV";
import UAVState from "./UAVState";

class UAVAttitudeEstimator {
  constructor(public uav: UAV, public uavState: UAVState) {
    this.uav = uav;
  }

  /**
   * Estimate the attitude of the UAV based on the time increment.
   * 
   * @param timeIncrement The time increment to estimate the attitude for in milliseconds.
   */
  estimateAttitudeBasedOnTimeIncrement(timeIncrement: number) {
    console.log("estimateAttitudeBasedOnTimeIncrement", timeIncrement);
  }
}

export default UAVAttitudeEstimator;
