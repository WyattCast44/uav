import { Environment } from "../support";
import { UAV, UAVState } from "../uav";

class Simulation {
  uav: UAV;
  uavState: UAVState;
  environment: Environment;

  #isRunning: boolean = false;

  constructor(uav: UAV, uavState: UAVState, environment: Environment) {
    this.uav = uav;
    this.uavState = uavState;
    this.environment = environment;
  }

  start(): void {
    this.#isRunning = true;
  }

  stop(): void {
    this.#isRunning = false;
  }

  isRunning(): boolean {
    return this.#isRunning;
  }
}

export default Simulation;
