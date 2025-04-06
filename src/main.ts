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

// init the keyboard controller
let controls = new KeyboardUAVController();

// create & init the environment
let environment = new Environment({
  wind: new Wind({ direction: 270, speed: 30 }),
  surfaceTemperature: Temperature.standardDayAtSeaLevel("F"),
});

// create & init the UAV
let reaper = new MQ9("732", controls);

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

// init the simulation
let simulation = new Simulation({
  uav: reaper,
  environment: environment,
  startTime: null, // Don't set start time until spacebar is pressed
});

// init and mount the HUD
let hud = new MQ9Hud(reaper, environment, simulation);
hud.mount(document.getElementById("hud") as HTMLElement);

// render the HUD at least once
hud.render();

// Set up the render callback for the simulation
simulation.setRenderCallback((time: Date) => {
  hud.render(time);
});
