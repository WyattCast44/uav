import dayjs from "dayjs";
import { Environment } from "../support";
import { UAV } from "../uav";
import UAVAttitudeEstimator from "../uav/UAVAttitudeEstimator";

/**
 * The Simulation class manages the core simulation loop and state.
 * It handles:
 * - Time management (simulation time, duration, increments)
 * - Animation frame loop
 * - UAV state updates
 * - Pause/resume functionality
 * - HUD rendering coordination
 */
class Simulation {
  // Core simulation components
  public readonly uav: UAV;
  public readonly environment: Environment;

  // Time management
  private startTime: Date | null;
  private duration: number = 0; // in milliseconds
  private timeIncrement: number = 0; // in milliseconds

  // Animation loop state
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private renderCallback: ((time: Date) => void) | null = null;

  // Simulation state
  private isRunning: boolean = false;
  private hasBeenStarted: boolean = false;

  private attitudeEstimator: UAVAttitudeEstimator;

  constructor({
    uav,
    environment,
    startTime,
  }: {
    uav: UAV;
    environment: Environment;
    startTime: Date | null;
  }) {
    this.uav = uav;
    this.environment = environment;
    this.startTime = startTime;
    
    // Initialize the attitude estimator
    this.attitudeEstimator = new UAVAttitudeEstimator(uav, uav.state);
    
    this.setupSpacebarListener();
  }

  /**
   * Sets up the spacebar listener for starting/pausing/resuming the simulation
   */
  private setupSpacebarListener(): void {
    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === " ") {
        if (!this.hasBeenStarted) {
          this.start();
        } else {
          this.togglePause();
        }
      }
    });
  }

  /**
   * Toggles the simulation between paused and running states
   */
  private togglePause(): void {
    if (this.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Sets the callback function that will be called each frame to render the HUD
   */
  public setRenderCallback(callback: (time: Date) => void): void {
    this.renderCallback = callback;
  }

  /**
   * Updates the UAV's state based on current conditions
   * This includes:
   * - Updating performance values based on environment
   * - Applying controller inputs
   * - Updating attitude based on commanded values
   */
  private updateUAVState(): void {
    if (!this.isRunning) return;
    
    // Update commanded attitude based on keyboard inputs
    this.uav.commandedAttitude.updateFromKeyboardInputs(this.timeIncrement);
    
    // Update actual attitude based on commanded attitude and dynamics
    this.attitudeEstimator.estimateAttitudeBasedOnTimeIncrement(this.timeIncrement);
    
    // Update performance values based on environment
    this.uav.state.updatePerformanceValues(this.environment);
  }

  /**
   * Gets the current simulation time
   */
  public getCurrentTime(): Date | null {
    if (!this.startTime) return null;
    return dayjs(this.startTime).add(this.duration, 'ms').toDate();
  }

  /**
   * The main animation loop that drives the simulation
   * This function is called by requestAnimationFrame
   */
  private animationLoop(timestamp: number): void {
    // Skip frame if simulation is paused
    if (!this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
      return;
    }

    // Initialize timestamp on first frame
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
      return;
    }

    // Calculate time since last frame
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Update simulation state
    this.incrementTime(deltaTime);
    this.updateUAVState();

    // Render the HUD if callback is set
    if (this.renderCallback) {
      const currentTime = this.getCurrentTime();
      if (currentTime) {
        this.renderCallback(currentTime);
      }
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
  }

  /**
   * Starts the simulation from the beginning
   */
  public start(): void {
    if (!this.startTime) {
      this.startTime = new Date();
    }

    this.isRunning = true;
    this.lastTimestamp = 0;

    if (!this.hasBeenStarted) {
      this.hasBeenStarted = true;
      this.duration = 0;
    }

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
    }
  }

  /**
   * Pauses the simulation
   */
  public pause(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resumes the simulation from where it was paused
   */
  public resume(): void {
    if (!this.startTime) return;
    
    this.isRunning = true;
    this.lastTimestamp = 0; // Reset timestamp to ensure smooth resumption
    
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.animationLoop.bind(this));
    }
  }

  /**
   * Checks if the simulation is currently running
   */
  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Increments the simulation time by the given amount
   */
  private incrementTime(timeSinceLastFrameMilliseconds: number): void {
    this.timeIncrement = timeSinceLastFrameMilliseconds;
    this.duration += this.timeIncrement;
  }

  /**
   * Returns the current simulation duration in HH:MM:SS format
   */
  public getDuration(): string {
    const hours = Math.floor(this.duration / (1000 * 60 * 60));
    const minutes = Math.floor((this.duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((this.duration % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

export default Simulation;
