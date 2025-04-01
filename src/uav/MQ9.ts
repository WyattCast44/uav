import UAVDynamics from "./UAVDynamics";
import UAVLimits from "./UAVLimits";
import { Feet, Degrees } from "../support";
import UAV from "./UAV";
import { BoardsStatus } from "./BoardsStatus";

class MQ9 extends UAV {
  constructor(tailNumber: string = "MQ9") {
    super(tailNumber);
  }

  boardsStatus: BoardsStatus = BoardsStatus.IN;
  dynamics = new UAVDynamics({
    rollRate: 10,
    rollRateCompensator: 0.6,
  });
  limits = new UAVLimits({
    maxAltitude: new Feet(50_000),
    maxBankAngle: new Degrees(45),
    maxLoadFactor: 2.5,
    maxGamma: new Degrees(45),
  });
}

export default MQ9;
