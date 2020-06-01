import Tool from "../../code/tool.js";
import { OptionsBox, OptionSlider } from "../../code/components/optionsbox.js";

class Eraser extends Tool {
  constructor(srcPath, api) {
    super("Eraser", srcPath + "/icon.svg", api);
    this.optionsbox = new OptionsBox("Eraser Options");
    this.sizeOpt = new OptionSlider("Size", 1);
    this.sizeOpt.setMin(1).setMax(35).setStep(0.5);
    this.optionsbox.add(this.sizeOpt);
  }

  getOptions() {
    return this.optionsbox;
  }

  /**@param {CanvasRenderingContext2D} ctx Canvas Context
   * @param {Integer} x vertical
   * @param {Integer} y horizontal
   */
  onDraw(ctx, x, y, isNewStroke) {
    ctx.clearRect(
      x-this.sizeOpt.currentValue/2,
      y-this.sizeOpt.currentValue/2,
      this.sizeOpt.currentValue,
      this.sizeOpt.currentValue
    );
  }

  onFinishDraw (ctx, x, y) {
    this.api.viewer.saveActiveLayer();
  }
}

export default Eraser;
