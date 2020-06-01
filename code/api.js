import { OptionsBox } from "./components/optionsbox.js";

export class API {
  constructor () {
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
  registerBrush (brush) {
    if (this.brushes.includes(brush)) throw "Cannot add brush twice";
    this.brushes.push(brush);
    setTimeout(()=>{
      this.onEvent({
        type:"brush-register",
        brush:brush
      });
    });
  }

  /**Unregister a brush tool
   * @param {Brush} brush 
   */
  unregisterBrush (brush) {
    let ind = this.brushes.indexOf(brush);
    if (ind !== -1) {
      throw "Cannot unregister brush that was never registered";
    } else {
      this.brushes.splice(ind, 1);
      setTimeout(()=>{
        this.onEvent({
          type:"brush-unregister",
          brush:brush
        });
      });
    }
  }

  /**Register a filter tool
   * @param {Filter} filter
   */
  registerFilter (filter) {
    if (this.filters.includes(filter)) throw "Cannot add filter twice";
    this.filters.push(filter);
    setTimeout(()=>{
      this.onEvent({
        type:"filter-register",
        filter:filter
      });
    });
  }

  /**Unregister a filter tool
   * @param {Brush} filter 
   */
  unregisterFilter (filter) {
    let ind = this.filters.indexOf(filter);
    if (ind !== -1) {
      throw "Cannot unregister filter that was never registered";
    } else {
      this.filters.splice(ind, 1);
      setTimeout(()=>{
        this.onEvent({
          type:"filter-unregister",
          filter:filter
        });
      });
    }
  }

  onEvent (evt) {
    console.log(evt);
  }
}

export class Tool {
  /**
   * @param {string} name 
   */
  constructor (name) {
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

  constructor (name) {
    super(name);

    /**@type {OptionsBox} ui container*/
    this.options = new OptionsBox(`${name} options`);
  }

  /**Override this to provide your own stroke behaviour
   * @virtual
   * @param {number} x layer coordinate
   * @param {number} y layer coordinate
   * @param {number} lx last layer coordinate
   * @param {number} ly last layer coordinate
   */
  onStroke (x, y, lx, ly) {
    throw "Not implemented in subclass";
  }
}

export class Filter extends Tool {
  constructor (name) {
    super(name);
  }

  /**Override this function to process layer data
   * @virtual
   * @param {import("./components/viewer.js").Layer} layer
   * @param {boolean} toNewLayer will perform result on a new copy of the layer when true
   * @returns {Layer} whatever layer was effected by the process
   */
  onProcess (layer, toNewLayer=false) {
    throw "Not implemented in subclass";
  }
}
