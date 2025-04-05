import { Feet, Degrees } from "../support";

import UAVLimits from "./UAVLimits";
import UAVDynamics from "./UAVDynamics";
import UAVState from "./UAVState";
import UAVCommandedAttitude from "./UAVCommandedAttitude";

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

  constructor(public tailNumber: string = "N/A") {}
}

export default UAV;

// type UAVState = {

//   // Commanded Attitude - will be set by the pilot or autopilot
//   commandedHeading: number;
//   commandedKeas: number;
//   commandedAltitude: number;
//   commandedGamma: number;
//   commandedBank: number;

//   // Position
//   position?: {
//     x: number; // is relative to earth. Will be in longitude.
//     y: number; // is relative to earth. Will be in latitude.
//     z: number; // is relative to earth. Will be in altitude. Will be in feet.
//   };

//   positionThreeJs?: {
//     x: number; // is relative to the origin of the scene. Is aligned with the LONGITUDINAL axis of the aircraft.
//     y: number; // is relative to the origin of the scene. Is aligned with the VERTICAL axis of the aircraft.
//     z: number; // is relative to the origin of the scene. Is aligned with the LATERAL axis of the aircraft.
//   };
// };
