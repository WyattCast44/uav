import UAVDynamics from "./UAVDynamics";
import UAVLimits from "./UAVLimits";
import { Feet, Degrees } from "../support";
import UAV from "./UAV";
import { BoardsStatus } from "./BoardsStatus";
import KeyboardUAVController from "./controllers/KeyboardUAVController";

class MQ9 extends UAV {
  constructor(tailNumber: string = "MQ9", controller: KeyboardUAVController) {
    super(tailNumber, controller);
  }

  boardsStatus: BoardsStatus = BoardsStatus.IN;
  dynamics = new UAVDynamics({
    rollRate: 15,
    rollRateCompensator: 1,
    pitchRate: 10,
    pitchRateCompensator: 0.2,
    accelKeasPerSecond: 2,
    accelKnotsPerSecondCompensator: 1,
  });
  limits = new UAVLimits({
    maxAltitude: new Feet(50_000),
    maxBankAngle: new Degrees(45),
    maxLoadFactor: 2.5,
    maxGamma: new Degrees(45),
  });
}

export default MQ9;
