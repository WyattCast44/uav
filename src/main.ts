import { MQ9Hud } from "./hud";
import { Simulation } from "./sim";
import { MQ9, UAVCommandedAttitude, UAVState } from "./uav";
import {
  CardinalDegree,
  Knots,
  Feet,
  Environment,
  Wind,
  Temperature,
} from "./support";

// create & init the environment
let environment = new Environment({
  wind: new Wind({ direction: 317, speed: 69 }),
  surfaceTemperature: Temperature.standardDayAtSeaLevel("F"),
});

// create & init the UAV
let reaper = new MQ9("732");

// create & init the UAV state
let reaperState = new UAVState(reaper);

reaperState.setIntialAttitude({
  heading: new CardinalDegree(360),
  keas: new Knots(120),
  altitude: new Feet(20_000),
  gamma: 0,
  bank: 0,
  position: {
    x: 0,
    y: 0,
  },
});

// init the performance values
reaperState.updatePerformanceValues(environment);

// init the commanded attitude
let commandedAttitude = new UAVCommandedAttitude(reaper, reaperState);

console.log(commandedAttitude);

// init the simulation
let simulation = new Simulation({
  uav: reaper,
  uavState: reaperState,
  environment: environment,
  startTime: new Date(),
});

// hook up event listeners to start/stop the simulation
window.addEventListener("keyup", (event: KeyboardEvent) => {
  if (event.key === " ") {
    if (simulation.isRunning()) {
      simulation.stop();
      lastTimestamp = 0; // Reset timestamp when pausing
    } else {
      simulation.start(new Date());
      lastTimestamp = performance.now(); // Set initial timestamp when starting
    }
  }
});

// init and mount the HUD
let hud = new MQ9Hud(reaper, reaperState, environment, simulation);
let target = document.getElementById("hud") as HTMLElement;
hud.mount(target);

// setup animation loop variables
let lastTimestamp = 0;

// render the HUD at least once
hud.render(simulation.currentTime ?? new Date());

function animationLoop(timestamp: number) {
  if (!simulation.isRunning()) {
    requestAnimationFrame(animationLoop);
    return;
  }

  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animationLoop);
    return;
  }

  let deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  simulation.incrementTime(deltaTime);
  reaperState.updatePerformanceValues(environment);
  hud.render(simulation.currentTime ?? new Date());

  requestAnimationFrame(animationLoop);
}

// Start the animation loop
requestAnimationFrame(animationLoop);

