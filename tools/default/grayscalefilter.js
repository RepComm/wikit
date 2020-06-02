
import { API, Filter } from "../../code/api.js";
import { Utils } from "../../code/math.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new GrayScaleFilter());
}

class GrayScaleFilter extends Filter {
  constructor () {
    super("Grayscale filter");
    
    window.fgray = this;
  }
  /**Override this function to process layer data
   * @virtual
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

    //Source pixel index
    let srcPixelIndex = 0;

    let avg = 0;

    for (let sx = 0; sx < sw; sx++) {
      for (let sy = 0; sy < sh; sy++) {
        srcPixelIndex = Utils.TwoDimToIndex(sx, sy, sw) * 4;

        avg = srcView.getUint8(srcPixelIndex + 0) +
          srcView.getUint8(srcPixelIndex + 1) +
          srcView.getUint8(srcPixelIndex + 2) +
          srcView.getUint8(srcPixelIndex + 3);
        avg = parseInt(avg/3);

        dstView.setUint8(srcPixelIndex + 0, avg);
        dstView.setUint8(srcPixelIndex + 1, avg);
        dstView.setUint8(srcPixelIndex + 2, avg);
        dstView.setUint8(srcPixelIndex + 3, 255);
      }
    }

    viewer.ctxActive.putImageData(dst, 0, 0);

    viewer.popActiveLayer();
  }
}
