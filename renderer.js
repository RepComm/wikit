import { createBufferInfoFromArrays, createProgramInfo, setBuffersAndAttributes, setUniforms, m4, primitives, createVertexArrayInfo, resizeCanvasToDisplaySize, addExtensionsToContext, v3 } from "twgl.js";
import { Transform, Vector3 } from "./transform.js";
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
  get colors() {
    if (this.isOriginal) return this._colors;else return this.original._colors;
  }
  get arrays() {
    if (this.isOriginal) return this._arrays;else return this.original._arrays;
  }
  get bufferInfo() {
    if (this.isOriginal) return this._bufferInfo;else return this.original._bufferInfo;
  }
  get vertexArrayInfo() {
    if (this.isOriginal) return this._vertexArrayInfo;else return this.original._vertexArrayInfo;
  }
  get uniforms() {
    if (this.isOriginal) return this._uniforms;else return this.original._uniforms;
  }
  constructor(original) {
    this._original = original;
    this.transform = new Transform();
    this.color = new Float32Array([1, 1, 1]); //, 1]);

    this._max = 100;
    if (this.isOriginal) {
      this._all = new Set();
      this.all.add(this);

      //allocate space for the matrix data for all possible instances
      this._worldMatricies = new Float32Array(this.max * MAT4_FLOAT_COUNT); //matrixSize);

      //allocate space for color data for all possible instances
      this._colors = new Float32Array(this.max * COLOR_FLOAT_COUNT);
      this._arrays = primitives.createCubeVertices();
      Object.assign(this._arrays, {
        worldMatrix: {
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

  render(gl) {
    if (!this.isOriginal) return;
    if (this.shader.needsBuilt) this.shader.build(gl); //handle create/updates of shader

    if (!this._bufferInfo) {
      this._bufferInfo = createBufferInfoFromArrays(gl, this._arrays);
      this._vertexArrayInfo = createVertexArrayInfo(gl, this._shader.programInfo, this.bufferInfo);
    }

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

    //use underscores here because we already checked if we're the original, and speed purposes
    const programInfo = this._shader.programInfo;
    const vertexArrayInfo = this._vertexArrayInfo;
    const uniforms = this._uniforms;
    const numInstances = this._all.size;
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
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2");
    addExtensionsToContext(this.gl);
    this.time = Date.now();
    this.quadBrush = new InstanceableModel();
    this.quadBrush.shader = new Shader(`
    uniform mat4 u_viewProjection;

    attribute vec4 instanceColor;
    attribute mat4 instanceWorld;
    attribute vec4 position;
    attribute vec3 normal;

    varying vec4 v_position;
    varying vec3 v_normal;
    varying vec4 v_color;

    void main() {
      gl_Position = u_viewProjection * instanceWorld * position;
      v_color = instanceColor;
      v_normal = (instanceWorld * vec4(normal, 0)).xyz;
    }
    `, `
    precision mediump float;

    varying vec3 v_normal;
    varying vec4 v_color;

    uniform vec3 u_lightDir;

    void main() {
      vec3 a_normal = normalize(v_normal);
      float light = dot(u_lightDir, a_normal) * .5 + .5;
      gl_FragColor = vec4(v_color.rgb * light, v_color.a);
    }
    `);
    this.quadBrush.shader.build(this.gl);

    // for (let i=0; i<40; i++) {
    //   this.quadBrush
    //     .instance()
    //     .transform
    //     .setPos(Math.random()*2-1, Math.random()*2-1, 0);
    //     // .setEuler(0, Math.PI / 2, 0);
    // }

    function rand(min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return min + Math.random() * (max - min);
    }
    const max = 10000;
    let count = max;
    const matrixWorlds = new Float32Array(max * 16);
    const colors = [];
    const r = 100;
    for (let i = 0; i < max; ++i) {
      const mat = new Float32Array(matrixWorlds.buffer, i * 16 * 4, 16);
      m4.translation([rand(-r, r), rand(-r, r), rand(-r, r)], mat);
      let rz = rand(0, Math.PI * 2);
      let rx = rand(0, Math.PI * 2);
      m4.rotateZ(mat, rz, mat);
      m4.rotateX(mat, rx, mat);
      colors.push(rand(1), rand(1), rand(1));
    }
    const arrays = {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, 1, 1]
      },
      normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
      indices: [0, 1, 2, 2, 1, 3]
    };
    // console.log(JSON.stringify(arrays));

    Object.assign(arrays, {
      instanceWorld: {
        numComponents: 16,
        data: matrixWorlds,
        divisor: 1
      },
      instanceColor: {
        numComponents: 3,
        data: colors,
        divisor: 1
      }
    });
    const info = createBufferInfoFromArrays(this.gl, arrays);
    const vertexArrayInfo = createVertexArrayInfo(this.gl, this.quadBrush.shader.programInfo, info);
    const uniforms = {
      u_lightDir: v3.normalize([1, 8, -30])
    };
    this.model = {
      count,
      max,
      material: this.quadBrush.shader.programInfo,
      arrays,
      info,
      uniforms,
      vertexArrayInfo
    };
    this.renderCallback = time => {
      this.time = time;
      this.render();
      if (this.scheduleNextFrame) requestAnimationFrame(this.renderCallback);
    };
  }
  start() {
    this.scheduleNextFrame = true;
    requestAnimationFrame(this.renderCallback);
  }
  stop() {
    this.scheduleNextFrame = false;
  }
  render() {
    let gl = this.gl;
    let time = this.time / 10000;
    resizeCanvasToDisplaySize(this.canvas);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.5;
    const zFar = 500;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [0, 0, 1
    // Math.sin(speed) * radius, 
    // Math.sin(speed * .7) * 10, 
    // Math.cos(speed) * radius,
    ];

    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);
    const world = m4.rotationY(time);
    this.model.uniforms.u_viewProjection = viewProjection;
    gl.useProgram(this.model.material.program);
    setBuffersAndAttributes(gl, this.model.material, this.model.vertexArrayInfo);
    setUniforms(this.model.material, this.model.uniforms);
    this.model.count -= 10;
    if (this.model.count < 1) this.model.count = this.model.max;
    gl.drawElementsInstanced(gl.TRIANGLES, this.model.vertexArrayInfo.numElements, gl.UNSIGNED_SHORT, 0, this.model.count); //this.model.max);

    this.quadBrush.render(this.gl);
  }
}