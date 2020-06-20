
import { API, Kernel, KernelFilter } from "../../code/api.js";
import { OptionNumber, OptionButton } from "../../code/components/optionsbox.js";

/**@param {API} api*/
export default function onRegister(api) {
  let tool = new BlurFilter();
  api.registerFilter(tool);
  api.addPaletteButton(tool).icon("./tools/default/brush-icon.svg");
}

/**@author https://gist.github.com/uhho
 * @gist https://gist.github.com/uhho/dddd61edc0fdfa1c28e6
 * Two-dimensional Gaussian function
 * @param {number} amplitude
 * @param {number} x0
 * @param {number} y0
 * @param {number} sigmaX
 * @param {number} sigmaY
 * @returns {callback}
 * @callback callback
 * @param {number} u
 * @param {number} v
 * @returns {number}
 */
function makeGaussian(amplitude, x0, y0, sigmaX, sigmaY) {
  return function (amplitude, x0, y0, sigmaX, sigmaY, x, y) {
    var exponent = -(
      (Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)))
      + (Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2)))
    );
    return amplitude * Math.pow(Math.E, exponent);
  }.bind(null, amplitude, x0, y0, sigmaX, sigmaY);
}

class BlurFilter extends KernelFilter {
  constructor() {
    // super("Blur filter");
    super("Blur filter", new Kernel(3));

    let g = makeGaussian(1, 0.45, 0.45, 0.5, 0.5);

    this.kernel.useEquation(g);
    this.kernel.radius = 3;
    this.kernel.normalize();

    this.kernelWidthOpt = new OptionNumber("r","radius")
    .min(2).max(9).step(1).on("change", (evt)=>{
      this.kernel.radius = evt.target.value;
    }).value(this.kernel.radius);
    this.options.add(this.kernelWidthOpt);

    this.performBtn = new OptionButton("p","perform")
    .on("click", ()=>{
      this.perform(API.Global.viewer, API.Global.viewer.activeLayer, false);
    });
    this.options.add(this.performBtn);
  }
}
