import * as THREE from "three";
import {
  calculateGroundSpeed,
  calculateGsAtBankAngle,
  calculateKTAS,
  calculateMachNumber,
  normalizeHeading,
  polarToCartesian,
  calculateWindCorrectedCourse,
  calculateVerticalSpeed,
} from "./math";

type Wind = {
  directionCardinal: number;
  speed: number;
};

type Simulation = {
  playing: boolean;
  timeSinceStart: number;
  uavState: UAVState;
  wasStarted: boolean;
  wind: Wind;
};

enum ControlMode {
  MANUAL = "manual",
  AUTOPILOT = "autopilot",
  AUTO = "auto",
}

enum GearPosition {
  DOWN = "down",
  UP = "up",
  TRANSIT = "transit",
}

type UAVState = {
  tailNumber: string;
  airspeed: number;
  heading: number;
  course?: number;
  altitude: number;
  mode: ControlMode;
  ktas?: number;
  mach?: number;
  groundSpeed?: number;
  gForce: number;
  bank: number;
  commandedBank: number;
  gearPosition: GearPosition;
  gamma: number;
  commandedGamma: number;
  verticalSpeed: number;
};

const wind: Wind = {
  directionCardinal: 270,
  speed: 30,
};

const uavState: UAVState = {
  tailNumber: "505",
  airspeed: 120,
  altitude: 10_000,
  heading: 360,
  course: undefined,
  mode: ControlMode.MANUAL,
  ktas: undefined,
  mach: undefined,
  groundSpeed: undefined,
  gForce: 1,
  bank: 0,
  commandedBank: 0,
  gearPosition: GearPosition.UP,
  gamma: 0,
  commandedGamma: 0,
  verticalSpeed: 0,
};

uavState.ktas = calculateKTAS(uavState.airspeed, uavState.altitude);
uavState.mach = calculateMachNumber(uavState.airspeed, uavState.altitude);
uavState.gForce = calculateGsAtBankAngle(uavState.bank);
uavState.course = calculateWindCorrectedCourse(
  uavState.ktas,
  uavState.heading,
  wind.directionCardinal,
  wind.speed
);
uavState.groundSpeed = calculateGroundSpeed(
  uavState.ktas,
  uavState.heading,
  wind.directionCardinal,
  wind.speed
);
uavState.verticalSpeed = calculateVerticalSpeed(
  uavState.groundSpeed,
  uavState.gamma
);

const simulation: Simulation = {
  wasStarted: false,
  playing: false,
  timeSinceStart: 0,
  uavState: uavState,
  wind: wind,
};

document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    simulation.playing = !simulation.playing;
    simulation.wasStarted = true;
  }
});

