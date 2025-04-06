import { Feet, Degrees } from "../support";

import UAVLimits from "./UAVLimits";
import UAVDynamics from "./UAVDynamics";
import UAVState from "./UAVState";
import UAVCommandedAttitude from "./UAVCommandedAttitude";
import KeyboardUAVController from "./controllers/KeyboardUAVController";

class UAV {
  /**
   * The state of the UAV.
   */
  state: UAVState = new UAVState(this);

  /**
   * The commanded attitude of the UAV. Will be set 
   * by the pilot or autopilot. This will be used to 
   * determine what the UAV should be doing. And the dynamics
   * will be used to calculate how the UAV will get from the
   * current state to the commanded state. The limits will
   * be used to ensure the commanded attitude is within the
   * limits of the UAV.
   */
  commandedAttitude: UAVCommandedAttitude = new UAVCommandedAttitude(this);

  /**
   * The dynamics of the UAV. Will be used to calculate
   * rate of change of the UAV's attitude when changing state 
   * from current state to commanded state.
   */
  dynamics: UAVDynamics = new UAVDynamics({
    rollRate: 10,
    rollRateCompensator: 1,
    pitchRate: 10,
    pitchRateCompensator: 1,
    accelKeasPerSecond: 1,
    accelKnotsPerSecondCompensator: 1,
  });

  /**
   * The limits of the UAV. Will be used to 
   * ensure the UAV does not exceed certain limits.
   */
  limits: UAVLimits = new UAVLimits({
    maxAltitude: new Feet(10_000),
    maxBankAngle: new Degrees(60),
    maxLoadFactor: 8,
    maxGamma: new Degrees(60),
  });  

  /**
   * The controller for the UAV. This will be used to
   * handle user input and update the commanded attitude.
   */
  controller: KeyboardUAVController;

  constructor(public tailNumber: string = "N/A", controller: KeyboardUAVController) {
    this.controller = controller;
  }
}

export default UAV;

