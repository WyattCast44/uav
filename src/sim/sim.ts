import dayjs from 'dayjs'
import { Environment } from "../support";
import { UAV, UAVState } from "../uav";

class Simulation {
  uav: UAV;
  uavState: UAVState;
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

  constructor({
    uav,
    uavState,
    environment,
    startTime,
  }: {
    uav: UAV;
    uavState: UAVState;
    environment: Environment;
    startTime: Date | null;
  }) {
    this.uav = uav;
    this.uavState = uavState;
    this.environment = environment;
    this.startTime = startTime;
    this.currentTime = (startTime) ? startTime : null;
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
    this.currentTime = dayjs(this.currentTime).add(this.timeIncrement, 'ms').toDate();
  }

  getDuration(): string {
    let hours = Math.floor(this.duration / (1000 * 60 * 60));
    let minutes = Math.floor((this.duration % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((this.duration % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default Simulation;
