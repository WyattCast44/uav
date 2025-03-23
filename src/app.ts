import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Main variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let ground: THREE.Mesh;
let clock = new THREE.Clock();
let controls: OrbitControls;

// Camera and control settings
let controlMode = "UAV"; // "UAV" or "orbital"

// UAV model
let uavModel: THREE.Object3D;

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
  altitude: number;
  mode: ControlMode;
  gForce: number;
  bank: number;
  commandedBank: number;
  gearPosition: GearPosition;
  gamma: number;
  commandedGamma: number;
  verticalSpeed: number;
  position: THREE.Vector3;
};

const uavState = {
  tailNumber: "505",
  airspeed: 120,
  altitude: 1000,
  heading: 0,
  mode: ControlMode.MANUAL,
  gForce: 1,
  bank: 0,
  commandedBank: 0,
  gearPosition: GearPosition.UP,
  gamma: 0,
  commandedGamma: 0,
  verticalSpeed: 0,
  position: new THREE.Vector3(0, 300, 0),
} as UAVState;

// Control keys
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  q: false,
  e: false,
  r: false,
  f: false,
};

// Initialize the scene
function init() {
  let container = document.getElementById("simulation-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "simulation-container";
    document.body.appendChild(container);
  }

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );
  camera.position.set(0, 300, 200);
  camera.lookAt(0, 300, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Create orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = controlMode === "orbital";
  controls.maxPolarAngle = Math.PI * 0.45;
  controls.minDistance = 50;
  controls.maxDistance = 1000;

  // Create flat ground
  createGround();

  // Create simple lighting
  createLighting();

  // Create UAV model
  createUAVModel();

  // Window resize handler
  window.addEventListener("resize", onWindowResize);

  // Keyboard controls
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Toggle control mode with 'c' key
  document.addEventListener("keydown", (event) => {
    if (event.key === "c") {
      controlMode = controlMode === "UAV" ? "orbital" : "UAV";
      controls.enabled = controlMode === "orbital";
      console.log("Control mode: " + controlMode);
    }
  });
}

// Create a flat ground
function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,
    roughness: 0.8,
    metalness: 0.2
  });
  
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Add a grid for reference
  const gridHelper = new THREE.GridHelper(10000, 100);
  gridHelper.position.y = 0.1; // Just above the ground
  scene.add(gridHelper);
}

// Create basic lighting
function createLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(500, 800, -500);
  sunLight.castShadow = true;
  
  // Configure shadow
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  const d = 1000;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 2000;
  
  scene.add(sunLight);
}

// Create a simple UAV model
function createUAVModel() {
  const group = new THREE.Group();

  // UAV body
  const bodyGeometry = new THREE.ConeGeometry(5, 20, 8);
  bodyGeometry.rotateX(Math.PI / 2);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  group.add(body);

  // Wings
  const wingGeometry = new THREE.BoxGeometry(40, 1, 8);
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.5,
  });
  const wings = new THREE.Mesh(wingGeometry, wingMaterial);
  wings.position.set(0, -2, 0);
  group.add(wings);

  // Tail
  const tailGeometry = new THREE.BoxGeometry(10, 1, 5);
  const tail = new THREE.Mesh(tailGeometry, wingMaterial);
  tail.position.set(0, -2, -10);
  group.add(tail);

  // Vertical stabilizer
  const stabilizerGeometry = new THREE.BoxGeometry(1, 6, 8);
  const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
  stabilizer.position.set(0, 1, -10);
  group.add(stabilizer);

  // Direction arrow
  const dir = new THREE.Vector3(0, 0, -1);
  dir.normalize();
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 10;
  const arrowHelper = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
  group.add(arrowHelper);

  uavModel = group;
  uavModel.position.copy(uavState.position);
  uavModel.castShadow = true;
  scene.add(uavModel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event: KeyboardEvent) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key as keyof typeof keys] = true;
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key as keyof typeof keys] = false;
  }
}

// Normalize heading to 0-360 degrees
function normalizeHeading(heading: number): number {
  while (heading < 0) {
    heading += 360;
  }
  while (heading >= 360) {
    heading -= 360;
  }
  return heading;
}

// Calculate vertical speed based on pitch and airspeed
function calculateVerticalSpeed(groundSpeed: number, gamma: number): number {
  return groundSpeed * Math.sin(THREE.MathUtils.degToRad(gamma));
}

// Calculate bank angle g-force
function calculateGsAtBankAngle(bankAngle: number): number {
  return 1 / Math.cos(THREE.MathUtils.degToRad(bankAngle));
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Debug info
  document.getElementById("debug-info")?.remove();
  const debugInfo = document.createElement("div");
  debugInfo.id = "debug-info";
  debugInfo.style.position = "absolute";
  debugInfo.style.top = "10px";
  debugInfo.style.left = "10px";
  debugInfo.style.backgroundColor = "rgba(0,0,0,0.5)";
  debugInfo.style.color = "white";
  debugInfo.style.padding = "10px";
  debugInfo.style.fontFamily = "monospace";
  debugInfo.innerHTML = `
    Mode: ${controlMode}<br>
    Position: ${uavState.position.x.toFixed(0)}, ${uavState.position.y.toFixed(0)}, ${uavState.position.z.toFixed(0)}<br>
    Heading: ${uavState.heading.toFixed(1)}°<br>
    Altitude: ${uavState.altitude.toFixed(0)} ft<br>
    Airspeed: ${uavState.airspeed.toFixed(0)} kts<br>
    Bank: ${uavState.bank.toFixed(1)}° (commanded: ${uavState.commandedBank.toFixed(1)}°)<br>
    Pitch: ${uavState.gamma.toFixed(1)}° (commanded: ${uavState.commandedGamma.toFixed(1)}°)<br>
    Controls: WASD = Pitch/Bank, R/F = Speed, C = Toggle Mode
  `;
  document.body.appendChild(debugInfo);

  if (controlMode === "UAV") {
    // Safeguard against extreme attitudes
    if (uavState.gamma > 15) {
      uavState.gamma = 15;
      uavState.commandedGamma = 10;
    }
    if (uavState.gamma < -15) {
      uavState.gamma = -15;
      uavState.commandedGamma = -10;
    }
    
    updateUAVControls(delta);
    updateCamera();
  }

  renderer.render(scene, camera);
}

