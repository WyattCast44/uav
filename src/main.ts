import { MQ9Hud } from "./hud";
import { Simulation } from "./sim";
import { MQ9, UAVState } from "./uav";
import {
  CardinalDegree,
  Knots,
  Feet,
  Environment,
  Wind,
  Temperature,
} from "./support";
import { BoardsStatus } from "./uav/BoardsStatus";

// create & init the UAV
let reaper = new MQ9();
reaper.setTailNumber("732");

// create & init the UAV state
let reaperState = new UAVState(reaper);

reaperState.boardsStatus = BoardsStatus.FULL;

reaperState.setIntialAttitude({
  heading: new CardinalDegree(360),
  keas: new Knots(120),
  altitude: new Feet(20_000),
  gamma: -5,
  bank: 45,
});

// create & init the environment
let environment = new Environment({
  wind: new Wind({ direction: 317, speed: 69 }),
  surfaceTemperature: Temperature.standardDayAtSeaLevel("F"),
});

// init the performance values
reaperState.updatePerformanceValues(environment);

// init the HUD
let hud = new MQ9Hud(reaper, reaperState, environment);

// mount the HUD to the target element
let target = document.getElementById("hud");

if (target) {
  hud.mount(target);
} else {
  console.error("HUD target element not found");
}

// init the simulation
let simulation = new Simulation(reaper, reaperState, environment);

console.log(hud, simulation);

// setup an animation loop
function animationLoop() {
  hud.render();
  requestAnimationFrame(animationLoop);
}

animationLoop();
