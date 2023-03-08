import { createProgramInfo } from "twgl.js";
export class Shader {
  set vertexSource(src) {
    this._vertexSource = src;
    this._needsBuiltFlag = true;
  }
  set fragmentSource(src) {
    this._fragmentSource = src;
    this._needsBuiltFlag = true;
  }
  constructor(vs, fs) {
    this._vertexSource = vs;
    this._fragmentSource = fs;
  }
  needsBuilt() {
    return this.programInfo === undefined || this._needsBuiltFlag;
  }
  build(gl) {
    this.programInfo = createProgramInfo(gl, [this._vertexSource, this._fragmentSource]);
    this._needsBuiltFlag = false;
  }
}