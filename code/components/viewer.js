
import { make, applyStyleClasses } from "../utils/aliases.js";
import { Component } from "./component.js";

export class Layer extends Component {
  /**Construct a new layer
   * @param {String} name of this layer
   * @param {Number} width in pixels
   * @param {Number} height in pixels
   * @param {Number} x offset horizontal
   * @param {Number} y offset vertical
   * @param {ImageBitmap} imageBitmap raw data
   */
  constructor(name = "layer", width = 512, height = 512, x = 0, y = 0, imageBitmap = undefined) {
    super();
    this.name = name;
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.x = x;
    this.y = y;
    this.opacity = 1;
    if (imageBitmap) {
      this.imageBitmap = imageBitmap;
    } else {
      //this.imageBitmap = new ImageData(this.width, this.height);
      this.imageBitmap = undefined;
    }
    this.make("div");
    this.addClasses("layer");

    this.nameSpan = new Component()
      .make("span")
      .textContent(this.name)
      .addClasses("layer-name")
      .mount(this);
  }
}

export class Viewer {
  constructor() {
    this.drawRect = undefined;
    this.container = make("div");
    this.container.classList.add("render-container");

    //Renderer for layers below active/edit
    this.canvasLower = make("canvas");
    this.canvasLower.classList.add("render-canvas");
    this.canvasLower.id = "canvasLower";
    this.container.appendChild(this.canvasLower);

    //Renderer for active/edit layer
    this.canvasActive = make("canvas");
    this.canvasActive.classList.add("render-canvas");
    this.canvasActive.id = "canvasActive";
    this.container.appendChild(this.canvasActive);

    //Renderer for layers above active/edit
    this.canvasHigher = make("canvas");
    this.canvasHigher.id = "canvasHigher";
    this.canvasHigher.classList.add("render-canvas");
    this.container.appendChild(this.canvasHigher);

    this.ctxLower = this.canvasLower.getContext("2d");
    this.ctxActive = this.canvasActive.getContext("2d");
    this.ctxHigher = this.canvasHigher.getContext("2d");

    /** @type {Array<Layer>}
     */
    this.layers = new Array();
    this.activeLayerIndex = 0;
    this.activeIsOutlined = true;
    this.activeLayer = undefined;

    this.layersElement = make("div");
    this.layersElement.classList.add("layers");

    /**@type {Array<Layer>} active layer stack*/
    this.activeLayerStack = new Array();

    this.windowOffsetX = 0;
    this.windowOffsetY = 0;
  }

  renderLayers() {
    this.windowOffsetX = this.drawRect.left;
    this.windowOffsetY = this.drawRect.top;
    if (this.layers.length < 1) return;
    this.ctxLower.clearRect(
      0,
      0,
      this.canvasLower.width,
      this.canvasLower.height
    );
    this.ctxActive.clearRect(
      0,
      0,
      this.canvasActive.width,
      this.canvasActive.height
    );
    this.ctxHigher.clearRect(
      0,
      0,
      this.canvasHigher.width,
      this.canvasHigher.height
    );
    let activeRendered = false;
    this.activeLayer = this.layers[this.activeLayerIndex];

    //Code here can be optimised, right now I'm superstitious, so, maybe later..

    for (let layer of this.layers) {
      if (layer === this.activeLayer) {
        activeRendered = true;
        if (layer.imageBitmap) {
          this.ctxActive.save();
          this.ctxActive.globalAlpha = layer.opacity;
          this.ctxActive.drawImage(layer.imageBitmap, layer.x, layer.y);
          this.ctxActive.restore();
          if (this.activeIsOutlined) {
            this.ctxActive.save();
            this.ctxActive.beginPath();
            this.ctxActive.strokeStyle = "yellow";
            this.ctxActive.lineWidth = 1;
            this.ctxActive.setLineDash([8, 16]);
            this.ctxActive.rect(layer.x - 1, layer.y - 1, layer.width + 2, layer.height + 2);
            this.ctxActive.stroke();
            this.ctxActive.restore();
          }
        }
        continue;
      }

      if (activeRendered) {
        if (layer.imageBitmap) {
          this.ctxHigher.drawImage(layer.imageBitmap, layer.x, layer.y);
        }
      } else {
        if (layer.imageBitmap) {
          this.ctxLower.drawImage(layer.imageBitmap, layer.x, layer.y);
        }
      }
    }
  }

  renderCompositePNG(cb) {
    let old = this.activeIsOutlined;
    this.activeIsOutlined = false;
    //First, save the layers so they don't corrupt when merging
    this.saveActiveLayer(() => {
      console.log("Saving changes");
      //Render all layers to active
      for (let layer of this.layers) {
        //Only if they have data of course
        if (layer.imageBitmap) {
          this.ctxActive.drawImage(layer.imageBitmap, layer.x, layer.y);
        }
      }
      //Render the canvas to png and fire callback
      cb(this.canvasActive.toDataURL("image/png"));

      //Re-render layers to undo the merge we just did
      this.renderLayers();
    });
    this.activeIsOutlined = old;
  }