// Update UAV controls
function updateUAVControls(delta: number) {
  // Get heading in radians
  const headingRad = THREE.MathUtils.degToRad(normalizeHeading(uavState.heading));

  // Update bank angle (roll)
  if (keys.a) {
    // Bank left
    uavState.commandedBank += 30 * delta;
    if (uavState.commandedBank > 45) uavState.commandedBank = 45;
  }
  if (keys.d) {
    // Bank right
    uavState.commandedBank -= 30 * delta;
    if (uavState.commandedBank < -45) uavState.commandedBank = -45;
  }

  // Reset bank if no left/right input
  if (!keys.a && !keys.d) {
    if (Math.abs(uavState.commandedBank) < 1) {
      uavState.commandedBank = 0;
    } else {
      uavState.commandedBank *= 0.92; // Slightly faster return to level (was 0.95)
    }
  }

  // Smoothly interpolate actual bank toward commanded bank
  uavState.bank += (uavState.commandedBank - uavState.bank) * 2 * delta;

  // Update heading based on bank angle (higher bank = faster turn)
  const turnRate = (uavState.bank / 45) * 20 * delta; // max ~20 deg/sec
  uavState.heading = normalizeHeading(uavState.heading - turnRate);

  // Pitch control
  if (keys.w) {
    uavState.commandedGamma += 5 * delta;
    if (uavState.commandedGamma > 10) uavState.commandedGamma = 10; // Limit max pitch up
  }
  if (keys.s) {
    uavState.commandedGamma -= 5 * delta;
    if (uavState.commandedGamma < -10) uavState.commandedGamma = -10; // Limit max pitch down
  }

  // Reset pitch if no up/down input
  if (!keys.w && !keys.s) {
    if (Math.abs(uavState.commandedGamma) < 0.5) {
      uavState.commandedGamma = 0;
    } else {
      uavState.commandedGamma *= 0.9; // Faster return to level
    }
  }

  // Smoothly interpolate actual gamma toward commanded gamma
  uavState.gamma += (uavState.commandedGamma - uavState.gamma) * 1.5 * delta;

  // Speed control
  if (keys.r) {
    // Increase speed
    uavState.airspeed += 5 * delta;
    if (uavState.airspeed > 250) uavState.airspeed = 250;
  }
  if (keys.f) {
    // Decrease speed
    uavState.airspeed -= 5 * delta;
    if (uavState.airspeed < 60) uavState.airspeed = 60;
  }

  // Calculate g-force
  uavState.gForce = calculateGsAtBankAngle(uavState.bank);
  
  // Calculate vertical speed (simplified)
  uavState.verticalSpeed = calculateVerticalSpeed(uavState.airspeed, uavState.gamma);

  // Calculate movement vector
  const speed = (uavState.airspeed * delta) / 3; // Scale down for reasonable movement
  
  // Direction vectors
  const forward = new THREE.Vector3(
    -Math.sin(headingRad),
    0,
    -Math.cos(headingRad)
  );
  
  // Apply movement
  uavState.position.addScaledVector(forward, speed);
  
  // Apply climb/descent
  const verticalMovement = (uavState.verticalSpeed * delta) / 3;
  uavState.position.y += verticalMovement;
  
  // Ensure minimum altitude
  if (uavState.position.y < 10) {
    uavState.position.y = 10;
    // Level off if approaching ground
    if (uavState.gamma < 0) {
      uavState.gamma = 0;
      uavState.commandedGamma = 0;
    }
  }
  
  // Update altitude based on position (convert to feet)
  uavState.altitude = uavState.position.y * 3.28084;
  
  // Update UAV model position and rotation
  uavModel.position.copy(uavState.position);
  
  // Apply rotations - heading, bank and pitch
  uavModel.rotation.set(0, 0, 0); // Reset
  uavModel.rotateY(headingRad); // Apply heading (y-axis)
  uavModel.rotateZ(THREE.MathUtils.degToRad(uavState.bank)); // Apply bank (z-axis)
  uavModel.rotateX(THREE.MathUtils.degToRad(-uavState.gamma)); // Apply pitch (x-axis)
}

// Update camera to follow UAV
function updateCamera() {
  const headingRad = THREE.MathUtils.degToRad(normalizeHeading(uavState.heading));
  
  // Chase camera with improved positioning
  const cameraDistance = 80;  // Further back
  const cameraHeight = 20;    // Slightly higher
  
  const cameraOffset = new THREE.Vector3(
    Math.sin(headingRad) * cameraDistance,
    cameraHeight,
    Math.cos(headingRad) * cameraDistance
  );
  
  camera.position.copy(uavState.position).add(cameraOffset);
  camera.lookAt(uavModel.position);
  
  // Apply reduced bank to camera for better orientation
  const bankRad = THREE.MathUtils.degToRad(uavState.bank * 0.2);  // Reduced bank effect
  camera.up.set(Math.sin(bankRad), Math.cos(bankRad), 0);
}

// Start everything
init();
animate();