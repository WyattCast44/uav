import UAV from "./UAV";
import UAVPosition from "./UAVPosition";

/**
 * The UAV Time, Space, and Position Information
 */
class UAVTSPI {
  constructor(public uav: UAV, public position: UAVPosition) {}
}

export default UAVTSPI;
