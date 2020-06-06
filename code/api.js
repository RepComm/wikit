import { OptionsBox } from "./components/optionsbox.js";
import { Viewer } from "./components/viewer.js";
import { Utils } from "./utils/math.js";
import { Input } from "./utils/input.js";
import ToolBox from "./components/toolbox.js";

export class API {
  static Global = undefined;
  constructor() {
    if (!API.Global) {
      API.Global = this;
    } else {
      throw "Cannot create another API!";
    }
    /**@type {Array<Brush>}*/
    this.brushes = new Array();

    /**@type {Array<Filter>}*/
    this.filters = new Array();

    /**@type {import("./components/viewer.js").Viewer} */
    this.viewer;

    this.input = new Input();
    this.input.registerEvents();

    this.toolbox = new ToolBox("main", this);
  }

  /**Register a brush tool
   * @param {Brush} brush
   */
  registerBrush(brush) {
    if (this.brushes.includes(brush)) throw "Cannot add brush twice";
    this.brushes.push(brush);
    setTimeout(() => {
      this.onEvent({
        type: "brush-register",
        brush: brush
      });
    });
  }

  /**Unregister a brush tool
   * @param {Brush} brush 
   */
  unregisterBrush(brush) {
    let ind = this.brushes.indexOf(brush);
    if (ind !== -1) {
      throw "Cannot unregister brush that was never registered";
    } else {
      this.brushes.splice(ind, 1);
      setTimeout(() => {
        this.onEvent({
          type: "brush-unregister",
          brush: brush
        });
      });
    }
  }

  /**Register a filter tool
   * @param {Filter} filter
   */
  registerFilter(filter) {
    if (this.filters.includes(filter)) throw "Cannot add filter twice";
    this.filters.push(filter);
    setTimeout(() => {
      this.onEvent({
        type: "filter-register",
        filter: filter
      });
    });
  }

  /**Unregister a filter tool
   * @param {Brush} filter 
   */
  unregisterFilter(filter) {
    let ind = this.filters.indexOf(filter);
    if (ind !== -1) {
      throw "Cannot unregister filter that was never registered";
    } else {
      this.filters.splice(ind, 1);
      setTimeout(() => {
        this.onEvent({
          type: "filter-unregister",
          filter: filter
        });
      });
    }
  }

  onEvent(evt) {
    console.log(evt);
  }

  /**@param {Viewer} viewer*/
  setViewer (viewer) {
    this.viewer = viewer;
  }
}

export class Tool {
  /**
   * @param {string} name 
   */
  constructor(name) {
    this.name = name;
  }
}

export class Brush extends Tool {
  /**@type {string} foreground color*/
  static fgColor = "white";
  /**@type {string} background color*/
  static bgColor = "black";
  /**@type {number} width in pixels*/
  static width = 1;
  /**@type {boolean} debug draw*/
  static debugDraw = false;
  /**@type {number} opacity 0 - 1*/
  static opacity = 1;

  constructor(name) {
    super(name);

    /**@type {OptionsBox} ui container*/
    this.options = new OptionsBox(`${name} options`);
  }

  /**Override this to provide your own stroke behaviour
   * @virtual
   * @param {CanvasRenderingContext2D} ctx current render context
   * @param {number} x layer coordinate
   * @param {number} y layer coordinate
   * @param {number} lx last layer coordinate
   * @param {number} ly last layer coordinate
   */
  onStroke(ctx, x, y, lx, ly) {
    throw "Not implemented in subclass";
  }
}

/**@author Jonathan Crowder
 * An implementation for managing image filter kernels
 */
