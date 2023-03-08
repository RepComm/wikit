
import { createProgramInfo, ProgramInfo } from "twgl.js";

export interface Uniforms {
  [key: string]: any;
}

export class Shader {
  programInfo: ProgramInfo;

  private _needsBuiltFlag: boolean;

  private _vertexSource: string;
  private _fragmentSource: string;

  set vertexSource (src: string) {
    this._vertexSource = src;
    this._needsBuiltFlag = true;
  }
  set fragmentSource (src: string) {
    this._fragmentSource = src;
    this._needsBuiltFlag = true;
  }
  
  constructor (vs: string, fs: string) {
    this._vertexSource = vs;
    this._fragmentSource = fs;
  }
  
  needsBuilt () {
    return this.programInfo === undefined || this._needsBuiltFlag;
  }
  build (gl: WebGL2RenderingContext) {
    this.programInfo = createProgramInfo(gl, [this._vertexSource, this._fragmentSource]);
    this._needsBuiltFlag = false;
  }
}
