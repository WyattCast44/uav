import {
  normalizeHeading,
  polarToCartesian,
  rotatePoint,
} from "../support/math";
import { Environment } from "../support";
import { GearStatus, MQ9 } from "../uav";
import UAVHud from "./UAVHud";
import { degToRad } from "three/src/math/MathUtils.js";
import { BoardsStatus } from "../uav/BoardsStatus";
import { Simulation } from "../sim";

class MQ9Hud extends UAVHud {
  constructor(uav: MQ9, environment: Environment, simulation: Simulation) {
    super(uav, environment, simulation);

    this.canvas.addRenderableItem(this.renderAirspeed.bind(this));
    this.canvas.addRenderableItem(this.renderAltitude.bind(this));
    this.canvas.addRenderableItem(this.renderVerticalSpeed.bind(this));
    this.canvas.addRenderableItem(this.renderTailNumber.bind(this));
    this.canvas.addRenderableItem(this.renderGroundSpeed.bind(this));
    this.canvas.addRenderableItem(this.renderMach.bind(this));
    this.canvas.addRenderableItem(this.renderGForce.bind(this));
    this.canvas.addRenderableItem(this.renderBankIndicator.bind(this));
    this.canvas.addRenderableItem(this.renderClock.bind(this));
    this.canvas.addRenderableItem(this.renderSimulationTime.bind(this));
    this.canvas.addRenderableItem(this.renderWind.bind(this));
    this.canvas.addRenderableItem(this.renderHeadingBar.bind(this));
    this.canvas.addRenderableItem(this.renderPitchLadder.bind(this));
    this.canvas.addRenderableItem(this.renderFlightPathMarker.bind(this));
    this.canvas.addRenderableItem(this.renderPosition.bind(this));
  }

  renderAirspeed() {
    if (this.uav.state.gearStatus === GearStatus.UP) {
      this.#renderGearUpAirspeedIndicator();
    } else {
      this.#renderGearDownAirspeedIndicator();
    }
  }

  #renderGearUpAirspeedIndicator() {
    let canvas = this.canvas;
    let airspeedX = canvas.displayWidth / 6;
    let airspeedY = canvas.displayHeight / 2;
    let ctx = this.canvas.context;

    // Draw the airspeed text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(this.uav.state.keas.value.toFixed(0), airspeedX, airspeedY);

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

  #renderGearDownAirspeedIndicator() {
    let canvas = this.canvas;
    let airspeedX = canvas.displayWidth / 6 + 15;
    let airspeedY = canvas.displayHeight / 2 - 20;
    let airspeedTextX = airspeedX - 0;
    let airspeedTextY = airspeedY + 6;
    let ctx = this.canvas.context;

