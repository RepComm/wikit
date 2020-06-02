
import { API, Kernel, KernelFilter } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new BlurFilter());
}

class BlurFilter extends KernelFilter {
  constructor () {
    // super("Blur filter");
    super("Blur filter", new Kernel(3, 3));
    this.kernel.data.set([
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ]);
    this.kernel.normalize();

    window.fblur = this;
  }
}
