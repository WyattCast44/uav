import { polarToCartesian } from "./math";
import { UAV, UAVState, Environment, MQ9, UAVControlMode } from "./uav";

class HUDCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  target?: HTMLElement;
  isMounted: boolean = false;
  dpr: number = 1;
  displayWidth: number = 0;
  displayHeight: number = 0;

  displayItems: Array<CallableFunction> = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.dpr = window.devicePixelRatio || 1;
    this.context.scale(this.dpr, this.dpr);
    this.clear();
    this.#setCanvasAttributes();
  }

  /**
   * Clears the canvas.
   */
  clear(): void {
    this.context.clearRect(0, 0, this.displayWidth, this.displayHeight);
  }

  /**
   * Sets the target element for the canvas.
   *
   * @param target - The target element to mount the canvas to.
   */
  setTarget(target: HTMLElement): void {
    this.target = target;
  }

  #resizeCanvas(): void {
    this.displayWidth = this.canvas.clientWidth;
    this.displayHeight = this.canvas.clientHeight;

    this.canvas.width = this.displayWidth * this.dpr;
    this.canvas.height = this.displayHeight * this.dpr;

    this.context.scale(this.dpr, this.dpr);
  }

  /**
   * Sets the style attributes of the canvas.
   */
  #setCanvasAttributes(): void {
    let styles = {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
    };

    Object.assign(this.canvas.style, styles);

    // Add event listener for resize
    window.addEventListener("resize", this.render.bind(this));
  }

  /**
   * Mounts the canvas to the target element.
   *
   * @throws {Error} If the target element is not found.
   */
  mount(): void {
    if (!this.target) {
      throw new Error("Target element not found");
    }

    if (this.isMounted) {
      console.warn("HUDCanvas is already mounted");

      return;
    }

    this.target.appendChild(this.canvas);

    this.displayWidth = this.canvas.clientWidth;
    this.displayHeight = this.canvas.clientHeight;

    this.#resizeCanvas();

    this.isMounted = true;
  }

  /**
   * Unmounts the canvas from the target element.
   *
   * @throws {Error} If the target element is not found.
   */
  unmount(): void {
    if (!this.target) {
      throw new Error("Target element not found");
    }

    if (!this.isMounted) {
      console.warn("HUDCanvas is not mounted");

      return;
    }

    this.target?.removeChild(this.canvas);

    this.isMounted = false;
  }

  render(): void {
    this.clear();

    this.#resizeCanvas();

    this.displayItems.forEach((item) => {
      item();
    });
  }

  addRenderableItem(item: CallableFunction): void {
    this.displayItems.push(item);
  }
}

class UAVHud {
  uav: UAV;
  uavState: UAVState;
  environment: Environment;

  /**
   * The canvas element to render the HUD to.
   *
   * This is created in the constructor. It will be
   * mounted to the target element in the render method.
   */
  canvas: HUDCanvas;

  /**
   * The control mode of the UAV.
   */
  controlMode: UAVControlMode;

  /**
   * The primary graphics color of the HUD.
   */
  primaryGraphicsColor: string = "green";

  /**
   * The secondary graphics color of the HUD.
   */
  secondaryGraphicsColor: string = "black";

  /**
   * The primary text color of the HUD.
   */
  primaryTextColor: string = "white";

  /**
   * The secondary text color of the HUD.
   */
  secondaryTextColor: string = "white";

  constructor(uav: UAV, uavState: UAVState, environment: Environment) {
    this.uav = uav;
    this.uavState = uavState;
    this.environment = environment;
    this.canvas = new HUDCanvas();
    this.controlMode = uavState.controlMode;
    this.#setGraphicsColors();
  }

