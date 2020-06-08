
import { API, Filter } from "../../code/api.js";
import { OptionColor } from "../../code/components/optionsbox.js";

/**@type {API} */
let _api;

/**@param {API} api*/
export default function onRegister(api) {
  let tool = new GradientFilter();
  api.registerFilter(tool);
  api.addPaletteButton(tool).icon("./tools/default/brush-icon.svg");
}

class GradientFilter extends Filter {
  constructor () {
    super("Gradient filter");

    /**@type {CanvasGradient}*/
    this.grad;

    /**@type {Array<{color:string, p:number}>}*/
    this.stops = new Array();

    this.from = {x:0,y:0};
    this.to = {x:300,y:300};

    this.addColorStop(0, "white");
    this.addColorStop(1, "black");

    this.fgColor = "#ffffff";
    /**@type {OptionColor}*/
    this.fgColorOpt = new OptionColor("fg","start color").on("change", (evt)=>{
      this.fgColor = evt.target.value;
      this.setColorStop(0, 0, this.fgColor);
    }).color(this.fgColor);
    this.options.add(this.fgColorOpt);

    /**@type {string} background color*/
    this.bgColor = "#000000";
    /**@type {OptionColor}*/
    this.bgColorOpt = new OptionColor("bg","end color").on("change", (evt)=>{
      this.bgColor = evt.target.value;
      this.setColorStop(1, 1, this.bgColor);
    }).color(this.bgColor);
    this.options.add(this.bgColorOpt);
  }
  onEvent(type) {
    if (!API.Global.viewer.pointObjInside(API.Global.input.pointer)) return;
    if (type === "pointer-up") {
      this.setTo(
        API.Global.input.pointer.x - API.Global.viewer.rect.left,
        API.Global.input.pointer.y - API.Global.viewer.rect.top
      );
      this.perform(API.Global.viewer, API.Global.viewer.activeLayer, false);
    } else if (type === "pointer-down") {
      this.setFrom(
        API.Global.input.pointer.x - API.Global.viewer.rect.left,
        API.Global.input.pointer.y - API.Global.viewer.rect.top
      );
    }
  }
  setColorStop (index, p, color) {
    this.stops[index].p = p;
    this.stops[index].color = color;
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
