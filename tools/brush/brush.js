import Tool from "../../code/tool.js";
import { OptionsBox, OptionSlider, OptionColor } from "../../code/components/optionsbox.js";
import { radians, degrees, dist, angle } from "../../code/math.js";

class Brush extends Tool {
  constructor(srcPath, api) {
    super("Brush", srcPath + "/icon.svg", api);

    this.optionsbox = new OptionsBox("Brush Options");

    this.sizeOpt = new OptionSlider("Size", 1);
    this.sizeOpt.setMin(1).setMax(35).setStep(0.5);
    this.optionsbox.add(this.sizeOpt);

    this.opacityOpt = new OptionSlider("Opacity", 1);
    this.opacityOpt.setMin(0).setMax(1).setStep(0.01);
    this.optionsbox.add(this.opacityOpt);

    this.colorOpt = new OptionColor("Color");
    this.colorOpt.setValue("#ffffff");
    this.optionsbox.add(this.colorOpt);

    this.velocity = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.lastPerpX1 = 0;
    this.lastPerpY1 = 0;
    this.lastPerpX2 = 0;
    this.lastPerpY2 = 0;

    this.currentPerpX1 = 0;
    this.currentPerpY1 = 0;
    this.currentPerpX2 = 0;
    this.currentPerpY2 = 0;

    this.lastPointX2 = 0;
    this.lastPointY2 = 0;
    this.addonVelocity = 0;
    this.shouldSkip = false;

    this.brushWidth = this.sizeOpt.currentValue / 2;

    this.debugDraw = false;
  }

  getOptions() {
    return this.optionsbox;
  }

  /**@param {CanvasRenderingContext2D} ctx Canvas Context
   * @param {Integer} x vertical
   * @param {Integer} y horizontal
   */
  onDraw(ctx, x, y, isNewStroke) {
    let d = dist(this.lastX, this.lastY, x, y);

    this.nowTime = Date.now();
    this.deltaTime = this.nowTime - this.lastTime;
    this.lastTime = this.nowTime;

    this.velocity = d / this.deltaTime;
    this.addonVelocity += this.velocity;

    //TODO - Add option to toggle this cheap trick or use spline lerp - also, implement spline lerp
    if (this.addonVelocity < 0.05 * this.sizeOpt.currentValue) {
      if (isNewStroke) this.nextIsNewStroke = true;
      return;
    } else {
      this.addonVelocity = 0;
    }

    this.lineAngle = angle(this.lastX, this.lastY, x, y);
    this.linePerpAngle = this.lineAngle + Math.PI / 2;

    this.brushWidth = this.sizeOpt.currentValue / 2;

    this.currentPerpX1 = x + (Math.cos(this.linePerpAngle) * this.brushWidth);
    this.currentPerpY1 = y + (Math.sin(this.linePerpAngle) * this.brushWidth);

    this.currentPerpX2 = x - (Math.cos(this.linePerpAngle) * this.brushWidth);
    this.currentPerpY2 = y - (Math.sin(this.linePerpAngle) * this.brushWidth);

    if (isNewStroke) {
      this.lastPerpX1 = this.currentPerpX1;
      this.lastPerpY1 = this.currentPerpY1;
      this.lastPerpX2 = this.currentPerpX2;
      this.lastPerpY2 = this.currentPerpY2;

      this.lastX = x;
      this.lastY = y;
      this.velocity = 0;

      return;
    }
    ctx.save();
    ctx.beginPath();
    //Perpendicular of last point
    ctx.moveTo(this.lastPerpX1, this.lastPerpY1);

    //Last point
    ctx.lineTo(this.lastPerpX2, this.lastPerpY2);

    //Current point
    ctx.lineTo(this.currentPerpX2, this.currentPerpY2);

    //Perpendicular of current point
    ctx.lineTo(this.currentPerpX1, this.currentPerpY1);

    //Last edge
    ctx.closePath();
    ctx.globalAlpha = this.opacityOpt.currentValue;
    ctx.fillStyle = this.colorOpt.currentValue;
    ctx.fill();

    ctx.strokeStyle = ctx.fillStyle;
    if (ctx.globalAlpha === 1) {
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (this.debugDraw) {
      ctx.fillStyle = "red";
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = "black";

      ctx.fillRect(this.lastX - 4, this.lastY - 4, 8, 8);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    this.lastPerpX1 = this.currentPerpX1;
    this.lastPerpY1 = this.currentPerpY1;
    this.lastPerpX2 = this.currentPerpX2;
    this.lastPerpY2 = this.currentPerpY2;

    this.lastX = x;
    this.lastY = y;
  }

  onFinishDraw (ctx, x, y) {

    this.api.viewer.saveActiveLayer();
  }
}

export default Brush;
