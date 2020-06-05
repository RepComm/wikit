
import { API, Filter } from "../../code/api.js";

/**@type {API} */
let _api;

/**@param {API} api*/
export default function onRegister(api) {
  _api = api;
  api.registerFilter(new GradientFilter());
}

class GradientFilter extends Filter {
  constructor () {
    super("Gradient filter");

    window.fgrad = this;

    /**@type {CanvasGradient}*/
    this.grad;

    /**@type {Array<{color:string, p:number}>}*/
    this.stops = new Array();

    this.from = {x:0,y:0};
    this.to = {x:300,y:300};

    this.addColorStop(0, "white");
    this.addColorStop(0.5, "#4488ff");
    this.addColorStop(1, "black");
    
    _api.input.listen((type)=>{
      if (type === "pointer-down") {
        this.setFrom(_api.input.pointer.x, _api.input.pointer.y);
      } else if (type === "pointer-up") {
        this.setTo(_api.input.pointer.x, _api.input.pointer.y);
        this.perform(viewer, viewer.activeLayer, false);
      }
    });
  }
  addColorStop(p, color) {
    this.stops.push({p:p, color:color});
  }
  setFrom (x, y) {
    this.from.x = x;
    this.from.y = y;
  }
  setTo(x, y) {
    this.to.x = x;
    this.to.y = y;
  }
  /**@param {import("../../code/components/viewer.js").Viewer} viewer 
   * @param {import("../../code/components/viewer.js").Layer} layer 
   * @param {boolean} toNewLayer 
   */
  onProcess(viewer, layer, toNewLayer) {
    this.grad = viewer.ctxActive.createLinearGradient(
      this.from.x,
      this.from.y,
      this.to.x,
      this.to.y
    );
    for (let s of this.stops) {
      this.grad.addColorStop(s.p, s.color);
    }
    viewer.ctxActive.save();
    viewer.ctxActive.fillStyle = this.grad;
    viewer.ctxActive.fillRect(0,0,layer.width, layer.height);
    viewer.ctxActive.restore();
  }
}
