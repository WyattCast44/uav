import { UAV, UAVState, Environment } from "./uav";

class Simulation {
  uav: UAV;
  uavState: UAVState;
  environment: Environment;

  constructor(uav: UAV, uavState: UAVState, environment: Environment) {
    this.uav = uav;
    this.uavState = uavState;
    this.environment = environment;
  }
}

export { Simulation };
