
import { API, Kernel, MultiKernelFilter } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new EdgeFilter());
}

class EdgeFilter extends MultiKernelFilter {
  constructor () {
    super("Edge filter", [new Kernel(3, 3), new Kernel(3, 3)]);
    this.kernels[0].data.set([
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ]);
    this.kernels[0].normalize();

    this.kernels[1].data.set([
      -1, -2, -1,
      0, 0, 0,
      1, 2, 1
    ]);
    this.kernels[1].normalize();

    window.fedge = this;
  }
}
