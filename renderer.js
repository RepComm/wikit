import { addExtensionsToContext, createBufferInfoFromArrays, createVertexArrayInfo, m4, resizeCanvasToDisplaySize, v3 } from "twgl.js";
import { rand } from "./api.js";
import { Camera } from "./camera.js";
import { InstanceableModel } from "./model.js";
import { Shader } from "./shader.js";
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2");
    addExtensionsToContext(this.gl);
    this.camera = new Camera();
    this.time = Date.now();
    this.quadBrush = new InstanceableModel(undefined, 1000);
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
      gl_FragColor = v_color;
      // gl_FragColor = vec4(v_color.rgb * light, v_color.a);
    }
    `);
    this.quadBrush.shader.build(this.gl);
    for (let i = 0; i < this.quadBrush.max - 1; i++) {
      let splat = this.quadBrush.instance();
      splat.color[0] = rand(1);
      splat.color[1] = rand(1);
      splat.color[2] = rand(1);
      splat.transform.setPos(rand(-50, 50), rand(-50, 50), rand(-50, 50)).setEuler(rand(-Math.PI, Math.PI), rand(-Math.PI, Math.PI), rand(-Math.PI, Math.PI)).setScale(rand(1, 4), rand(1, 4), rand(1, 4));
    }
    setTimeout(() => {
      console.log("update brush models");
      this.quadBrush.updateAllInstances();
    }, 5000);
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
    this.camera.perspectiveSettings.aspectRatio = gl.canvas.width / gl.canvas.height;
    this.camera.transform.position.z = Math.sin(time) * 10;
    this.camera.render();
    this.model.uniforms.u_viewProjection = this.camera.viewProjectionMatrix.data;

    // gl.useProgram(this.model.material.program);
    // setBuffersAndAttributes(gl, this.model.material, this.model.vertexArrayInfo);
    // setUniforms(this.model.material, this.model.uniforms);

    // this.model.count -= 10;
    // if (this.model.count < 1) this.model.count = this.model.max;

    // gl.drawElementsInstanced(gl.TRIANGLES, this.model.vertexArrayInfo.numElements, gl.UNSIGNED_SHORT, 0, this.model.count);//this.model.max);

    this.quadBrush.render(this.gl, this.camera.viewProjectionMatrix);
  }
}