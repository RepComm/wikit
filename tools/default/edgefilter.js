
import { API, Kernel, MultiKernelFilter } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new EdgeFilter());
}

class EdgeFilter extends MultiKernelFilter {
  constructor () {
    super("Edge filter", [new Kernel(3), new Kernel(3)]);
    this.kernels[0].useRaw([
      -1, 0, 1,
      -1, 0, 1,
      -1, 0, 1
    ]);

    this.kernels[1].useRaw([
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1
    ]);

    window.fedge = this;
  }
}