  #setGraphicsColors() {
    switch (this.controlMode) {
      case UAVControlMode.MANUAL:
        this.primaryGraphicsColor = "lime";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "lime";
        break;
      case UAVControlMode.AUTOPILOT:
        this.primaryGraphicsColor = "blue";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "white";
        break;
      case UAVControlMode.MSN:
        this.primaryGraphicsColor = "green";
        this.secondaryGraphicsColor = "black";
        this.primaryTextColor = "white";
        this.secondaryTextColor = "white";
        break;
    }
  }

  getFont(size: number): string {
    return `${size}px monospace`;
  }

  mount(target: HTMLElement) {
    this.canvas.setTarget(target);

    this.canvas.mount();
  }

  unmount() {
    this.canvas.unmount();
  }

  render() {
    this.canvas.render();
  }
}

class MQ9Hud extends UAVHud {
  constructor(uav: MQ9, uavState: UAVState, environment: Environment) {
    super(uav, uavState, environment);

    this.canvas.addRenderableItem(this.renderAirspeed.bind(this));
    this.canvas.addRenderableItem(this.renderAltitude.bind(this));
    this.canvas.addRenderableItem(this.renderVerticalSpeed.bind(this));
    this.canvas.addRenderableItem(this.renderTailNumber.bind(this));
    this.canvas.addRenderableItem(this.renderGroundSpeed.bind(this));
    this.canvas.addRenderableItem(this.renderMach.bind(this));
    this.canvas.addRenderableItem(this.renderGForce.bind(this));
    this.canvas.addRenderableItem(this.renderBankIndicator.bind(this));
    this.canvas.addRenderableItem(this.renderClock.bind(this));
  }

  renderAirspeed() {
    let canvas = this.canvas;
    let airspeedX = canvas.displayWidth / 6;
    let airspeedY = canvas.displayHeight / 2;
    let ctx = this.canvas.context;

    // Draw the airspeed text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(this.uavState.keas.value.toFixed(0), airspeedX, airspeedY);

    // Draw the airspeed box
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    let boxWidth = 80;
    let boxHeight = 28;
    ctx.strokeRect(
      airspeedX - boxWidth / 2,
      airspeedY - boxHeight / 2 - 7,
      boxWidth,
      boxHeight
    );
  }

  renderAltitude() {
    let canvas = this.canvas;
    let altitudeX = (canvas.displayWidth / 6) * 5;
    let altitudeY = canvas.displayHeight / 2;
    let ctx = this.canvas.context;

    // Draw the altitude text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(this.uavState.altitude.value.toFixed(0), altitudeX, altitudeY);

    // Draw the altitude box
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    let boxWidth = 80;
    let boxHeight = 28;
    ctx.strokeRect(
      altitudeX - boxWidth / 2,
      altitudeY - boxHeight / 2 - 7,
      boxWidth,
      boxHeight
    );
  }