  clear() {
    this.ctxLower.clearRect(0, 0, this.drawRect.width, this.drawRect.height);
    this.ctxActive.clearRect(0, 0, this.drawRect.width, this.drawRect.height);
    this.ctxHigher.clearRect(0, 0, this.drawRect.width, this.drawRect.height);
  }

  recalcDrawRect() {
    this.drawRect = this.container.getBoundingClientRect();
  }

  resize() {
    this.windowOffsetX = this.drawRect.left;
    this.windowOffsetY = this.drawRect.top;
    this.canvasLower.width = this.drawRect.width;
    this.canvasLower.height = this.drawRect.height;
    this.canvasLower.style.width = this.drawRect.width + "px";

    this.canvasHigher.width = this.drawRect.width;
    this.canvasHigher.height = this.drawRect.height;
    this.canvasHigher.style.width = this.drawRect.width + "px";


    this.canvasActive.width = this.drawRect.width;
    this.canvasActive.height = this.drawRect.height;
    this.canvasActive.style.width = this.drawRect.width + "px";
  }

  mount(parent) {
    parent.appendChild(this.container);

    this.recalcDrawRect();
    this.clear();

    this.resize();

    this.renderLayers();
  }

  addLayer(name, imageBitmap = undefined) {
    let l;
    if (imageBitmap) {
      l = new Layer(name, imageBitmap.width, imageBitmap.height, 0, 0, imageBitmap);
    } else {
      l = new Layer(name, this.drawRect.width, this.drawRect.height, 0, 0, imageBitmap);
    }
    this.layers.push(l);
    if (!this.activeLayer) {
      this.setActiveLayer(l);
    } else {
      this.saveActiveLayer(() => {
        this.renderLayers();
      });
    }
    return l;
  }

  /**Saves active layer imagedata from editing canvas
   * Typically called before switching active layers to avoid loosing data
   */
  saveActiveLayer(cb, fixTransparency = false) {
    if (!this.activeLayer) {
      if (cb) cb();
      return;
    }
    if (fixTransparency) {
      let old = this.activeLayer.opacity;
      this.activeLayer.opacity = 1;
      this.renderLayers();
    }
    createImageBitmap(
      this.canvasActive,
      this.activeLayer.x,
      this.activeLayer.y,
      this.activeLayer.width,
      this.activeLayer.height
    ).then((imageBitmap) => {
      this.activeLayer.imageBitmap = imageBitmap;
      if (fixTransparency) {
        this.activeLayer.opacity = old;
        this.renderLayers();
      }
      if (cb) cb();
    });
  }

  /**Set the active layer by its ID
   * @param {Layer} layer 
   */
  setActiveLayer(layer) {
    if (!this.layers.includes(layer)) throw "Layer is not contained in viewer";
    if (this.activeLayer) {
      this.saveActiveLayer(() => {
        this.activeLayer = layer;
        this.activeLayerIndex = this.getLayerIndex(layer);
        this.renderLayers();
      });
    } else {
      this.activeLayer = layer;
      this.activeLayerIndex = this.getLayerIndex(layer);
      this.renderLayers();
    }
  }

  /**Set the active layer by its index
   * @param {number} ind 
   */
  setActiveLayerByIndex(ind) {
    if (ind === this.activeLayerIndex) return false;
    if (ind > this.layers.length - 1 || ind < 0) {
      ind = 0;
      return false;
    }
    this.setActiveLayer(this.getLayerByIndex(ind));
    return true;
  }

  /**Remember which layer is currently active
   * @param {Layer} layer 
   */
  pushActiveLayer() {
    this.activeLayerStack.push(this.activeLayer);
  }

  /**Reset the current active layer to be one we pushed earlier
   * If no layer has been previously pushed this will throw
   */
  popActiveLayer() {
    if (this.activeLayerStack.length < 1) throw "Layer stack is empty, cannot pop";
    this.saveActiveLayer(() => {
      this.setActiveLayerByIndex(
        this.getLayerIndex(
          this.activeLayerStack.pop()
        )
      );
      this.renderLayers();
    });
  }

  getLayerByName(name) {
    this.layers.forEach((l) => {
      if (l.name === name) return l;
    });
    return undefined;
  }

  getLayerIndexByName(name) {
    this.layers.forEach((l, i) => {
      if (l.name === name) return i;
    });
    return undefined;
  }

  /**Get a layer's index by its instance
   * @param {Layer} layer instance
   * @returns {number} index
   */
  getLayerIndex(layer) {
    let result = undefined;
    this.layers.forEach((l, i) => {
      if (layer === l) {
        result = i;
      }
    });
    return result;
  }

  /**Get a layer by its index/id
   * @param {number} ind index of the layer
   * @returns {Layer}
   */
  getLayerByIndex(ind) {
    return this.layers[ind];
  }
}
