import {
  MQ9,
  UAVState,
  Environment,
  Wind,
  Temperature,
  CardinalDirection,
  Knots,
  Feet,
} from "./uav";

import { MQ9Hud } from "./hud";
import { Simulation } from "./sim";

// create & init the UAV
let reaper = new MQ9();
reaper.setTailNumber("732");

let reaperState = new UAVState(reaper);

reaperState.setIntialAttitude({
  heading: new CardinalDirection(360),
  keas: new Knots(120),
  altitude: new Feet(20_000),
  gamma: -3,
  bank: -30,
});

// create & init the environment
let environment = new Environment();
environment.setWind(new Wind(270, 30));
environment.setSurfaceTemperature(new Temperature(80));

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

hud.render();

// init the simulation
let simulation = new Simulation(reaper, reaperState, environment);

console.log(hud, simulation);