// Helper function to rotate a point around a center point
function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  angle: number
) {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

function drawHudGraphics(canvas: HTMLCanvasElement, simulation: Simulation) {
  let graphicsColor: string = "green";

  if (simulation.uavState.mode === ControlMode.MANUAL) {
    graphicsColor = "green";
  }

  if (simulation.uavState.mode === ControlMode.AUTOPILOT) {
    graphicsColor = "cyan";
  }

  if (simulation.uavState.mode === ControlMode.AUTO) {
    graphicsColor = "hotpink";
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("HUD canvas context not found");
  }

  // Get the device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Set the canvas size accounting for device pixel ratio
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  // Scale the context to account for the pixel ratio
  ctx.scale(dpr, dpr);

  // Clear with the scaled dimensions
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  /*
  |--------------------------------
  | Airspeed
  |--------------------------------
   */
  let airspeedX = displayWidth / 6;
  let airspeedY = displayHeight / 2;
  ctx.font = "22px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(simulation.uavState.airspeed.toFixed(0), airspeedX, airspeedY);

  // now draw the box around the airspeed
  ctx.strokeStyle = graphicsColor;
  ctx.lineWidth = 1;
  let boxWidth = 85;
  let boxHeight = 30;
  ctx.strokeRect(
    airspeedX - boxWidth / 2,
    airspeedY - boxHeight / 2 - 7,
    boxWidth,
    boxHeight
  );

  /*
  |--------------------------------
  | Altitude
  |--------------------------------
   */
  let altitudeX = (displayWidth / 6) * 5;
  let altitudeY = displayHeight / 2;
  ctx.font = "22px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(simulation.uavState.altitude.toFixed(0), altitudeX, altitudeY);

  // now lets draw the box around the altitude
  ctx.strokeStyle = graphicsColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    altitudeX - boxWidth / 2,
    altitudeY - boxHeight / 2 - 7,
    boxWidth,
    boxHeight
  );

  /*
  |--------------------------------
  | Vertical Speed
  |--------------------------------
   */
  let verticalSpeedX = (displayWidth / 6) * 5;
  let verticalSpeedY = altitudeY + 40;
  ctx.font = "16px monospace";
  ctx.fillStyle = graphicsColor;
  ctx.textAlign = "center";
  ctx.fillText(
    simulation.uavState.verticalSpeed.toFixed(0),
    verticalSpeedX,
    verticalSpeedY
  );

  /*
  |--------------------------------
  | Tail Number
  |--------------------------------
   */
  boxWidth = 65;
  boxHeight = 30;
  let tailNumberX = 40;
  let tailNumberY = 30;

  // now lets draw the box around the tail number
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    tailNumberX - boxWidth / 2,
    tailNumberY - boxHeight / 2 - 7,
    boxWidth,
    boxHeight
  );
  ctx.fillStyle = "black";
  ctx.fillRect(
    tailNumberX - boxWidth / 2,
    tailNumberY - boxHeight / 2 - 7,
    boxWidth,
    boxHeight
  );

  ctx.font = "22px monospace";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(simulation.uavState.tailNumber, tailNumberX, tailNumberY);

  /*
  |--------------------------------
  | Heading
  |--------------------------------
  */
  let headingX = displayWidth / 2;
  let headingY = 35;

  // now lets actually draw the heading strip
  let headingStripX = headingX;
  let headingStripY = headingY + 20;
  let headingStripWidth = 275;
  let headingStripHeight = 8;
  let tickSpacing = headingStripWidth / 60;
  let minorTickHeight = headingStripHeight / 2;
  let majorTickHeight = headingStripHeight;

  let ticks = [];
  let labels = [];

  let normalizedHeading = normalizeHeading(simulation.uavState.heading);

  for (let offset = -30; offset <= 30; offset++) {
    // add the offset to the normalized heading
    let tickHeading = normalizedHeading + offset;

    // normalize the tick heading
    tickHeading = normalizeHeading(tickHeading);

    tickHeading = parseFloat(tickHeading.toFixed(0));

    // calculate the x position of the tick
    let x = offset * tickSpacing;

    let course = parseFloat(simulation.uavState.course?.toFixed(0) || "0");

    if (tickHeading === course) {
      // we need to draw the course indicator
      // now lets draw the commanded bank indicator
      let tipPoint = {
        x: x + headingStripX,
        y: headingStripY + 10,
      };
      let leftBase = {
        x: x - 5 + headingStripX,
        y: headingStripY + 15,
      };
      let rightBase = {
        x: x + 5 + headingStripX,
        y: headingStripY + 15,
      };

      ctx.beginPath();
      ctx.strokeStyle = graphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(leftBase.x, leftBase.y);
      ctx.lineTo(tipPoint.x, tipPoint.y);
      ctx.lineTo(rightBase.x, rightBase.y);
      ctx.closePath();
      ctx.fillStyle = graphicsColor;
      ctx.fill();
      ctx.stroke();
    }

    // determine the height of the tick based on the heading
    let tickHeight = tickHeading % 10 === 0 ? majorTickHeight : minorTickHeight;

    if (tickHeading % 10 === 0) {
      // major tick, they are taller than the minor ticks
      // and they start at the bottom of the heading strip
      ticks.push({ x, y: headingStripY, height: tickHeight });
    }

    if (tickHeading % 5 === 0) {
      // minor tick, they are shorter than the major ticks
      // and they start at the bottom of the heading strip
      ticks.push({ x, y: headingStripY + minorTickHeight, height: tickHeight });
    }

    if (tickHeading % 10 === 0 && offset !== 0 && Math.abs(offset) > 6) {
      labels.push({
        x,
        y: headingStripY,
        text: tickHeading.toString().slice(0, 2),
      });
    }
  }

  // now lets draw the ticks
  for (let tick of ticks) {
    ctx.fillStyle = graphicsColor;
    ctx.fillRect(tick.x + headingStripX, tick.y - tick.height, 1, tick.height);
  }

  // now lets draw the labels
  for (let label of labels) {
    ctx.fillStyle = "white";
    ctx.font = "10px monospace";
    ctx.fillText(label.text, label.x + headingStripX, label.y - 14);
  }

  // now lets draw the box around the heading
  ctx.strokeStyle = graphicsColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    headingX - boxWidth / 2,
    headingY - boxHeight / 2 - 6,
    boxWidth,
    boxHeight
  );
  ctx.fillStyle = "black";
  ctx.fillRect(
    headingX - boxWidth / 2,
    headingY - boxHeight / 2 - 6,
    boxWidth,
    boxHeight
  );

  ctx.font = "22px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(
    simulation.uavState.heading.toFixed(0).padStart(3, "0"),
    headingX,
    headingY
  );

  /*
  |--------------------------------
  | Ground Speed
  |--------------------------------
   */
  let groundSpeedX = displayWidth / 6;
  let groundSpeedY = airspeedY + 40;

  ctx.font = "16px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  if (simulation.uavState.groundSpeed) {
    ctx.fillStyle = graphicsColor;
    ctx.fillText(
      "GS " + simulation.uavState.groundSpeed.toFixed(0),
      groundSpeedX,
      groundSpeedY
    );
  }

  /*
  |--------------------------------
  | Mach #
  |--------------------------------
  */
  let machX = displayWidth / 6;
  let machY = groundSpeedY + 20;

  // now lets draw the mach
  ctx.font = "16px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  if (simulation.uavState.mach) {
    ctx.fillStyle = graphicsColor;
    ctx.fillText("M " + simulation.uavState.mach.toFixed(2), machX, machY);
  }

  /*
  |--------------------------------
  | G Force
  |--------------------------------
  */
  let gForceX = displayWidth / 6;
  let gForceY = machY + 20;

  ctx.font = "16px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillStyle = graphicsColor;
  ctx.fillText("G " + simulation.uavState.gForce.toFixed(1), gForceX, gForceY);

  /*
  |--------------------------------
  | Bank Indicator Gauge
  |--------------------------------
  */
  let bankX = displayWidth / 2;
  let bankY = displayHeight - 250;
  let bankRadius = 150;

  let angles = [-45, -30, -20, -10, 0, 10, 20, 30, 45];

  ticks = [];

  for (let angle of angles) {
    let tickLength = angle % 45 === 0 ? 15 : angle % 10 === 0 ? 10 : 7;

    if (angle === 45 || angle === -45) {
      // only show the 45 and -45 ticks if either the bank or commanded bank greater than +/-30 degrees
      if (
        !(
          Math.abs(simulation.uavState.bank) > 30 ||
          Math.abs(simulation.uavState.commandedBank) > 30
        )
      ) {
        tickLength = 0;
      }
    }

    let startPoint = polarToCartesian(bankX, bankY, bankRadius, angle + 90);
    let endPoint = polarToCartesian(
      bankX,
      bankY,
      bankRadius - tickLength,
      angle + 90
    );

    ticks.push({
      start: startPoint,
      end: endPoint,
      length: tickLength,
      angle: angle,
    });
  }

  for (let tick of ticks) {
    ctx.beginPath();
    ctx.strokeStyle = graphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(tick.start.x, tick.start.y);
    ctx.lineTo(tick.end.x, tick.end.y);
    ctx.stroke();
  }

  /*
  |--------------------------------
  | Commanded Bank Indicator
  |--------------------------------
  */
  let commandedBankAngle = simulation.uavState.commandedBank + 90;

  let tipPoint = polarToCartesian(bankX, bankY, bankRadius, commandedBankAngle);
  let leftBase = polarToCartesian(
    bankX,
    bankY,
    bankRadius + 10,
    commandedBankAngle - 3
  );
  let rightBase = polarToCartesian(
    bankX,
    bankY,
    bankRadius + 10,
    commandedBankAngle + 3
  );

  ctx.beginPath();
  ctx.strokeStyle = graphicsColor;
  ctx.lineWidth = 1;
  ctx.moveTo(leftBase.x, leftBase.y);
  ctx.lineTo(tipPoint.x, tipPoint.y);
  ctx.lineTo(rightBase.x, rightBase.y);
  ctx.closePath();
  ctx.fillStyle = graphicsColor;
  ctx.fill();
  ctx.stroke();

  /*
  |--------------------------------
  | Pitch Ladder
  | - it's rotated to the current bank angle
  |--------------------------------
  */
  let standardLadderLineWidth = 140;
  //let gearDownLadderLineWidth = 100;
  let horizonLadderLineWidth = 225;
  let ladderCenterGapWidth = 75;

  let gearUpLadders = [
    -45, -40, -35, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 35, 40,
    45,
  ];

  let gearDownLadders = [
    -45, -40, -35, -30, -25, -20, -15, -10, -5, -2.5, 2.5, 5, 10, 15, 20, 25,
    30, 35, 40, 45,
  ];

  // we need to determine the vertical spacing of the ladders
  let ladders =
    simulation.uavState.gearPosition === GearPosition.UP
      ? gearUpLadders
      : gearDownLadders;

  let verticalSpacing = displayHeight / (gearUpLadders.length + 5);
  let lines = [];

  // lets draw the horizontal ladder line first
  // each ladder will have two portions, the left and right
  // they will be separated by the gap width
  // and they will be the line width / 2
  let horizontalLadderLine = {
    left: {
      start: {
        x: displayWidth / 2 - horizonLadderLineWidth,
        y: displayHeight / 2 - 8,
      },
      end: {
        x: displayWidth / 2 - ladderCenterGapWidth / 2,
        y: displayHeight / 2 - 8,
      },
    },
    right: {
      start: {
        x: displayWidth / 2 + horizonLadderLineWidth,
        y: displayHeight / 2 - 8,
      },
      end: {
        x: displayWidth / 2 + ladderCenterGapWidth / 2,
        y: displayHeight / 2 - 8,
      },
    },
  };

  for (let ladderDegree of ladders) {
    let ladderLine = {
      left: {
        start: {
          x: displayWidth / 2 - standardLadderLineWidth,
          y: displayHeight / 2 - 8 + -ladderDegree * verticalSpacing,
        },
        end: {
          x: displayWidth / 2 - ladderCenterGapWidth / 2,
          y: displayHeight / 2 - 8 + -ladderDegree * verticalSpacing,
        },
      },
      right: {
        start: {
          x: displayWidth / 2 + standardLadderLineWidth,
          y: displayHeight / 2 - 8 + -ladderDegree * verticalSpacing,
        },
        end: {
          x: displayWidth / 2 + ladderCenterGapWidth / 2,
          y: displayHeight / 2 - 8 + -ladderDegree * verticalSpacing,
        },
      },
      degree: ladderDegree,
    };

    lines.push(ladderLine);
  }

  // now lets draw the horizontal ladder line
  const screenCenter = {
    x: displayWidth / 2,
    y: displayHeight / 2,
  };

  // Rotate the horizontal ladder line
  const rotatedHorizontalLeft = {
    start: rotatePoint(
      horizontalLadderLine.left.start,
      screenCenter,
      simulation.uavState.bank
    ),
    end: rotatePoint(
      horizontalLadderLine.left.end,
      screenCenter,
      simulation.uavState.bank
    ),
  };

  const rotatedHorizontalRight = {
    start: rotatePoint(
      horizontalLadderLine.right.start,
      screenCenter,
      simulation.uavState.bank
    ),
    end: rotatePoint(
      horizontalLadderLine.right.end,
      screenCenter,
      simulation.uavState.bank
    ),
  };

  // Draw the rotated horizontal ladder line
  ctx.beginPath();
  ctx.strokeStyle = graphicsColor;
  ctx.lineWidth = 1;
  ctx.moveTo(rotatedHorizontalLeft.start.x, rotatedHorizontalLeft.start.y);
  ctx.lineTo(rotatedHorizontalLeft.end.x, rotatedHorizontalLeft.end.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rotatedHorizontalRight.start.x, rotatedHorizontalRight.start.y);
  ctx.lineTo(rotatedHorizontalRight.end.x, rotatedHorizontalRight.end.y);
  ctx.stroke();

  // For the pitch ladders, rotate each line
  for (let line of lines) {
    // First rotate each line by its pitch degree around its center point
    const leftCenter = {
      x: (line.left.start.x + line.left.end.x) / 2,
      y: (line.left.start.y + line.left.end.y) / 2,
    };

    const rightCenter = {
      x: (line.right.start.x + line.right.end.x) / 2,
      y: (line.right.start.y + line.right.end.y) / 2,
    };

    // Rotate the left line by negative degree (to make negative pitch point down)
    const pitchRotatedLeft = {
      start: rotatePoint(line.left.start, leftCenter, line.degree),
      end: rotatePoint(line.left.end, leftCenter, line.degree),
    };

    // Rotate the right line by negative degree
    const pitchRotatedRight = {
      start: rotatePoint(line.right.start, rightCenter, -line.degree),
      end: rotatePoint(line.right.end, rightCenter, -line.degree),
    };

    // Then apply the bank rotation to the pitch-rotated lines
    const rotatedLeft = {
      start: rotatePoint(
        pitchRotatedLeft.start,
        screenCenter,
        simulation.uavState.bank
      ),
      end: rotatePoint(
        pitchRotatedLeft.end,
        screenCenter,
        simulation.uavState.bank
      ),
    };

    const rotatedRight = {
      start: rotatePoint(
        pitchRotatedRight.start,
        screenCenter,
        simulation.uavState.bank
      ),
      end: rotatePoint(
        pitchRotatedRight.end,
        screenCenter,
        simulation.uavState.bank
      ),
    };

    // Set dash pattern as before
    let numDashes = 3;
    let dashGap = 4;
    let dashLength =
      (line.left.end.x - line.left.start.x - dashGap) / numDashes;
    ctx.setLineDash([dashLength, dashGap]);

    if (line.degree > 0) {
      ctx.setLineDash([]);
    }

    // Draw rotated lines
    ctx.beginPath();
    ctx.strokeStyle = graphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedLeft.start.x, rotatedLeft.start.y);
    ctx.lineTo(rotatedLeft.end.x, rotatedLeft.end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rotatedRight.start.x, rotatedRight.start.y);
    ctx.lineTo(rotatedRight.end.x, rotatedRight.end.y);
    ctx.stroke();
  }

  /*
  |--------------------------------
  | Flight Path Marker 
  |--------------------------------
  */
  // Use screenCenter.x to keep it centered horizontally
  let flightPathMarkerX = screenCenter.x;
  let flightPathMarkerY = screenCenter.y;
  let flightPathMarkerRadius = 8;
  let flightPathMarkerLineLength = 15;

  // move the flight path marker vertically based on gamma
  flightPathMarkerY =
    screenCenter.y - 8 + -simulation.uavState.gamma * verticalSpacing;

  const center = {
    x: flightPathMarkerX,
    y: flightPathMarkerY,
  };

  // First rotate the marker position around the screen center based on bank
  const rotatedCenter = rotatePoint(
    center,
    screenCenter,
    simulation.uavState.bank
  );

  // Calculate the points for the marker relative to the rotated center
  const topLine = {
    start: {
      x: rotatedCenter.x,
      y: rotatedCenter.y - flightPathMarkerRadius,
    },
    end: {
      x: rotatedCenter.x,
      y: rotatedCenter.y - flightPathMarkerRadius - flightPathMarkerLineLength,
    },
  };

  const leftLine = {
    start: {
      x: rotatedCenter.x - flightPathMarkerRadius,
      y: rotatedCenter.y,
    },
    end: {
      x: rotatedCenter.x - flightPathMarkerRadius - flightPathMarkerLineLength,
      y: rotatedCenter.y,
    },
  };

  const rightLine = {
    start: {
      x: rotatedCenter.x + flightPathMarkerRadius,
      y: rotatedCenter.y,
    },
    end: {
      x: rotatedCenter.x + flightPathMarkerRadius + flightPathMarkerLineLength,
      y: rotatedCenter.y,
    },
  };

  // Rotate the lines around the rotated center by the bank angle
  const rotatedTopLine = {
    start: rotatePoint(topLine.start, rotatedCenter, simulation.uavState.bank),
    end: rotatePoint(topLine.end, rotatedCenter, simulation.uavState.bank),
  };

  const rotatedLeftLine = {
    start: rotatePoint(leftLine.start, rotatedCenter, simulation.uavState.bank),
    end: rotatePoint(leftLine.end, rotatedCenter, simulation.uavState.bank),
  };

  const rotatedRightLine = {
    start: rotatePoint(
      rightLine.start,
      rotatedCenter,
      simulation.uavState.bank
    ),
    end: rotatePoint(rightLine.end, rotatedCenter, simulation.uavState.bank),
  };

  // Draw the circle at the rotated center position
  ctx.beginPath();
  ctx.arc(
    rotatedCenter.x,
    rotatedCenter.y,
    flightPathMarkerRadius,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Draw the rotated lines
  ctx.beginPath();
  ctx.moveTo(rotatedTopLine.start.x, rotatedTopLine.start.y);
  ctx.lineTo(rotatedTopLine.end.x, rotatedTopLine.end.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rotatedLeftLine.start.x, rotatedLeftLine.start.y);
  ctx.lineTo(rotatedLeftLine.end.x, rotatedLeftLine.end.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rotatedRightLine.start.x, rotatedRightLine.start.y);
  ctx.lineTo(rotatedRightLine.end.x, rotatedRightLine.end.y);
  ctx.stroke();

  /*
    |--------------------------------
    | GMT Clock
    |--------------------------------
     */
    let clockX = displayWidth - 150;
    let clockY = displayHeight - displayHeight +150;

    let clock = new Date();
    let clockHours = clock.getHours();
    let clockMinutes = clock.getMinutes();
    let clockSeconds = clock.getSeconds().toString().padStart(2, "0");

    let clockString = `${clockHours}:${clockMinutes}:${clockSeconds}`;

    ctx.font = "16px monospace";
    ctx.fillStyle = graphicsColor;
    ctx.textAlign = "center";
    ctx.fillText(clockString, clockX, clockY);

    /*
    |--------------------------------
    | Simulation Time
    |--------------------------------
     */
    let simulationTimeX = displayWidth - 150;
    let simulationTimeY = displayHeight - displayHeight + 170;

    let simulationTime = simulation.timeSinceStart;
    let simulationHours = Math.floor(simulationTime / 3600).toString().padStart(2, "0");
    let simulationMinutes = Math.floor((simulationTime % 3600) / 60).toString().padStart(2, "0");
    let simulationSeconds = Math.floor(simulationTime % 60).toString().padStart(2, "0");

    let simulationTimeString = `${simulationHours}:${simulationMinutes}:${simulationSeconds}`;

    ctx.font = "16px monospace";
    ctx.fillStyle = graphicsColor;
    ctx.textAlign = "center";
    ctx.fillText(simulationTimeString, simulationTimeX, simulationTimeY);
    
}