    // Draw the airspeed text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      this.uav.state.keas.value.toFixed(0),
      airspeedTextX,
      airspeedTextY
    );

    // Draw the airspeed circle
    let circleRadius = 30;

    // Determine the stroke pattern
    // we want 10 dashes of equal length
    let dashLength = circleRadius / 3;
    let dashGap = circleRadius / 10;

    ctx.beginPath();
    ctx.setLineDash([dashLength, dashGap]);
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.arc(airspeedX, airspeedY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // reset the line dash
    ctx.setLineDash([]);
  }

  renderAltitude() {
    if (this.uav.state.gearStatus === GearStatus.UP) {
      this.#renderGearUpAltitudeIndicator();
    } else {
      this.#renderGearDownAltitudeIndicator();
    }
  }

  #renderGearUpAltitudeIndicator() {
    let canvas = this.canvas;
    let altitudeX = (canvas.displayWidth / 6) * 5;
    let altitudeY = canvas.displayHeight / 2;
    let ctx = this.canvas.context;

    // Draw the altitude text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      this.uav.state.altitude.value.toFixed(0),
      altitudeX,
      altitudeY
    );

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

  #renderGearDownAltitudeIndicator() {
    let canvas = this.canvas;
    let altitudeX = (canvas.displayWidth / 6) * 5;
    let altitudeY = canvas.displayHeight / 2 - 25;
    let altitudeTextX = altitudeX - 0;
    let altitudeTextY = altitudeY + 7;
    let ctx = this.canvas.context;

    // Draw the altitude text
    ctx.font = this.getFont(20);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      this.uav.state.altitude.value.toFixed(0),
      altitudeTextX,
      altitudeTextY
    );

    // Draw the airspeed circle
    let circleRadius = 40;

    // Determine the stroke pattern
    // we want 10 dashes of equal length
    let dashLength = circleRadius / 3;
    let dashGap = circleRadius / 10;

    ctx.beginPath();
    ctx.setLineDash([dashLength, dashGap]);
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.arc(altitudeX, altitudeY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // reset the line dash
    ctx.setLineDash([]);
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
      this.uav.state.verticalVelocity.toFixed(0),
      verticalSpeedX,
      verticalSpeedY
    );
  }

  renderPosition() {
    let canvas = this.canvas;
    let ctx = this.canvas.context;
    let positionX = (canvas.displayWidth/6)*5;
    let positionY = canvas.displayHeight / 2 + 60;

    let position = this.uav.state.position;

    let xPositionValue = "X: " + position.x;
    let yPositionValue = "Y: " + position.y;

    // draw the position text
    ctx.font = this.getFont(10);
    ctx.fillStyle = this.primaryTextColor;
    ctx.fillText(
      xPositionValue,
      positionX,
      positionY
    );
    ctx.fillText(
      yPositionValue,
      positionX,
      positionY + 15
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
      "GS " + this.uav.state.groundSpeed.value.toFixed(0),
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
    ctx.fillText("M " + this.uav.state.mach.toFixed(2), machX, machY);
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
    ctx.fillText(
      "G  " + this.uav.state.loadFactor.toFixed(1),
      gForceX,
      gForceY
    );
  }

  renderBankIndicator() {
    let canvas = this.canvas;
    let bankX = canvas.displayWidth / 2;
    let bankY = canvas.displayHeight - 230;
    let bankRadius = 150;
    let bankAngles = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
    let ctx = this.canvas.context;

    let ticks = [];

    for (let angle of bankAngles) {
      let tickLength = angle % 45 === 0 ? 15 : angle % 10 === 0 ? 10 : 7;

      // TODO: Add commanded bank angle
      if (angle === 45 || angle === -45) {
        if (Math.abs(this.uav.state.bank.degrees) >= 30) {
          tickLength = 15;
        } else {
          tickLength = 0;
        }
      }

      // TODO: Add commanded bank angle
      if (angle === 60 || angle === -60) {
        if (Math.abs(this.uav.state.bank.degrees) >= 45) {
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
    let commandedBankAngle = this.uav.state.bank.degrees + 90;
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
    if (!this.canvas.currentTime) return;
    let canvas = this.canvas;
    let clockX = (canvas.displayWidth / 6) * 5;
    let clockY = canvas.displayHeight - canvas.displayHeight + 110;
    let ctx = this.canvas.context;

    let clock = this.canvas.currentTime;
    let clockHours = clock.getHours().toString().padStart(2, "0");
    let clockMinutes = clock.getMinutes().toString().padStart(2, "0");
    let clockSeconds = clock.getSeconds().toString().padStart(2, "0");

    let clockString = `${clockHours}:${clockMinutes}:${clockSeconds}`;

    ctx.font = this.getFont(15);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(clockString, clockX, clockY);
  }

  renderSimulationTime() {
    let canvas = this.canvas;
    let simulationTimeX = (canvas.displayWidth / 6) * 5;
    let simulationTimeY = canvas.displayHeight - canvas.displayHeight + 130;
    let ctx = this.canvas.context;

    ctx.font = this.getFont(15);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      this.simulation.getDuration(),
      simulationTimeX,
      simulationTimeY
    );
  }

  renderWind() {
    let canvas = this.canvas;
    let windX = canvas.displayWidth / 6;
    let windY = canvas.displayHeight - (canvas.displayHeight / 6) * 5;
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
    let windBarbAngle =
      ((windDirectionCardinal - this.uav.state.heading.degrees) % 360) - 180;

    let windBarbTip = {
      x: windBarbX,
      y: windBarbY,
    };

    let windBarbTail = {
      x: windBarbX,
      y: windBarbY + windBarbLength,
    };

    let windBarbArrowheadTriangleLeftPoint = {
      x: windBarbX - windBarbLength / 6,
      y: windBarbY + windBarbLength / 4,
    };

    let windBarbArrowheadTriangleRightPoint = {
      x: windBarbX + windBarbLength / 6,
      y: windBarbY + windBarbLength / 4,
    };

    // okay, now we need to rotate the wind barb around the tip point
    windBarbTip = rotatePoint(windBarbTip, windBarbTip, windBarbAngle);
    windBarbTail = rotatePoint(windBarbTail, windBarbTip, windBarbAngle);
    windBarbArrowheadTriangleLeftPoint = rotatePoint(
      windBarbArrowheadTriangleLeftPoint,
      windBarbTip,
      windBarbAngle
    );
    windBarbArrowheadTriangleRightPoint = rotatePoint(
      windBarbArrowheadTriangleRightPoint,
      windBarbTip,
      windBarbAngle
    );

    // Draw the rotated wind barb
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(windBarbTip.x, windBarbTip.y);
    ctx.lineTo(windBarbTail.x, windBarbTail.y);
    ctx.moveTo(windBarbTip.x, windBarbTip.y);
    ctx.lineTo(
      windBarbArrowheadTriangleLeftPoint.x,
      windBarbArrowheadTriangleLeftPoint.y
    );
    ctx.lineTo(
      windBarbArrowheadTriangleRightPoint.x,
      windBarbArrowheadTriangleRightPoint.y
    );
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

    if (windSpeedTextY < windBarbTip.y) {
      // we are inside the wind barb tail
      // so we need to move the text down
      windSpeedTextY = windBarbTip.y + 20;
    } else if (Math.abs(windSpeedTextY - windBarbTip.y) < 20) {
      // we are close to the wind barb tip
      // so we need to move the text down
      windSpeedTextY = windBarbTip.y + 20;
    }

    ctx.font = this.getFont(12);
    ctx.fillStyle = this.primaryTextColor;
    ctx.textAlign = "center";
    ctx.fillText(
      windDirectionCardinal.toFixed(0) + "° " + windSpeed.value.toFixed(0),
      windSpeedTextX,
      windSpeedTextY
    );
  }

  getLadderWidth(ladder: number): number {
    let ladderWidths = {
      0: 225,
      2.5: 100,
      5: 140,
      10: 140,
      15: 140,
      20: 140,
      25: 140,
      30: 140,
      35: 140,
      40: 140,
      45: 140,
    };

    return ladderWidths[Math.abs(ladder) as keyof typeof ladderWidths];
  }

  renderPitchLadder() {
    let ladders = [
      0, 5, 10, 15, 20, 25, 30, 35, 40, 45, -5, -10, -15, -20, -25, -30, -35,
      -40, -45,
    ];

    // now lets draw the pitch ladder lines
    for (let ladder of ladders) {
      this.#renderGammaLadder(ladder);
    }
  }

  #renderGammaLadder(ladder: number) {
    let canvas = this.canvas;
    let ctx = this.canvas.context;
    let screenCenter = {
      x: canvas.displayWidth / 2,
      y: canvas.displayHeight / 2,
    };

    let ladderGapWidth = 85;
    let ladderWidth = this.getLadderWidth(ladder);
    let ladderVerticalSpacing = canvas.displayHeight / 23;
    // if this is the horizon ladder line, we dont need the vertical spacing
    ladderVerticalSpacing = ladder == 0 ? 0 : ladderVerticalSpacing;

    // lets build the ladder line
    let ladderLine = {
      left: {
        start: {
          x: canvas.displayWidth / 2 - ladderWidth,
          y: canvas.displayHeight / 2 + -ladder * ladderVerticalSpacing,
        },
        end: {
          x: canvas.displayWidth / 2 - ladderGapWidth / 2,
          y: canvas.displayHeight / 2 + -ladder * ladderVerticalSpacing,
        },
      },
      right: {
        start: {
          x: canvas.displayWidth / 2 + ladderWidth,
          y: canvas.displayHeight / 2 + -ladder * ladderVerticalSpacing,
        },
        end: {
          x: canvas.displayWidth / 2 + ladderGapWidth / 2,
          y: canvas.displayHeight / 2 + -ladder * ladderVerticalSpacing,
        },
      },
      degree: ladder,
    };

    // calculate the center of the left side of the ladder line
    let leftCenter = {
      x: (ladderLine.left.start.x + ladderLine.left.end.x) / 2,
      y: (ladderLine.left.start.y + ladderLine.left.end.y) / 2,
    };

    // calculate the center of the right side of the ladder line
    let rightCenter = {
      x: (ladderLine.right.start.x + ladderLine.right.end.x) / 2,
      y: (ladderLine.right.start.y + ladderLine.right.end.y) / 2,
    };

    // rotate the left side of the ladder line by the pitch degree
    let pitchRotatedLeft = {
      start: rotatePoint(
        ladderLine.left.start,
        leftCenter,
        ladderLine.degree / 2
      ),
      end: rotatePoint(ladderLine.left.end, leftCenter, ladderLine.degree / 2),
    };

    // rotate the right side of the ladder line by the pitch degree
    let pitchRotatedRight = {
      start: rotatePoint(
        ladderLine.right.start,
        rightCenter,
        -ladderLine.degree / 2
      ),
      end: rotatePoint(
        ladderLine.right.end,
        rightCenter,
        -ladderLine.degree / 2
      ),
    };

    // rotate the left side of the ladder line by the bank degree
    let rotatedLeft = {
      start: rotatePoint(
        pitchRotatedLeft.start,
        screenCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        pitchRotatedLeft.end,
        screenCenter,
        this.uav.state.bank.degrees / 2
      ),
    };

    // we need to draw the text for the ladder degree on the left side
    if (ladderLine.degree !== 0) {
      // we also need to rotate the text orientation by the bank degree
      ctx.font = this.getFont(13);
      ctx.fillStyle = this.primaryTextColor;
      ctx.textAlign = "center";
      let textY =
        ladderLine.degree > 0
          ? rotatedLeft.start.y + 18
          : rotatedLeft.start.y - 10;
      ctx.fillText(ladder.toString(), rotatedLeft.start.x + 12, textY);
    }

    // rotate the right side of the ladder line by the bank degree
    let rotatedRight = {
      start: rotatePoint(
        pitchRotatedRight.start,
        screenCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        pitchRotatedRight.end,
        screenCenter,
        this.uav.state.bank.degrees / 2
      ),
    };

    // we need to draw the text for the ladder degree
    if (ladderLine.degree !== 0) {
      ctx.font = this.getFont(13);
      ctx.fillStyle = this.primaryTextColor;
      ctx.textAlign = "center";
      let textY =
        ladderLine.degree > 0
          ? rotatedRight.start.y + 18
          : rotatedRight.start.y - 10;
      ctx.fillText(ladder.toString(), rotatedRight.start.x - 12, textY);
    }

    // determine the number of dashes and the gap between them
    let numDashes = 3;
    let dashGap = 4;
    let dashLength =
      (ladderLine.left.end.x - ladderLine.left.start.x - dashGap) / numDashes;

    // only show the dashes for the negative ladders
    if (ladderLine.degree >= 0) {
      ctx.setLineDash([]);
    } else {
      ctx.setLineDash([dashLength, dashGap]);
    }

    // draw the left side of the ladder line
    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedLeft.start.x, rotatedLeft.start.y);
    ctx.lineTo(rotatedLeft.end.x, rotatedLeft.end.y);
    ctx.stroke();

    // draw the right side of the ladder line
    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedRight.start.x, rotatedRight.start.y);
    ctx.lineTo(rotatedRight.end.x, rotatedRight.end.y);
    ctx.stroke();

    // if the ladder is negative, add a vertical line on the left side of right center
    // and a vertical line on the right side of left center
    if (ladderLine.degree < 0) {
      // do the right side first
      let rightVerticalLine = rotatePoint(
        { x: rotatedRight.end.x, y: rotatedRight.end.y - 10 },
        { x: rotatedRight.end.x, y: rotatedRight.end.y },
        this.uav.state.bank.degrees / 2
      );

      ctx.beginPath();
      ctx.strokeStyle = this.primaryGraphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(rotatedRight.end.x, rotatedRight.end.y);
      ctx.lineTo(rightVerticalLine.x, rightVerticalLine.y);
      ctx.stroke();
      ctx.beginPath();

      // do the left side
      let leftVerticalLine = rotatePoint(
        { x: rotatedLeft.end.x, y: rotatedLeft.end.y - 10 },
        { x: rotatedLeft.end.x, y: rotatedLeft.end.y },
        this.uav.state.bank.degrees / 2
      );

      ctx.beginPath();
      ctx.strokeStyle = this.primaryGraphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(rotatedLeft.end.x, rotatedLeft.end.y);
      ctx.lineTo(leftVerticalLine.x, leftVerticalLine.y);
      ctx.stroke();
    } else if (ladderLine.degree > 0) {
      // do the left side first

      let leftVerticalLine = rotatePoint(
        { x: rotatedLeft.start.x, y: rotatedLeft.start.y + 12 },
        { x: rotatedLeft.start.x, y: rotatedLeft.start.y },
        this.uav.state.bank.degrees / 2
      );

      ctx.beginPath();
      ctx.strokeStyle = this.primaryGraphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(rotatedLeft.start.x, rotatedLeft.start.y);
      ctx.lineTo(leftVerticalLine.x, leftVerticalLine.y);
      ctx.stroke();

      // do the right side

      let rightVerticalLine = rotatePoint(
        { x: rotatedRight.start.x, y: rotatedRight.start.y + 12 },
        { x: rotatedRight.start.x, y: rotatedRight.start.y },
        this.uav.state.bank.degrees / 2
      );

      ctx.beginPath();
      ctx.strokeStyle = this.primaryGraphicsColor;
      ctx.lineWidth = 1;
      ctx.moveTo(rotatedRight.start.x, rotatedRight.start.y);
      ctx.lineTo(rightVerticalLine.x, rightVerticalLine.y);
      ctx.stroke();
    }

    // reset the line dash
    ctx.setLineDash([]);
  }

  renderFlightPathMarker() {
    let canvas = this.canvas;
    let ctx = this.canvas.context;
    let screenCenter = {
      x: canvas.displayWidth / 2,
      y: canvas.displayHeight / 2,
    };
    let ladderVerticalSpacing = canvas.displayHeight / 23;
    let flightPathMarkerX = screenCenter.x;
    let flightPathMarkerY = screenCenter.y;
    let flightPathMarkerRadius = 8;
    let flightPathMarkerLineLength = 14;

    // move the flight path marker vertically based on gamma
    flightPathMarkerY =
      flightPathMarkerY - this.uav.state.gamma.degrees * ladderVerticalSpacing;

    const center = {
      x: flightPathMarkerX,
      y: flightPathMarkerY,
    };

    // First rotate the marker position around the screen center based on bank
    const rotatedCenter = rotatePoint(
      center,
      screenCenter,
      this.uav.state.bank.degrees / 2
    );

    // Calculate the points for the marker relative to the rotated center
    const topLine = {
      start: {
        x: rotatedCenter.x,
        y: rotatedCenter.y - flightPathMarkerRadius,
      },
      end: {
        x: rotatedCenter.x,
        y:
          rotatedCenter.y - flightPathMarkerRadius - flightPathMarkerLineLength,
      },
    };

    const leftLine = {
      start: {
        x: rotatedCenter.x - flightPathMarkerRadius,
        y: rotatedCenter.y,
      },

      end: {
        x:
          rotatedCenter.x - flightPathMarkerRadius - flightPathMarkerLineLength,
        y: rotatedCenter.y,
      },
    };

    const rightLine = {
      start: {
        x: rotatedCenter.x + flightPathMarkerRadius,
        y: rotatedCenter.y,
      },
      end: {
        x:
          rotatedCenter.x + flightPathMarkerRadius + flightPathMarkerLineLength,
        y: rotatedCenter.y,
      },
    };

    // Rotate the lines around the rotated center by the bank angle
    const rotatedTopLine = {
      start: rotatePoint(
        topLine.start,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        topLine.end,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
    };

    const rotatedLeftLine = {
      start: rotatePoint(
        leftLine.start,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        leftLine.end,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
    };

    const rotatedRightLine = {
      start: rotatePoint(
        rightLine.start,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        rightLine.end,
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
    };

    // Draw the circle at the rotated center position
    ctx.beginPath();
    ctx.arc(
      rotatedCenter.x,
      rotatedCenter.y,
      flightPathMarkerRadius,
      degToRad(0),
      degToRad(360),
      true
    );
    ctx.stroke();

    // Draw the rotated lines
    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedTopLine.start.x, rotatedTopLine.start.y);
    ctx.lineTo(rotatedTopLine.end.x, rotatedTopLine.end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedLeftLine.start.x, rotatedLeftLine.start.y);
    ctx.lineTo(rotatedLeftLine.end.x, rotatedLeftLine.end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(rotatedRightLine.start.x, rotatedRightLine.start.y);
    ctx.lineTo(rotatedRightLine.end.x, rotatedRightLine.end.y);
    ctx.stroke();

    // we need to draw the boards status indicator, if the uav has boards
    if (this.uav.state.boardsStatus === BoardsStatus.NONE) {
      // this type of UAV has no boards
      return;
    }

    // draw the boards status indicator
    let boardsPoint = {
      start: rotatePoint(
        {
          x: rotatedLeftLine.start.x - flightPathMarkerRadius,
          y:
            rotatedLeftLine.end.y +
            (rotatedLeftLine.start.y - rotatedLeftLine.end.y) +
            3,
        },
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
      end: rotatePoint(
        {
          x: rotatedLeftLine.start.x - flightPathMarkerRadius,
          y:
            (rotatedLeftLine.start.y - rotatedLeftLine.end.y) / 2 +
            rotatedLeftLine.end.y,
        },
        rotatedCenter,
        this.uav.state.bank.degrees / 2
      ),
    };
    let halfBoardLineLength = 15;
    let fullBoardLineLength = 30;
    let currentBoardLineLength = 0;

    switch (this.uav.state.boardsStatus) {
      case BoardsStatus.FULL:
        currentBoardLineLength = fullBoardLineLength;
        break;
      case BoardsStatus.HALF:
        currentBoardLineLength = halfBoardLineLength;
        break;
      case BoardsStatus.IN:
        currentBoardLineLength = 0;
        break;
      default:
        currentBoardLineLength = 0;
        break;
    }

    // draw the boards status indicator
    ctx.beginPath();
    ctx.strokeStyle = this.primaryGraphicsColor;
    ctx.lineWidth = 1;
    ctx.moveTo(boardsPoint.start.x, boardsPoint.start.y);
    ctx.lineTo(boardsPoint.end.x, boardsPoint.end.y + currentBoardLineLength);
    ctx.stroke();

    // draw the locked boards indicator
    // if they are locked, we need to draw circles on both ends of the lines
    // on the sides of the flight path marker
    if (this.uav.state.boardsStatus === BoardsStatus.LOCKED) {
      let leftCircle = {
        x:
          rotatedLeftLine.start.x -
          flightPathMarkerRadius / 2 -
          flightPathMarkerLineLength +
          2,
        y: rotatedLeftLine.end.y,
      };
      let rightCircle = {
        x:
          rotatedRightLine.start.x +
          flightPathMarkerRadius / 2 +
          flightPathMarkerLineLength -
          2,
        y: rotatedRightLine.end.y,
      };
      // draw the circles
      ctx.beginPath();
      ctx.arc(leftCircle.x, leftCircle.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.primaryGraphicsColor;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rightCircle.x, rightCircle.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.primaryGraphicsColor;
      ctx.fill();
      ctx.stroke();
    }
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
    let minorTickHeight = headingStripHeight * 0.5;

    // draw a box around the heading bar
    // ctx.strokeStyle = "black";
    // ctx.lineWidth = 1;
    // ctx.strokeRect(headingX-headingStripWidth/2-10, headingY-headingStripHeight-10, headingStripWidth+20, headingStripHeight+50);
    // ctx.fillStyle = "black";
    // ctx.fillRect(headingX-headingStripWidth/2-10, headingY-headingStripHeight-10, headingStripWidth+20, headingStripHeight+50);

    let ticks = [];
    let labels = [];

    let normalizedHeading = this.uav.state.heading.degrees;
    let currentCourse = this.uav.state.course.degrees;

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
          x: headingStripX + 0.5,
          y: headingStripY + 1,
        };

        leftBase = {
          x: headingStripX + 0.5 - 5,
          y: headingStripY - 3,
        };

        rightBase = {
          x: headingStripX + 0.5 + 5,
          y: headingStripY - 3,
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
          height: minorTickHeight + 3,
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
      headingX - headingBoxWidth / 2,
      headingY - headingBoxHeight / 2 - 6,
      headingBoxWidth,
      headingBoxHeight
    );
    ctx.fillStyle = "black";
    ctx.fillRect(
      headingX - headingBoxWidth / 2,
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
      headingX,
      headingY - 1
    );
  }
}

export default MQ9Hud;
