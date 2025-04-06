import dayjs from "dayjs";
import { Environment } from "../support";
import { UAV } from "../uav";
import KeyboardUAVController from "../uav/controllers/KeyboardUAVController";

class Simulation {
  uav: UAV;
  environment: Environment;

  /**
   * Has the simulation been started before?
   */
  hasBeenStarted: boolean = false;

  /**
   * The start time of the simulation
   */
  startTime: Date | null;

  /**
   * The current time of the simulation. This will be updated
   * with each frame of the simulation. So it will be the
   * time the simulation started plus all the time increments
   * since then.
   */
  currentTime: Date | null;

  /**
   * The latest time increment of the simulation in milliseconds
   */
  timeIncrement: number = 0;

  /**
   * Whether the simulation is running
   */
  #isRunning: boolean = false;

  /**
   * The duration of the simulation in milliseconds
   */
  duration: number = 0;

  controller: KeyboardUAVController;

  constructor({
    uav,
    environment,
    controller,
    startTime,
  }: {
    uav: UAV;
    environment: Environment;
    controller: KeyboardUAVController;
    startTime: Date | null;
  }) {
    this.uav = uav;
    this.environment = environment;
    this.controller = controller;
    this.startTime = startTime;
    this.currentTime = startTime ? startTime : null;
    this.#registerSpacebarListener();
  }

  #registerSpacebarListener() {
    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === " ") {
        if (this.isRunning()) {
          this.stop();
        } else {
          let currentSimTime = dayjs(this.currentTime as Date).add(this.duration, "ms");
          this.start(currentSimTime.toDate());
        }
      }
    });
  }

  start(time: Date): void {
    this.#isRunning = true;

    if (!this.hasBeenStarted) {
      this.hasBeenStarted = true;
      this.startTime = time;
      this.currentTime = time;
    }
  }

  stop(): void {
    this.#isRunning = false;
  }

  isRunning(): boolean {
    return this.#isRunning;
  }

  incrementTime(timeSinceLastFrameMilliseconds: number): void {
    this.timeIncrement = timeSinceLastFrameMilliseconds;
    this.duration += this.timeIncrement;
    this.currentTime = dayjs(this.currentTime)
      .add(this.timeIncrement, "ms")
      .toDate();
  }

  getDuration(): string {
    let hours = Math.floor(this.duration / (1000 * 60 * 60));
    let minutes = Math.floor((this.duration % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((this.duration % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

export default Simulation;
