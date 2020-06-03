
import { API, PixelFilter } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new GrayScaleFilter());
}

class GrayScaleFilter extends PixelFilter {
  constructor () {
    super("Grayscale filter");
    window.fgray = this;
  }
  /**Override this method, supplying your own
   * @virtual
   * @param {ImageData} srcImageData to read
   * @param {ImageData} dstImageData to modify
   */
  onImage(srcImageData, dstImageData) {
    let sw = srcImageData.width;
    let sh = srcImageData.height;

    let pixelValue = undefined;
    let avg = 0;

    for (let sx = 0; sx < sw; sx++) {
      for (let sy = 0; sy < sh; sy++) {
        pixelValue = PixelFilter.getPixelAt(sx, sy, srcImageData, pixelValue);
        avg = (pixelValue.r + pixelValue.g + pixelValue.b)/3;
        pixelValue.r = avg;
        pixelValue.g = avg;
        pixelValue.b = avg;
        PixelFilter.setPixelAt(sx, sy, dstImageData, pixelValue);
      }
    }
  }
}
