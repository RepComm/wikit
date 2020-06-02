import { OptionsBox } from "./components/optionsbox.js";
import { Viewer } from "./components/viewer.js";
import { Utils } from "./math.js";

export class API {
  constructor() {
    /**@type {Array<Brush>}*/
    this.brushes = new Array();

    /**@type {Array<Filter>}*/
    this.filters = new Array();

    /**@type {import("./components/viewer.js").Viewer} */
    this.viewer;
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

export class Kernel {
  constructor(width = 3, height = 3) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(this.width * this.height);
    this.result = {
      r: new Int32Array(this.width * this.height),
      g: new Int32Array(this.width * this.height),
      b: new Int32Array(this.width * this.height),
      a: new Int32Array(this.width * this.height)
    };
  }
  normalize() {
    let ratio = Utils.float32Max(this.data) / 1;

    for (let i=0; i < this.data.length; i++) {
      this.data[i] = (this.data[i] / ratio)*2;
    }
  }
}

export class Filter extends Tool {
  /**A base class for filter tools
   * @param {string} name 
   */
  constructor(name) {
    super(name);
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

export class KernelFilter extends Filter {
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
      this.kernel = new Kernel(3, 3);
      this.kernel.data.set([
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
      ]);
    }
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
    let kwh = Math.ceil(this.kernel.width / 2);
    //Kernel height halved
    let khh = Math.ceil(this.kernel.height / 2);

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
        for (let kx = 0; kx < this.kernel.width; kx++) {
          for (let ky = 0; ky < this.kernel.height; ky++) {
            nx = sx + (kx - kwh);
            ny = sy + (ky - khh);
            if (nx < 0 || nx > sw || ny < 0 || ny > sh) continue;
            //Lay the kernel centered over the current source image pixel
            srcPixelIndex = Utils.TwoDimToIndex(sx + (kx - kwh), sy + (ky - khh), sw) * 4;

            krnPixelIndex = Utils.TwoDimToIndex(kx, ky, this.kernel.width);

            //Get kernel at this point
            krnCell = this.kernel.data[krnPixelIndex];

            //Get rgba and multiply by kernel
            pixelValue.r = srcView.getUint8(srcPixelIndex + 0) * krnCell;
            pixelValue.g = srcView.getUint8(srcPixelIndex + 1) * krnCell;
            pixelValue.b = srcView.getUint8(srcPixelIndex + 2) * krnCell;
            //pixelValue.a = srcView.getUint8(srcPixelIndex + 3) * krnCell;

            //Copy the modified pixel into the result kernel
            this.kernel.result.r[krnPixelIndex] = pixelValue.r;
            this.kernel.result.g[krnPixelIndex] = pixelValue.g;
            this.kernel.result.b[krnPixelIndex] = pixelValue.b;
            //this.kernel.result.a[krnPixelIndex] = pixelValue.a;
          }
        }

        //Add up the result kernel into a single pixel
        pixelValue.r = this.kernel.result.r.reduce(
          (accumulator, value) => {
            return accumulator + value;
          }
        );
        pixelValue.g = this.kernel.result.g.reduce(
          (accumulator, value) => {
            return accumulator + value;
          }
        );
        pixelValue.b = this.kernel.result.b.reduce(
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
        pixelValue.r /= this.kernel.result.r.length;
        pixelValue.g /= this.kernel.result.g.length;
        pixelValue.b /= this.kernel.result.b.length;
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
            if (nx < 0 || nx > sw || ny < 0 || ny > sh) continue;
            //Lay the kernel centered over the current source image pixel
            srcPixelIndex = Utils.TwoDimToIndex(sx + (kx - kwh), sy + (ky - khh), sw) * 4;

            krnPixelIndex = Utils.TwoDimToIndex(kx, ky, this.kernels[0].width);

            for (let i=0; i<this.kernels.length; i++) {
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
