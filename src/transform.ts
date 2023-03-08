
import { Matrix } from "./matrix.js";
import { Vector3 } from "./vector.js";

export class Transform {
  parent?: Transform;

  position: Vector3;
  
  worldMatrix: Matrix;
  matrix: Matrix;

  euler: Vector3;

  scale: Vector3;

  constructor () {
    this.matrix = new Matrix();
    this.worldMatrix = new Matrix();
    
    this.position = new Vector3();
    this.euler = new Vector3();
    this.scale = new Vector3(1,1,1);
  }
  setPos (x: number = 0, y: number = 0, z: number = 0) {
    this.position.set(x, y, z);
    return this;
  }
  setEuler (x: number = 0, y: number = 0, z: number = 0) {
    this.euler.set(x, y, z);
    return this;
  }
  setScale (x: number = 1, y: number = 1, z: number = 1) {
    this.scale.set(x, y, z);
    return this;
  }
  render () {
    this.matrix
    .identity()
    .translate(this.position)
    .rotateEuler(this.euler)
    .scale(this.scale);

    this.worldMatrix.copy(this.matrix);

    if (this.parent) this.worldMatrix.multiply(this.parent.matrix);

    return this;
  }
  copyMatrixToBuffer (dst: Float32Array, offset: number) {
    this.worldMatrix.copyToBuffer(dst, offset);
    return this;
  }
}
