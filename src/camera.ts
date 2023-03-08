
import { m4 } from "twgl.js";
import { Matrix } from "./matrix.js";
import { Transform } from "./transform.js";

export interface Common {
  near: number;
  far: number;
}

export interface Ortho extends Common {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Perspective extends Common {
  fieldOfView: number;
  aspectRatio: number;
}

export const DEG2RAD = Math.PI / 180;

export class Camera {
  private matrixIsDirty: boolean;

  private _fieldOfView: number;
  get fieldOfView () {
    return this._fieldOfView;
  }
  set fieldOfView (v: number) {
    this._fieldOfView = v;
    this.matrixIsDirty = true;
  }

  transform: Transform;

  
  projectionMatrix: Matrix;
  viewProjectionMatrix: Matrix;
  
  isOrthographic: boolean;
  orthographicSettings: Ortho;
  perspectiveSettings: Perspective;

  get viewMatrix () {
    return this.transform.matrix;
  }

  constructor () {
    this.isOrthographic = false;
    
    this.transform = new Transform();

    this.projectionMatrix = new Matrix();
    this.viewProjectionMatrix = new Matrix();
    this.orthographicSettings = {
      bottom: 1,
      top: -1,
      left: -1,
      right: 1,
      near: 0.1,
      far: 1
    };
    this.perspectiveSettings = {
      aspectRatio: 1,
      far: 100,
      fieldOfView: 70 * DEG2RAD,
      near: 0.1
    }
  }

  render () {
    this.transform.render();

    if (this.isOrthographic) {
      this.projectionMatrix.ortho(this.orthographicSettings);
    } else {
      this.projectionMatrix.perspective(this.perspectiveSettings);
    }

    this.viewProjectionMatrix.copy(this.viewMatrix).multiply(this.projectionMatrix);
  }
}
