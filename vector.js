import { v3 } from "twgl.js";
export class Vector3 {
  set x(v) {
    this.data[0] = v;
  }
  set y(v) {
    this.data[1] = v;
  }
  set z(v) {
    this.data[2] = v;
  }
  get x() {
    return this.data[0];
  }
  get y() {
    return this.data[1];
  }
  get z() {
    return this.data[2];
  }
  constructor(x = 0, y = 0, z = 0) {
    this.data = v3.create(x, y, z);
  }
  add(v) {
    v3.add(this.data, v.data, this.data);
    return this;
  }
  sub(v) {
    v3.subtract(this.data, v.data, this.data);
    return this;
  }
  mul(v) {
    v3.multiply(this.data, v.data, this.data);
    return this;
  }
  mulScalar(v) {
    v3.mulScalar(this.data, v, this.data);
    return this;
  }
  div(v) {
    v3.divide(this.data, v.data, this.data);
    return this;
  }
  divScalar(v) {
    v3.divScalar(this.data, v, this.data);
    return this;
  }
  dot(v) {
    return v3.dot(this.data, v.data);
  }
  lerp(v, by) {
    v3.lerp(this.data, v.data, by, this.data);
    return this;
  }
  lerpV(v, by) {
    v3.lerpV(this.data, v.data, by.data, this.data);
    return this;
  }
  cross(v) {
    v3.cross(this.data, v.data, this.data);
    return this;
  }
  dist(v) {
    return v3.distance(this.data, v.data);
  }
  distSq(v) {
    return v3.distanceSq(this.data, v.data);
  }
  length() {
    return v3.length(this.data);
  }
  lengthSq() {
    return v3.lengthSq(this.data);
  }
  min(v) {
    v3.min(this.data, v.data, this.data);
    return this;
  }
  max(v) {
    v3.max(this.data, v.data, this.data);
    return this;
  }
  normalize() {
    v3.normalize(this.data, this.data);
    return this;
  }
  set(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  toString() {
    return `{x: ${this.x},y:${this.y},z:${this.z}}`;
  }
}