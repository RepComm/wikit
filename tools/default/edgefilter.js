
import { API, Kernel, MultiKernelFilter } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerFilter(new EdgeFilter());
}

function edge (v) {
  return (0.45 - v)*2;
}

class EdgeFilter extends MultiKernelFilter {
  constructor () {
    super("Edge filter", [new Kernel(3), new Kernel(3)]);
    this.kernels[0].useEquation((u, v)=>edge(u));
    this.kernels[0].radius = 7;
    this.kernels[0].normalize();

    this.kernels[1].useEquation((u, v)=>edge(v));
    this.kernels[1].radius = 7;
    this.kernels[1].normalize();

    window.fedge = this;
  }
}