export class Kernel {
  constructor(radius = 3) {
    /**@type {number} radius of the kernel [internal]*/
    this._radius = radius;
    this.radius = radius;

    this.width = radius;
    this.height = radius;

    //Equation used to calculate the kernel in normalized (0 - 1) 2d space
    this.equation = (u, v) => 1; //Regular blur

    /**@type {"eq"|"raw"} Method of kernel data*/
    this.mode = "eq";

    this.data = new Float32Array(this.width * this.height);
    this.result = {
      r: new Int32Array(this.width * this.height),
      g: new Int32Array(this.width * this.height),
      b: new Int32Array(this.width * this.height),
      a: new Int32Array(this.width * this.height)
    };
  }
  /**Normalizes the kernel's data
   * This helps prevent color clipping and overscaling
   */
  normalize() {
    let ratio = Utils.float32Max(this.data) / 1;

    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = (this.data[i] / ratio);
    }
  }
  /**Use an equation as the kernel
   * @param {fEqCallback} fEq
   * @callback fEqCallback
   * @param {number} u noralized x coordinate
   * @param {number} v normalized y coordiante
   * @returns {number} output
   */
  useEquation(fEq) {
    this.equation = fEq;
    this.mode = "eq";
  }
  /**Use a raw set of floats for the kernel
   * Warning, this will not recalculate when rescaled
   * You will need to set this again will new, properly sized data when modifying radius
   * @param {Float32Array} array data
   */
  useRaw(array) {
    this.mode = "raw";
    this.data = array;
  }
  /**Gets the radius of the kernel
   */
  get radius() {
    return this._radius;
  }

  /**Recalculates the data based on the kernel equation
   */
  recalcDataFromEq() {
    this.data = new Float32Array(this.width * this.height);
    this.result.r = new Uint32Array(this.width * this.height);
    this.result.g = new Uint32Array(this.width * this.height);
    this.result.b = new Uint32Array(this.width * this.height);
    this.result.a = new Uint32Array(this.width * this.height);

    let krnPixelIndex = 0;
    let u = 0;
    let v = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        krnPixelIndex = Utils.TwoDimToIndex(x, y, this.width);
        u = (x / this.width);
        if (u === 0) u = 0.01;
        v = (y / this.height);
        if (v === 0) v = 0.01;
        this.data[krnPixelIndex] = this.equation(u, v);
      }
    }
  }

  /**Set the radius of the kernel
   * This will recalculate kernel data
   * @param {number} r radius
   */
  set radius(r) {
    this._radius = r;
    this.width = this._radius;
    this.height = this._radius;

    if (this.mode === "eq") {
      this.recalcDataFromEq();
    } else if (this.mode === "raw") {
      console.warn("Rescaling radius in raw mode, please useRaw again");
    }
  }

  logData() {
    let msg = "";
    let krnPixelIndex = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        krnPixelIndex = Utils.TwoDimToIndex(x, y, this.width);
        msg += this.data[krnPixelIndex].toFixed(2) + ", ";
      }
      msg += "\n\n";
    }
    console.log(msg);
  }

  /**Reduce the result to a single pixel data
   * @param {{r:number,g:number,b:number,a:number}|undefined} pixelValue 
   */
  reduceResult (pixelValue) {
    if (!pixelValue) pixelValue = {r:0,g:0,b:0,a:0};
    pixelValue.r = this.result.r.reduce((p, c)=>p+c);
    pixelValue.g = this.result.g.reduce((p, c)=>p+c);
    pixelValue.b = this.result.b.reduce((p, c)=>p+c);
    pixelValue.a = this.result.a.reduce((p, c)=>p+c);
    return pixelValue;
  }
}

export class Filter extends Tool {
  /**A base class for filter tools
   * @param {string} name 
   */
  constructor(name) {
    super(name);
  }

  /**Call when you want to perform this filter on a layer
   * @param {Viewer} viewer 
   * @param {Layer} layer 
   * @param {boolean} toNewLayer 
   */
  perform(viewer, layer, toNewLayer) {
    //Remembers which layer was active
    viewer.pushActiveLayer();
    //Sets a new active layer
    viewer.setActiveLayer(layer);
    //Tells the filter to do its thing
    this.onProcess(viewer, layer, toNewLayer);
    //Tells viewer to bring back the old active layer
    viewer.popActiveLayer();
  }

  /**Override this function to process layer data
   * @virtual
   * @param {Viewer} viewer renderer
   * @param {import("./components/viewer.js").Layer} layer
   * @param {boolean} toNewLayer will perform result on a new copy of the layer when true
   * @returns {Layer} whatever layer was effected by the process
   */
  onProcess(viewer, layer, toNewLayer = false) {
    throw "Not implemented in subclass";
  }
}

export class PixelFilter extends Filter {
  /**@param {string} name
   */
  constructor(name) {
    super(name);

  }
  /**Override this function to process layer data
   * @override
   * @param {Viewer} viewer renderer
   * @param {import("../../code/components/viewer.js").Layer} layer
   * @param {boolean} toNewLayer will perform result on a new copy of the layer when true
   * @returns {Layer} whatever layer was effected by the process
   */
  onProcess(viewer, layer, toNewLayer) {
    let sw = viewer.canvasActive.width;
    let sh = viewer.canvasActive.height;

    //Get source data
    let src = viewer.ctxActive.getImageData(0, 0, sw, sh);
    //Create destination data
    let dst = new ImageData(sw, sh);

    //Call on image with source and destination
    this.onImage(src, dst);

    //Put the result into active
    viewer.ctxActive.putImageData(dst, 0, 0);
  }

  /**Override this method, supplying your own
   * @virtual
   * @param {ImageData} srcImageData to read
   * @param {ImageData} dstImageData to modify
   */
  onImage(srcImageData, dstImageData) {
    throw "Not implemented in subclass";
  }

