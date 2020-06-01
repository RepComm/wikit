import Tool from "../../code/tool.js";
import { OptionsBox, OptionButton, OptionNumber, OptionSlider } from "../../code/components/optionsbox.js";

class Layers extends Tool {
  constructor(srcPath, api) {
    super("Layers", srcPath + "/icon.svg", api);

    this.optionsbox = new OptionsBox("Layers");

    this.xOpt = new OptionNumber("x", 0);
    this.xOpt.listen((evt) => {
      if (evt.type === "post-change") {
        this.api.viewer.activeLayer.x = parseInt(evt.currentValue);
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.xOpt);

    this.yOpt = new OptionNumber("y", 0);
    this.yOpt.listen((evt) => {
      if (evt.type === "post-change") {
        this.api.viewer.activeLayer.y = parseInt(evt.currentValue);
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.yOpt);

    this.wOpt = new OptionNumber("Width", this.api.viewer.activeLayer.width);
    this.wOpt.listen((evt) => {
      if (evt.type === "post-change") {
        this.api.viewer.activeLayer.width = parseInt(evt.currentValue);
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.wOpt);

    this.hOpt = new OptionNumber("Height", this.api.viewer.activeLayer.height);
    this.hOpt.listen((evt) => {
      if (evt.type === "post-change") {
        this.api.viewer.activeLayer.height = parseInt(evt.currentValue);
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.hOpt);

    this.opacityOpt = new OptionSlider("Opacity", this.api.viewer.activeLayer.opacity);
    this.opacityOpt.setMin(0).setMax(1).setStep(0.01);
    this.opacityOpt.listen((evt) => {
      if (evt.type === "post-change") {
        this.api.viewer.activeLayer.opacity = evt.currentValue;
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.opacityOpt);

    this.addLayer = new OptionButton("Add Layer");
    this.addLayer.listen((evt) => {
      if (evt.type === "execute") {
        //TODO - Make popup with layer config data instead of prompt
        let str = prompt("Enter Layer Name:", "Layer " + this.api.viewer.layers.length);
        this.api.viewer.addLayer(str);
        this.api.viewer.setActiveLayer(this.api.viewer.layers.length - 1);
        this.api.viewer.renderLayers();
      }
    });
    this.optionsbox.add(this.addLayer);

    this.activeLayerOpt = new OptionNumber("Active Layer", this.api.viewer.activeLayerIndex);
    this.activeLayerOpt.listen((evt) => {
      if (evt.type === "pre-change") {
        if (evt.proposedValue < 0) evt.proposedValue = 0;
        if (evt.proposedValue > this.api.viewer.layers.length-1) evt.proposedValue = 0;
      } else if (evt.type === "post-change") {
        this.api.viewer.setActiveLayer(parseInt(evt.currentValue));
        this.xOpt.setValue(parseInt(this.api.viewer.activeLayer.x));
        this.yOpt.setValue(parseInt(this.api.viewer.activeLayer.y));
        this.wOpt.setValue(parseInt(this.api.viewer.activeLayer.width));
        this.hOpt.setValue(parseInt(this.api.viewer.activeLayer.height));
        this.api.viewer.renderLayers();
      }
    }, 0);
    this.optionsbox.add(this.activeLayerOpt);

    this.lastX = undefined;
    this.lastY = undefined;
    this.deltaX = 0;
    this.deltaY = 0;
  }

  getOptions() {
    return this.optionsbox;
  }

  /**@param {CanvasRenderingContext2D} ctx Canvas Context
   * @param {Integer} x vertical
   * @param {Integer} y horizontal
   */
  onDraw(ctx, x, y, isNewStroke) {
    if (isNewStroke) {
      this.lastX = x;
      this.lastY = y;
      return;
    }
    this.deltaX = x - this.lastX;
    this.deltaY = y - this.lastY;
    this.lastX = x;
    this.lastY = y;
    this.api.viewer.activeLayer.x += this.deltaX;
    this.api.viewer.activeLayer.y += this.deltaY;
    this.xOpt.setValue(this.api.viewer.activeLayer.x);
    this.yOpt.setValue(this.api.viewer.activeLayer.y);
    this.api.viewer.renderLayers();
  }
}

export default Layers;
