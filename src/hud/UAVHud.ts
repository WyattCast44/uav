import { UAV, UAVState, UAVControlMode } from "../uav";
import { Environment } from "../support";
import HUDCanvas from "./HUDCanvas";
import { Simulation } from "../sim";

class UAVHud {
  uav: UAV;
  uavState: UAVState;
  environment: Environment;
  simulation: Simulation;

  /**
   * The canvas element to render the HUD to.
   *
   * This is created in the constructor. It will be
   * mounted to the target element in the render method.
   */
  canvas: HUDCanvas;

  /**
   * The control mode of the UAV.
   */
  controlMode: UAVControlMode;

  /**
   * The primary graphics color of the HUD.
   */
  primaryGraphicsColor: string = "green";

  /**
   * The secondary graphics color of the HUD.
   */
  secondaryGraphicsColor: string = "black";

  /**
   * The primary text color of the HUD.
   */
  primaryTextColor: string = "white";

  /**
   * The secondary text color of the HUD.
   */
  secondaryTextColor: string = "white";

  constructor(uav: UAV, uavState: UAVState, environment: Environment, simulation: Simulation) {
    this.uav = uav;
    this.uavState = uavState;
    this.environment = environment;
    this.simulation = simulation;
    this.canvas = new HUDCanvas();
    this.controlMode = uavState.controlMode;
    this.#setGraphicsColors();
  }

  #setGraphicsColors() {
    switch (this.controlMode) {
      case UAVControlMode.MANUAL:
        this.primaryGraphicsColor = "lime";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "lime";
        break;
      case UAVControlMode.AUTOPILOT:
        this.primaryGraphicsColor = "blue";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "white";
        break;
      case UAVControlMode.MSN:
        this.primaryGraphicsColor = "green";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "white";
        break;
    }
  }

  getFont(size: number): string {
    return `${size}px monospace`;
  }

  mount(target: HTMLElement) {
    this.canvas.setTarget(target);

    this.canvas.mount();
  }

  unmount() {
    this.canvas.unmount();
  }

  render(currentTime: Date) {
    this.canvas.render(currentTime);
  }
}

export default UAVHud;