  renderVerticalSpeed() {
    let canvas = this.canvas;
    let verticalSpeedX = (canvas.displayWidth / 6) * 5;
    let verticalSpeedY = canvas.displayHeight / 2 + 40;
    let ctx = this.canvas.context;

    // Draw the vertical speed text
    ctx.font = this.getFont(15);
    ctx.fillStyle = this.secondaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      this.uavState.verticalVelocity.toFixed(0),
      verticalSpeedX,
      verticalSpeedY
    );
  }

  renderTailNumber() {
    let tailNumberX = 38;
    let tailNumberY = 30;
    let ctx = this.canvas.context;

    // Draw the tail number box first so we can put the text on top of it
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    let boxWidth = 60;
    let boxHeight = 28;
    ctx.strokeRect(
      tailNumberX - boxWidth / 2,
      tailNumberY - boxHeight / 2 - 7,
      boxWidth,
      boxHeight
    );
    ctx.fillStyle = this.secondaryGraphicsColor;
    ctx.fillRect(
      tailNumberX - boxWidth / 2,
      tailNumberY - boxHeight / 2 - 7,
      boxWidth,
      boxHeight
    );

    // Draw the tail number text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(this.uav.tailNumber, tailNumberX, tailNumberY);
  }

  renderGroundSpeed() {
    let canvas = this.canvas;
    let groundSpeedX = canvas.displayWidth / 6 - 10;
    let groundSpeedY = canvas.displayHeight / 2 + 40;
    let ctx = this.canvas.context;

    // Draw the ground speed text
    ctx.font = this.getFont(15);
    ctx.fillStyle = this.secondaryTextColor;
    ctx.textAlign = "left";
    ctx.fillText(
      "GS " + this.uavState.groundSpeed.value.toFixed(0),
      groundSpeedX,
      groundSpeedY
    );
  }

  renderMach() {
    let canvas = this.canvas;
    let machX = canvas.displayWidth / 6 - 10;
    let machY = canvas.displayHeight / 2 + 60;
    let ctx = this.canvas.context;

    // Draw the mach text
    ctx.font = this.getFont(15);
    ctx.fillStyle = this.secondaryTextColor;
    ctx.textAlign = "left";
    ctx.fillText("M " + this.uavState.mach.toFixed(2), machX, machY);
  }

  renderGForce() {
    let canvas = this.canvas;
    let gForceX = canvas.displayWidth / 6 - 10;
    let gForceY = canvas.displayHeight / 2 + 80;
    let ctx = this.canvas.context;

    // Draw the g force text
    ctx.font = this.getFont(15);
    ctx.fillStyle = this.secondaryTextColor;
    ctx.textAlign = "left";
    ctx.fillText("G  " + this.uavState.loadFactor.toFixed(1), gForceX, gForceY);
  }

  renderBankIndicator() {
    let canvas = this.canvas;
    let bankX = canvas.displayWidth / 2;
    let bankY = canvas.displayHeight - 250;
    let bankRadius = 150;
    let bankAngles = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
    let ctx = this.canvas.context;

    let ticks = [];

    for (let angle of bankAngles) {
      let tickLength = angle % 45 === 0 ? 15 : angle % 10 === 0 ? 10 : 7;

      // TODO: Add commanded bank angle
      if (angle === 45 || angle === -45) {
        if (Math.abs(this.uavState.bank.degrees) >= 30) {
          tickLength = 15;
        } else {
          tickLength = 0;
        }
      }

      // TODO: Add commanded bank angle
      if (angle === 60 || angle === -60) {
        if (Math.abs(this.uavState.bank.degrees) >= 45) {
          tickLength = 20;
        } else {
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
      ctx.strokeStyle = this.primaryGraphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(tick.start.x, tick.start.y);
      ctx.lineTo(tick.end.x, tick.end.y);
      ctx.stroke();
    }

    // Draw the commanded bank angle
    let commandedBankAngle = this.uavState.bank.degrees + 90;
    let tipPoint = polarToCartesian(
      bankX,
      bankY,
      bankRadius + 4,
      commandedBankAngle
    );
    let leftBase = polarToCartesian(
      bankX,
      bankY,
      bankRadius + 12,
      commandedBankAngle - 2.5
    );
    let rightBase = polarToCartesian(
      bankX,
      bankY,
      bankRadius + 12,
      commandedBankAngle + 2.5
    );

    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(leftBase.x, leftBase.y);
    ctx.lineTo(tipPoint.x, tipPoint.y);
    ctx.lineTo(rightBase.x, rightBase.y);
    ctx.closePath();
    ctx.fillStyle = this.primaryGraphicsColor;
    ctx.fill();
    ctx.stroke();
  }

  renderClock() {
    let canvas = this.canvas;
    let clockX = (canvas.displayWidth / 6) * 5;
    let clockY = canvas.displayHeight - canvas.displayHeight + 110;
    let ctx = this.canvas.context;

    let clock = new Date();
    let clockHours = clock.getHours().toString().padStart(2, "0");
    let clockMinutes = clock.getMinutes().toString().padStart(2, "0");
    let clockSeconds = clock.getSeconds().toString().padStart(2, "0");

    let clockString = `${clockHours}:${clockMinutes}:${clockSeconds}`;

    ctx.font = this.getFont(15);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(clockString, clockX, clockY);
  }
}

export { UAVHud, MQ9Hud };
