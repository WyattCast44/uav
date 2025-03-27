import { polarToCartesian } from "../math";
import { Environment } from "../support";
import { MQ9, UAVState } from "../uav";
import UAVHud from "./UAVHud";

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

export default MQ9Hud;