document.addEventListener("DOMContentLoaded", () => {
  // get the hud container
  let hudContainer = document.getElementById("hud");
  let hudCanvas = document.getElementById("hud-canvas");
  if (!hudContainer) {
    throw new Error("HUD container not found");
  }

  // get the fov of the camera
  let fov = 75;

  // get the aspect ratio of the camera
  let aspect = hudContainer.clientWidth / hudContainer.clientHeight;

  // near is the near clipping plane of the camera
  let near = 0.1;

  // far is the far clipping plane of the camera
  let far = 1000;

  // okay every threejs app needs a scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  const renderer = new THREE.WebGLRenderer();

  // set the size of the renderer to the size of the hud container
  renderer.setSize(hudContainer.clientWidth, hudContainer.clientHeight);

  // set the innerHTML of the hud container to the renderer.domElement
  hudContainer.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // get the color from the simulation
  const color = "Tan";
  const material = new THREE.MeshBasicMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  renderer.setAnimationLoop(animate);

  function animate() {
    if (!simulation.wasStarted) {
      drawHudGraphics(hudCanvas as HTMLCanvasElement, simulation);
      renderer.render(scene, camera);
      return;
    }

    if (!simulation.playing) return;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    simulation.timeSinceStart += 0.01;

    // update the mode to random
    if (Math.random() > 0.8) {
      simulation.uavState.mode =
        Math.random() > 0.5 ? ControlMode.AUTOPILOT : ControlMode.MANUAL;
      simulation.uavState.airspeed += Math.random() > 0.5 ? 1 : -1;
      simulation.uavState.altitude += Math.random() > 0.5 ? 50 : -50;
      simulation.uavState.heading = normalizeHeading(
        simulation.uavState.heading + (Math.random() > 0.5 ? 1 : -1)
      );
      simulation.uavState.commandedBank += Math.random() > 0.5 ? 1 : -1;
      // use the commanded bank to calculate the bank
      simulation.uavState.bank = simulation.uavState.commandedBank;

      // update the gamma
      simulation.uavState.commandedGamma += Math.random() > 0.5 ? 0.1 : -0.1;
      simulation.uavState.gamma = simulation.uavState.commandedGamma;
    }

    // update the uav state
    simulation.uavState.ktas = calculateKTAS(
      simulation.uavState.airspeed,
      simulation.uavState.altitude
    );

    simulation.uavState.mach = calculateMachNumber(
      simulation.uavState.airspeed,
      simulation.uavState.altitude
    );

    simulation.uavState.gForce = calculateGsAtBankAngle(
      simulation.uavState.bank
    );

    simulation.uavState.course = calculateWindCorrectedCourse(
      simulation.uavState.ktas,
      simulation.uavState.heading,
      simulation.wind.directionCardinal,
      simulation.wind.speed
    );

    simulation.uavState.groundSpeed = calculateGroundSpeed(
      simulation.uavState.ktas,
      simulation.uavState.heading,
      simulation.wind.directionCardinal,
      simulation.wind.speed
    );

    simulation.uavState.verticalSpeed = calculateVerticalSpeed(
      simulation.uavState.groundSpeed,
      simulation.uavState.gamma
    );

    renderer.render(scene, camera);

    drawHudGraphics(hudCanvas as HTMLCanvasElement, simulation);
  }

  renderer.setAnimationLoop(animate);
});
