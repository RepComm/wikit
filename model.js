import { createBufferInfoFromArrays, createVertexArrayInfo, m4, setBuffersAndAttributes, setUniforms } from "twgl.js";
import { rand } from "./api.js";
import { Transform } from "./transform.js";
import { Vector3 } from "./vector.js";
const FLOAT_BYTE_COUNT = 4;
const MAT4_FLOAT_COUNT = 4 * 4; //4 by 4 matrix
const MAT4_BYTE_COUNT = MAT4_FLOAT_COUNT * FLOAT_BYTE_COUNT;
const COLOR_FLOAT_COUNT = 3; //RGB
const COLOR_BYTE_COUNT = COLOR_FLOAT_COUNT * FLOAT_BYTE_COUNT;
export class InstanceableModel {
  get original() {
    if (this.isOriginal) return this;else return this._original;
  }
  get shader() {
    if (this.isOriginal) return this._shader;else return this.original._shader;
  }
  set shader(s) {
    if (this.isOriginal) this._shader = s;else this.original._shader = s;
  }
  get count() {
    return this.all.size;
  }
  get max() {
    if (this.isOriginal) return this._max;else return this._original._max;
  }
  get all() {
    if (this.isOriginal) return this._all;else return this._original._all;
  }
  get worldMatricies() {
    if (this.isOriginal) return this._worldMatricies;else return this.original._worldMatricies;
  }

  // private _colors: Float32Array;

  get colors() {
    if (this.isOriginal) return this._colors;else return this.original._colors;
  }
  get arrays() {
    if (this.isOriginal) return this._arrays;else return this.original._arrays;
  }
  get bufferInfo() {
    if (this.isOriginal) return this._bufferInfo;else return this.original._bufferInfo;
  }
  get bufferInfoNeedsBuilt() {
    return this._bufferInfo === undefined || this._bufferInfoNeedsBuilt;
  }
  get vertexArrayInfo() {
    if (this.isOriginal) return this._vertexArrayInfo;else return this.original._vertexArrayInfo;
  }
  get uniforms() {
    if (this.isOriginal) return this._uniforms;else return this.original._uniforms;
  }
  constructor(original, max = 100) {
    this._original = original;
    this.transform = new Transform();
    this.color = new Float32Array([1, 1, 1]); //, 1]);

    this._max = max;
    if (this.isOriginal) {
      console.log("original", this);
      this._all = new Set();
      this.all.add(this);

      //allocate space for the matrix data for all possible instances
      this._worldMatricies = new Float32Array(this.max * MAT4_FLOAT_COUNT); //matrixSize);

      //allocate space for color data for all possible instances
      // this._colors = new Float32Array(this.max * COLOR_FLOAT_COUNT);
      this._colors = new Array(this.max * COLOR_FLOAT_COUNT);
      for (let i = 0; i < this.max; i++) {
        this._colors[0 + i * COLOR_FLOAT_COUNT] = rand(1);
        this._colors[1 + i * COLOR_FLOAT_COUNT] = rand(1);
        this._colors[2 + i * COLOR_FLOAT_COUNT] = rand(1);
        const mat = new Float32Array(this._worldMatricies.buffer, i * 16 * 4, 16);
        let r = 100;
        m4.translation([rand(-r, r), rand(-r, r), rand(-r, r)], mat);
        let rz = rand(0, Math.PI * 2);
        let rx = rand(0, Math.PI * 2);
        m4.rotateZ(mat, rz, mat);
        m4.rotateX(mat, rx, mat);
      }
      this._arrays = {
        position: {
          numComponents: 2,
          data: [-1, -1, 1, -1, -1, 1, 1, 1]
        },
        normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
        indices: [0, 1, 2, 2, 1, 3]
      };
      Object.assign(this._arrays, {
        instanceWorld: {
          //as appears in shader
          numComponents: 16,
          data: this._worldMatricies,
          divisor: 1
        },
        instanceColor: {
          numComponents: 3,
          data: this._colors,
          divisor: 1
        }
      });
      this._uniforms = {
        // u_viewProjection: undefined,
        u_lightDir: new Vector3(1, 8, -30).normalize().data
      };
    }
  }
  copyColorToBuffer(buffer, offset = 0) {
    buffer[0 + offset] = this.color[0];
    buffer[1 + offset] = this.color[1];
    buffer[2 + offset] = this.color[2];
    // buffer[ 3 + offset] = this.color[3];
  }

  updateAllInstances() {
    //high level info to low level buffers
    let i = 0;
    for (let inst of this.all) {
      inst.transform.render(); //conver transform to matrix

      const matFloatOffset = i * MAT4_FLOAT_COUNT;
      inst.transform.copyMatrixToBuffer(this._worldMatricies, matFloatOffset); //output matrix to instanced data

      const colorFloatOffset = i * COLOR_FLOAT_COUNT;
      inst.copyColorToBuffer(this._colors, colorFloatOffset);
      i++;
    }

    // Object.assign(this._arrays, {
    //   instanceWorld: { //as appears in shader
    //     numComponents: 16,
    //     data: this._worldMatricies,
    //     divisor: 1,
    //   },
    //   instanceColor: {
    //     numComponents: 3,
    //     data: this._colors,
    //     divisor: 1,
    //   },
    // });

    this._bufferInfoNeedsBuilt = true;
  }
  render(gl, u_viewProjection) {
    if (!this.isOriginal) return;
    if (this.shader.needsBuilt) this.shader.build(gl); //handle create/updates of shader

    if (this.bufferInfoNeedsBuilt) {
      this._bufferInfo = createBufferInfoFromArrays(gl, this._arrays, this._bufferInfo); //pass in original buffer info if present, undefined is ignored
      this._vertexArrayInfo = createVertexArrayInfo(gl, this._shader.programInfo, this.bufferInfo);
      console.log("Created buffer info and vertex info", this);
      this._bufferInfoNeedsBuilt = false;
    }

    //use underscores here because we already checked if we're the original, and speed purposes
    const programInfo = this._shader.programInfo;
    const vertexArrayInfo = this._vertexArrayInfo;
    const uniforms = this._uniforms;
    const numInstances = this._all.size;
    uniforms.u_viewProjection = u_viewProjection.data;
    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, vertexArrayInfo);
    setUniforms(programInfo, uniforms);

    //actual perform the drawing, passing in the total number of elements we have allocated, and the number of instances we wish to draw
    gl.drawElementsInstanced(gl.TRIANGLES, vertexArrayInfo.numElements, gl.UNSIGNED_SHORT, 0, numInstances);
  }
  get isOriginal() {
    return this._original === undefined;
  }
  static onInstance(inst) {
    inst.all.add(inst);

    //twgl.js specific code here

    //end twgl.js specific code
  }

  static onDeinstance(inst) {
    inst.isGarbage = true;
    inst.all.delete(inst);
  }
  /**Returns a new instance, or null if instancing would create more than original.max instances*/
  instance() {
    let result;
    if (this.isOriginal) {
      if (this.count + 1 > this.max) return null;
      result = new InstanceableModel(this);
      InstanceableModel.onInstance(result);
      return result;
    } else {
      return this._original.instance();
    }
  }
  deinstance() {
    if (this.isOriginal) return false; // not possible
    InstanceableModel.onDeinstance(this);
    return true;
  }
}