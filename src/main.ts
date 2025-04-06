import { MQ9Hud } from "./hud";
import { Simulation } from "./sim";
import { MQ9 } from "./uav";
import {
  CardinalDegree,
  Knots,
  Feet,
  Environment,
  Wind,
  Temperature,
  Degrees,
} from "./support";
import KeyboardUAVController from "./uav/controllers/KeyboardUAVController";

// create & init the environment
let environment = new Environment({
  wind: new Wind({ direction: 270, speed: 30 }),
  surfaceTemperature: Temperature.standardDayAtSeaLevel("F"),
});

// create & init the UAV
let reaper = new MQ9("732");

reaper.state.setIntialAttitude({
  heading: new CardinalDegree(360),
  keas: new Knots(120),
  altitude: new Feet(20_000),
  gamma: new Degrees(0),
  bank: new Degrees(0),
  position: {
    x: 0,
    y: 0,
  },
});

// init the performance values
reaper.state.updatePerformanceValues(environment);

// init the keyboard controller
let controls = new KeyboardUAVController(reaper);

// init the simulation
let simulation = new Simulation({
  uav: reaper,
  environment: environment,
  controller: controls,
  startTime: new Date(),
});

// init and mount the HUD
let hud = new MQ9Hud(reaper, environment, simulation);
hud.mount(document.getElementById("hud") as HTMLElement);

// render the HUD at least once
hud.render(simulation.startTime as Date);

// setup animation loop variables
let lastTimestamp = 0;

function animationLoop(timestamp: number) {
  // if the simulation is not running, don't render, but continue the loop
  if (!simulation.isRunning()) {
    requestAnimationFrame(animationLoop);
    return;
  }

  // if the last timestamp is 0, set it to the current timestamp and continue the loop
  // the lastTimestamp might be 0 if the simulation was paused.
  // or it might be 0 if the application was just loaded.
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animationLoop);
    return;
  }

  // calculate the delta time between the current and last frame
  let deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // increment the simulation time by the delta time
  simulation.incrementTime(deltaTime);

  // update the performance values
  reaper.state.updatePerformanceValues(environment);

  // render the HUD
  hud.render(simulation.currentTime ?? new Date());

  // continue the loop
  requestAnimationFrame(animationLoop);
}

// Start the animation loop
requestAnimationFrame(animationLoop);
