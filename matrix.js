import { m4 } from "twgl.js";
export class Matrix {
  constructor() {
    this.data = m4.create();
  }
  identity() {
    m4.identity(this.data);
    return this;
  }
  axisRotate(axis, angleInRadians) {
    m4.axisRotate(this.data, axis.data, angleInRadians, this.data);
    return this;
  }
  axisRotation(axis, angleInRadians) {
    m4.axisRotation(axis.data, angleInRadians, this.data);
    return this;
  }
  copy(other) {
    m4.copy(other.data, this.data);
    return this;
  }
  frustum(left, right, bottom, top, near, far) {
    m4.frustum(left, right, bottom, top, near, far, this.data);
    return this;
  }
  getAxis(axis) {
    m4.getAxis(this.data, axis);
    return this;
  }
  getTranslation(out) {
    m4.getTranslation(this.data, out.data);
    return this;
  }
  inverse() {
    m4.inverse(this.data, this.data);
    return this;
  }
  lookAt(eye, target, up) {
    m4.lookAt(eye.data, target.data, up.data, this.data);
    return this;
  }
  multiply(other) {
    m4.multiply(other.data, this.data, this.data);
    return this;
  }
  negate(other) {
    m4.negate(other.data, this.data);
    return this;
  }
  ortho(o) {
    m4.ortho(o.left, o.right, o.bottom, o.top, o.near, o.far, this.data);
    return this;
  }
  perspective(p) {
    m4.perspective(p.fieldOfView, p.aspectRatio, p.near, p.far, this.data);
    return this;
  }
  rotateEuler(euler) {
    this.rotateX(euler.x);
    this.rotateY(euler.y);
    this.rotateZ(euler.z);
    return this;
  }
  rotateX(angleInRadians) {
    m4.rotateX(this.data, angleInRadians, this.data);
    return this;
  }
  rotateY(angleInRadians) {
    m4.rotateY(this.data, angleInRadians, this.data);
    return this;
  }
  rotateZ(angleInRadians) {
    m4.rotateZ(this.data, angleInRadians, this.data);
    return this;
  }
  rotationX(angleInRadians) {
    m4.rotationX(angleInRadians, this.data);
    return this;
  }
  rotationY(angleInRadians) {
    m4.rotationY(angleInRadians, this.data);
    return this;
  }
  rotationZ(angleInRadians) {
    m4.rotationZ(angleInRadians, this.data);
    return this;
  }
  scale(v) {
    m4.scale(this.data, v.data, this.data);
    return this;
  }
  scaling(v) {
    m4.scaling(v.data, this.data);
    return this;
  }
  setAxis(v, axis) {
    m4.setAxis(this.data, v.data, axis, this.data);
    return this;
  }
  setTranslation(v) {
    m4.setTranslation(this.data, v.data, this.data);
    return this;
  }
  transformDirection(v) {
    m4.transformDirection(this.data, v.data, this.data);
    return this;
  }
  transformNormal(v) {
    m4.transformNormal(this.data, v.data, this.data);
    return this;
  }
  transformPoint(v) {
    m4.transformPoint(this.data, v.data, this.data);
    return this;
  }
  translate(v) {
    m4.translate(this.data, v.data, this.data);
    return this;
  }
  translation(v) {
    m4.translation(v.data, this.data);
    return this;
  }
  transpose() {
    m4.transpose(this.data, this.data);
    return this;
  }
  copyToBuffer(dst, offset) {
    dst[0 + offset] = this.data[0];
    dst[1 + offset] = this.data[1];
    dst[2 + offset] = this.data[2];
    dst[3 + offset] = this.data[3];
    dst[4 + offset] = this.data[4];
    dst[5 + offset] = this.data[5];
    dst[6 + offset] = this.data[6];
    dst[7 + offset] = this.data[7];
    dst[8 + offset] = this.data[8];
    dst[9 + offset] = this.data[9];
    dst[10 + offset] = this.data[10];
    dst[11 + offset] = this.data[11];
    dst[12 + offset] = this.data[12];
    dst[13 + offset] = this.data[13];
    dst[14 + offset] = this.data[14];
    dst[15 + offset] = this.data[15];
    return this;
  }
}