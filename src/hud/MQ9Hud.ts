import { normalizeHeading, polarToCartesian, rotatePoint } from "../support/math";
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
    this.canvas.addRenderableItem(this.renderHeadingBar.bind(this));
    this.canvas.addRenderableItem(this.renderWind.bind(this));
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

  renderHeadingBar() {
    let canvas = this.canvas;
    let headingX = canvas.displayWidth / 2;
    let headingY = 35;
    let ctx = this.canvas.context;

    // Draw the heading bar strip
    let headingStripX = headingX;
    let headingStripY = headingY + 20;
    let headingStripWidth = 270;
    let headingStripHeight = 8;
    let tickSpacing = headingStripWidth / 60;
    let majorTickHeight = headingStripHeight;
    let minorTickHeight = headingStripHeight*0.5;

    let ticks = [];
    let labels = [];

    let normalizedHeading = this.uavState.heading.degrees;
    let currentCourse = this.uavState.course.degrees;

    // Draw heading +/- 30 degrees off the center current heading
    for (let offset = -30; offset <= 31; offset++) {
      // add the offset to the normalized heading
      let tickHeading = normalizedHeading + offset;

      // normalize the tick heading
      tickHeading = normalizeHeading(tickHeading);

      // remove any decimal places
      tickHeading = parseFloat(tickHeading.toFixed(0));

      // calculate the x position of the tick
      let x = offset * tickSpacing;

      // handle the current course indicator
      if (tickHeading === currentCourse) {
        // we need to draw the current course indicator
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
        ctx.strokeStyle = this.primaryGraphicsColor;
        ctx.lineWidth = 1;
        ctx.moveTo(leftBase.x, leftBase.y);
        ctx.lineTo(tipPoint.x, tipPoint.y);
        ctx.lineTo(rightBase.x, rightBase.y);
        ctx.closePath();
        ctx.stroke();

        // lets also draw a current heading indicator, 
        // it will be a inverted triangle with the tip pointing down
        tipPoint = {
          x: (headingStripX+.5),
          y: headingStripY+1,
        };

        leftBase = {
          x: (headingStripX+.5) - 5,
          y: headingStripY-3,
        };

        rightBase = {
          x: (headingStripX+.5) + 5,
          y: headingStripY-3,
        };

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

      if (tickHeading % 10 === 0) {
        // major tick, they are taller than the minor ticks
        // and they start at the bottom of the heading strip
        ticks.push({ x, y: headingStripY, height: majorTickHeight });
      }

      if (tickHeading % 5 === 0) {
        // minor tick, they are shorter than the major ticks
        // and they start at the bottom of the heading strip
        ticks.push({
          x,
          y: headingStripY + minorTickHeight,
          height: minorTickHeight+3,
        });
      }

      // Only show the labels for the major ticks
      // Dont show the label for the current heading (offset === 0)
      // Dont show the labels for the heading +/- 6 degrees
      // so it doesnt overlap with the current heading box (Math.abs(offset) > 6)
      if (tickHeading % 10 === 0 && offset !== 0 && Math.abs(offset) > 6) {
        labels.push({
          x,
          y: headingStripY,
          text: tickHeading.toString().slice(0, 2).padStart(2, "0"),
        });
      }
    }

    // now lets draw the ticks
    for (let tick of ticks) {
      ctx.fillStyle = this.primaryGraphicsColor;
      ctx.fillRect(
        tick.x + headingStripX,
        tick.y - tick.height,
        1,
        tick.height
      );
    }

    // now lets draw the labels
    for (let label of labels) {
      ctx.fillStyle = this.primaryTextColor;
      ctx.font = this.getFont(10);
      ctx.fillText(label.text, label.x + headingStripX, label.y - 14);
    }

    // Draw the heading box
    let headingBoxWidth = 40;
    let headingBoxHeight = 20;
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      headingX - headingBoxWidth / 2 +5,
      headingY - headingBoxHeight / 2 - 6,
      headingBoxWidth,
      headingBoxHeight
    );
    ctx.fillStyle = "black";
    ctx.fillRect(
      headingX - headingBoxWidth / 2 + 5,
      headingY - headingBoxHeight / 2 - 6,
      headingBoxWidth,
      headingBoxHeight
    );

    // Draw the heading text in the center of the heading box
    ctx.font = this.getFont(15);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      normalizedHeading.toFixed(0).padStart(3, "0"),
      headingX+5,
      headingY-1
    );
  }

  renderWind() {
    let canvas = this.canvas;
    let windX = (canvas.displayWidth / 6);
    let windY = canvas.displayHeight - (canvas.displayHeight / 6)*5;
    let ctx = this.canvas.context;
    
    let windDirectionCardinal = this.environment.wind.cardinalDirection.degrees;
    let windSpeed = this.environment.wind.speed;

    // Draw the wind barb
    let windBarbX = windX;
    let windBarbY = windY;
    let windBarbLength = 30;

    // the wind barb angle is the wind direction relative to our current heading
    // for example, if we are heading heading 360 and the wind is coming from 350,
    // the wind bard should be angled 10 degrees left because the wind is coming from the left
    // if the wind was coming from 270, the wind barb would be horizontal and pointing to the right
    // if the wind was coming from 180, the wind barb would be vertical and pointing up
    // if the wind was coming from 90, the wind barb would be horizontal and pointing to the left
    let windBarbAngle = (windDirectionCardinal - this.uavState.heading.degrees) % 360 - 180;

    let windBarbTip = {
      x: windBarbX,
      y: windBarbY
    }

    let windBarbTail = {
      x: windBarbX,
      y: windBarbY + windBarbLength
    }

    let windBarbArrowheadTriangleLeftPoint = {
      x: windBarbX-windBarbLength/6,
      y: windBarbY + windBarbLength/4 
    }

    let windBarbArrowheadTriangleRightPoint = {
      x: windBarbX+windBarbLength/6,
      y: windBarbY + windBarbLength/4 
    }

    // okay, now we need to rotate the wind barb around the tip point
    windBarbTip = rotatePoint(windBarbTip, windBarbTip, windBarbAngle);
    windBarbTail = rotatePoint(windBarbTail, windBarbTip, windBarbAngle);
    windBarbArrowheadTriangleLeftPoint = rotatePoint(windBarbArrowheadTriangleLeftPoint, windBarbTip, windBarbAngle);
    windBarbArrowheadTriangleRightPoint = rotatePoint(windBarbArrowheadTriangleRightPoint, windBarbTip, windBarbAngle);

    // Draw the rotated wind barb
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(windBarbTip.x, windBarbTip.y);
    ctx.lineTo(windBarbTail.x, windBarbTail.y);
    ctx.moveTo(windBarbTip.x, windBarbTip.y);
    ctx.lineTo(windBarbArrowheadTriangleLeftPoint.x, windBarbArrowheadTriangleLeftPoint.y);
    ctx.lineTo(windBarbArrowheadTriangleRightPoint.x, windBarbArrowheadTriangleRightPoint.y);
    ctx.closePath();
    ctx.fillStyle = this.primaryGraphicsColor;
    ctx.fill();
    ctx.stroke();

    // Draw the wind speed text
    // we need to position the text below the wind barb
    // it should be centered below the wind barb
    // and it should be offset by the width of the wind barb
    let windSpeedTextX = windBarbTip.x;
    let windSpeedTextY = windBarbTail.y + 25;

    if(windSpeedTextY < windBarbTip.y) {
      // we are inside the wind barb tail
      // so we need to move the text down
      windSpeedTextY = windBarbTip.y + 20;
    } else if(Math.abs(windSpeedTextY- windBarbTip.y) < 20) {
      // we are close to the wind barb tip
      // so we need to move the text down
      windSpeedTextY = windBarbTip.y + 20;
    }
    
    ctx.font = this.getFont(10);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(windDirectionCardinal.toFixed(0) + "° " + windSpeed.value.toFixed(0), windSpeedTextX, windSpeedTextY);
    
  }
}

export default MQ9Hud;
