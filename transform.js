import { Matrix } from "./matrix.js";
import { Vector3 } from "./vector.js";
export class Transform {
  constructor() {
    this.matrix = new Matrix();
    this.worldMatrix = new Matrix();
    this.position = new Vector3();
    this.euler = new Vector3();
    this.scale = new Vector3(1, 1, 1);
  }
  setPos(x = 0, y = 0, z = 0) {
    this.position.set(x, y, z);
    return this;
  }
  setEuler(x = 0, y = 0, z = 0) {
    this.euler.set(x, y, z);
    return this;
  }
  setScale(x = 1, y = 1, z = 1) {
    this.scale.set(x, y, z);
    return this;
  }
  render() {
    this.matrix.identity().translate(this.position).rotateEuler(this.euler).scale(this.scale);
    this.worldMatrix.copy(this.matrix);
    if (this.parent) this.worldMatrix.multiply(this.parent.matrix);
    return this;
  }
  copyMatrixToBuffer(dst, offset) {
    this.worldMatrix.copyToBuffer(dst, offset);
    return this;
  }
}