import { Feet, Degrees } from "../support";

import UAVLimits from "./UAVLimits";
import UAVDynamics from "./UAVDynamics";

class UAV {
  tailNumber: string = "";
  dynamics: UAVDynamics = new UAVDynamics({
    rollRate: 10,
    rollRateCompensator: 1,
  });
  limits: UAVLimits = new UAVLimits({
    maxAltitude: new Feet(10_000),
    maxBankAngle: new Degrees(60),
    maxLoadFactor: 8,
  });

  setTailNumber(tailNumber: string) {
    this.tailNumber = tailNumber;
  }
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