  /**Gets the pixel value in an imagedata by xy
   * @param {number} x 
   * @param {number} y 
   * @param {ImageData} imagedata
   * @param {{r:number,g:number,b:number,a:number}|undefined} pixel
   * @returns {{r:number,g:number,b:number,a:number}}
   */
  static getPixelAt(x, y, imagedata, pixel) {
    let ind = Utils.TwoDimToIndex(x, y, imagedata.width) * 4;
    if (!pixel) pixel = { r: 0, g: 0, b: 0, a: 0 };
    try {
      pixel.r = imagedata.data[ind];
      pixel.g = imagedata.data[ind + 1];
      pixel.b = imagedata.data[ind + 2];
      pixel.a = imagedata.data[ind + 3];
    } catch (e) {
      throw `${x},${y} out of bounds in ${imagedata}`;
    }
    return pixel;
  }
  /**Sets the pixel value in an imagedata by xy
   * @param {number} x 
   * @param {number} y 
   * @param {ImageData} imagedata
   * @returns {{r:number,g:number,b:number,a:number}}
   */
  static setPixelAt(x, y, imagedata, pixel) {
    let ind = Utils.TwoDimToIndex(x, y, imagedata.width) * 4;
    try {
      imagedata.data[ind] = pixel.r;
      imagedata.data[ind + 1] = pixel.g;
      imagedata.data[ind + 2] = pixel.b;
      imagedata.data[ind + 3] = pixel.a;
    } catch (e) {
      throw `${x},${y} out of bounds in ${imagedata}`;
    }
  }
}

export class KernelFilter extends PixelFilter {
  /**@param {string} name 
   * @param {Kernel} kernel 
   */
  constructor(name, kernel) {
    super(name);

    /**@type {Kernel}*/
    this.kernel;
    if (kernel) {
      this.kernel = kernel;
    } else {
      this.kernel = new Kernel(3);
      this.kernel.useRaw([
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ]);
    }
  }

  /**Override this method, supplying your own
   * @override
   * @param {ImageData} srcImageData to read
   * @param {ImageData} dstImageData to modify
   */
  onImage(srcImageData, dstImageData) {
    console.log("Executes");
    let sw = srcImageData.width;
    let sh = srcImageData.height;

    //Overlap info, prevents getting out of bounds pixels
    let kwh = Math.ceil(this.kernel.width / 2);
    let khh = Math.ceil(this.kernel.height / 2);

    let krnPixelIndex = 0;
    let pixelValue = { r: 0, g: 0, b: 0, a: 0 };
    let nx = 0;
    let ny = 0;
    let krnCell = 0;

    //Loop through source
    for (let sx = 0; sx < sw; sx++) {
      for (let sy = 0; sy < sh; sy++) {
        //Loop through kernel
        for (let kx = 0; kx < this.kernel.width; kx++) {
          for (let ky = 0; ky < this.kernel.height; ky++) {
            nx = sx + (kx - kwh);
            ny = sy + (ky - khh);
            if (nx < 0 || nx > sw - 1 || ny < 0 || ny > sh - 1) continue;
            //Lay the kernel centered over the current source image pixel
            //Get kernel at this point
            krnPixelIndex = Utils.TwoDimToIndex(kx, ky, this.kernel.width);
            krnCell = this.kernel.data[krnPixelIndex];

            //Get rgba and multiply by kernel
            pixelValue = PixelFilter.getPixelAt(nx, ny, srcImageData, pixelValue);

            pixelValue.r *= krnCell;
            pixelValue.g *= krnCell;
            pixelValue.b *= krnCell;
            pixelValue.a *= krnCell;

            //Copy the modified pixel into the result kernel
            this.kernel.result.r[krnPixelIndex] = Math.floor(pixelValue.r);
            this.kernel.result.g[krnPixelIndex] = Math.floor(pixelValue.g);
            this.kernel.result.b[krnPixelIndex] = Math.floor(pixelValue.b);
            this.kernel.result.a[krnPixelIndex] = Math.floor(pixelValue.a);
          }
        }
        
        //Add up the result kernel into a single pixel
        pixelValue = this.kernel.reduceResult(pixelValue);

        //Average the value by the pixel count of the kernel
        pixelValue.r /= this.kernel.result.r.length/1.3;
        pixelValue.g /= this.kernel.result.g.length/1.3;
        pixelValue.b /= this.kernel.result.b.length/1.3;
        pixelValue.a /= this.kernel.result.a.length/1.3;
        
        //Set the destination pixel to the kernel processed source pixel
        PixelFilter.setPixelAt(sx, sy, dstImageData, pixelValue);
      }
    }
    console.log("Finished");
  }
}

