
import { m4, v3 } from "twgl.js"

export class Vector3 {
  data: v3.Vec3;

  get x () {
    return this.data[0];
  }
  get y () {
    return this.data[1];
  }
  get z () {
    return this.data[2];
  }

  constructor (x: number = 0, y: number = 0, z: number = 0) {
    this.data = v3.create(x, y, z);
  }
  add (v: Vector3) {
    v3.add(this.data, v.data, this.data);
    return this;
  }
  sub (v: Vector3) {
    v3.subtract(this.data, v.data, this.data);
    return this;
  }
  mul (v: Vector3) {
    v3.multiply(this.data, v.data, this.data);
    return this;
  }
  mulScalar (v: number) {
    v3.mulScalar(this.data, v, this.data);
    return this;
  }
  div (v: Vector3) {
    v3.divide(this.data, v.data, this.data);
    return this;
  }
  divScalar (v: number) {
    v3.divScalar(this.data, v, this.data);
    return this;
  }
  dot (v: Vector3) {
    return v3.dot(this.data, v.data);
  }
  lerp (v: Vector3, by: number) {
    v3.lerp(this.data, v.data, by, this.data);
    return this;
  }
  lerpV (v: Vector3, by: Vector3) {
    v3.lerpV(this.data, v.data, by.data, this.data);
    return this;
  }
  cross (v: Vector3) {
    v3.cross(this.data, v.data, this.data);
    return this;
  }
  dist (v: Vector3) {
    return v3.distance(this.data, v.data);
  }
  distSq (v: Vector3) {
    return v3.distanceSq(this.data, v.data);
  }
  length () {
    return v3.length(this.data);
  }
  lengthSq () {
    return v3.lengthSq(this.data);
  }
  min (v: Vector3) {
    v3.min(this.data, v.data, this.data);
    return this;
  }
  max (v: Vector3) {
    v3.max(this.data, v.data, this.data);
    return this;
  }
  normalize () {
    v3.normalize(this.data, this.data);
    return this;
  }
}

export class Transform {
  position: Vector3;
  
  matrix: m4.Mat4;

  euler: Vector3;

  scale: Vector3;

  constructor () {
    this.matrix = m4.identity();
    this.position = new Vector3();
    this.euler = new Vector3();
    this.scale = new Vector3(1,1,1);
  }
  render () {
    m4.identity(this.matrix);
    m4.translate(this.matrix, this.position.data);
    m4.rotateX(this.matrix, this.euler.x);
    m4.rotateY(this.matrix, this.euler.y);
    m4.rotateZ(this.matrix, this.euler.z);
  }
}