export class MultiKernelFilter extends Filter {
  /**@param {string} name 
   * @param {Array<Kernel>} kernels 
   */
  constructor(name, kernels) {
    super(name);
    /**@type {Array<Kernel>}*/
    this.kernels = kernels;
    if (!kernels) throw "Kernels array cannot be empty";
  }
  /**Override this function to process layer data
   * @override
   * @param {Viewer} viewer renderer
   * @param {import("../../code/components/viewer.js").Layer} layer
   * @param {boolean} toNewLayer will perform result on a new copy of the layer when true
   * @returns {Layer} whatever layer was effected by the process
   */
  onProcess(viewer, layer, toNewLayer) {
    viewer.pushActiveLayer();
    viewer.setActiveLayer(layer);
    let sw = viewer.canvasActive.width;
    let sh = viewer.canvasActive.height;

    //Get source data
    let src = viewer.ctxActive.getImageData(0, 0, sw, sh);
    //Source viewer
    let srcView = new DataView(src.data.buffer);

    //Create destination data
    let dst = new ImageData(sw, sh);
    //Destination viewer
    let dstView = new DataView(dst.data.buffer);

    //Overlap info, prevents getting out of bounds pixels
    //Kernel width halved
    let kwh = Math.ceil(this.kernels[0].width / 2);
    //Kernel height halved
    let khh = Math.ceil(this.kernels[0].height / 2);

    //Destination pixel index
    let dstPixelIndex = 0;
    //Source pixel index
    let srcPixelIndex = 0;
    //Kernel pixel index
    let krnPixelIndex = 0;

    let pixelValue = { r: 0, g: 0, b: 0, a: 0 };

    let nx = 0;
    let ny = 0;

    let krnCell = 0;

    //Loop through source
    for (let sx = 0; sx < sw; sx++) {
      for (let sy = 0; sy < sh; sy++) {
        dstPixelIndex = Utils.TwoDimToIndex(sx, sy, sw) * 4;

        //Loop through kernel
        for (let kx = 0; kx < this.kernels[0].width; kx++) {
          for (let ky = 0; ky < this.kernels[0].height; ky++) {
            nx = sx + (kx - kwh);
            ny = sy + (ky - khh);
            if (nx < 0 || nx > sw - 1 || ny < 0 || ny > sh - 1) continue;
            //Lay the kernel centered over the current source image pixel
            srcPixelIndex = Utils.TwoDimToIndex(sx + (kx - kwh), sy + (ky - khh), sw) * 4;

            krnPixelIndex = Utils.TwoDimToIndex(kx, ky, this.kernels[0].width);

            for (let i = 0; i < this.kernels.length; i++) {
              //Get kernel at this point
              krnCell = this.kernels[i].data[krnPixelIndex];

              //Get rgba and multiply by kernel
              pixelValue.r += srcView.getUint8(srcPixelIndex + 0) * krnCell;
              pixelValue.g += srcView.getUint8(srcPixelIndex + 1) * krnCell;
              pixelValue.b += srcView.getUint8(srcPixelIndex + 2) * krnCell;
              //pixelValue.a = srcView.getUint8(srcPixelIndex + 3) * krnCell;
            }

            //Copy the modified pixel into the result kernel
            this.kernels[0].result.r[krnPixelIndex] = pixelValue.r / this.kernels.length;
            this.kernels[0].result.g[krnPixelIndex] = pixelValue.g / this.kernels.length;
            this.kernels[0].result.b[krnPixelIndex] = pixelValue.b / this.kernels.length;
            //this.kernel.result.a[krnPixelIndex] = pixelValue.a / this.kernels.length;
          }
        }

        //Add up the result kernel into a single pixel
        pixelValue.r = this.kernels[0].result.r.reduce(
          (accumulator, value) => {
            return accumulator + value;
          }
        );
        pixelValue.g = this.kernels[0].result.g.reduce(
          (accumulator, value) => {
            return accumulator + value;
          }
        );
        pixelValue.b = this.kernels[0].result.b.reduce(
          (accumulator, value) => {
            return accumulator + value;
          }
        );
        pixelValue.a = 255;// pixelValue.a = this.kernel.result.a.reduce(
        //   (accumulator, value) => {
        //     return accumulator + value;
        //   }
        // );

        //Average the value by the pixel count of the kernel
        pixelValue.r /= this.kernels[0].result.r.length;
        pixelValue.g /= this.kernels[0].result.g.length;
        pixelValue.b /= this.kernels[0].result.b.length;
        //pixelValue.a /= this.kernel.result.a.length;

        //Set the destination pixel to the kernel processed source pixel
        dstView.setUint8(dstPixelIndex + 0, pixelValue.r);
        dstView.setUint8(dstPixelIndex + 1, pixelValue.g);
        dstView.setUint8(dstPixelIndex + 2, pixelValue.b);
        dstView.setUint8(dstPixelIndex + 3, pixelValue.a);
      }
    }

    viewer.ctxActive.putImageData(dst, 0, 0);

    viewer.popActiveLayer();
  }
}
