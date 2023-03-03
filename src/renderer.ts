
import { Arrays, BufferInfo, createBufferInfoFromArrays, createProgramInfo, drawBufferInfo, ProgramInfo, setBuffersAndAttributes, setUniforms } from "twgl.js"
import { Transform } from "./transform.js";

export interface Uniforms {
  [key: string]: any;
}

export interface Model {
  arrays: Arrays;
  info: BufferInfo;
  material: ProgramInfo;
  uniforms: Uniforms;
}

export class InstanceableModel {
  private _original: InstanceableModel | undefined;

  get original() {
    if (this.isOriginal) return this;
    else return this._original;
  }

  private _count: number;

  get count() {
    if (this.isOriginal) return this._count;
    else return this._original._count;
  }

  private _max: number;

  get max() {
    if (this.isOriginal) return this._max;
    else return this._original._max;
  }

  private _all: Set<InstanceableModel>;
  get all() {
    if (this.isOriginal) return this._all;
    else return this._original._all;
  }

  isGarbage: boolean;

  transform: Transform;

  constructor(original?: InstanceableModel) {
    this._original = original;

    if (this.isOriginal) {
      this._count = 1;
      this._all = new Set();
    }

    this.transform = new Transform();
  }
  get isOriginal() {
    return this._original === undefined;
  }
  static onInstance(inst: InstanceableModel) {
    inst.all.add(inst);
    inst._original._count++;
  }
  static onDeinstance(inst: InstanceableModel) {
    inst.isGarbage = true;
    inst.all.delete(inst);
  }
  /**Returns a new instance, or null if instancing would create more than original.max instances*/
  instance(): InstanceableModel | null {
    let result: InstanceableModel;

    if (this.isOriginal) {
      if (this._count + 1 > this._max) return null;

      result = new InstanceableModel(this);

      InstanceableModel.onInstance(result);

      return result;
    } else {
      return this._original.instance();
    }
  }
  deinstance(): boolean {
    if (this.isOriginal) return false; // not possible
    InstanceableModel.onDeinstance(this);
    return true;
  }
}

export class Renderer {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;

  model: Model;

  quadBrush: InstanceableModel;

  time: number;
  renderCallback: FrameRequestCallback;
  scheduleNextFrame: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext("webgl2");

    this.time = Date.now();

    this.quadBrush = new InstanceableModel();

    this.quadBrush
      .instance()
      .transform
      .setPos(0, 0, 0)
      .setEuler(0, Math.PI / 2, 0);

    this.model = {
      material: createProgramInfo(this.gl, [`
      attribute vec4 position;

      void main() {
        gl_Position = position;
      }`, `
      precision mediump float;

      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        float color = 0.0;
        // lifted from glslsandbox.com
        color += sin( uv.x * cos( time / 3.0 ) * 60.0 ) + cos( uv.y * cos( time / 2.80 ) * 10.0 );
        color += sin( uv.y * sin( time / 2.0 ) * 40.0 ) + cos( uv.x * sin( time / 1.70 ) * 40.0 );
        color += sin( uv.x * sin( time / 1.0 ) * 10.0 ) + sin( uv.y * sin( time / 3.50 ) * 80.0 );
        color *= sin( time / 10.0 ) * 0.5;

        gl_FragColor = vec4( vec3( color * 0.5, sin( color + time / 2.5 ) * 0.75, color ), 1.0 );
      }
      `]),
      arrays: {
        position: [
          -1, -1, 0,
          1, -1, 0,
          -1, 1, 0,

          -1, 1, 0,
          1, -1, 0,
          1, 1, 0
        ]
      },
      info: undefined,
      uniforms: {
        time: this.time,
        resolution: [this.canvas.width, this.canvas.height]
      }
    };
    this.model.info = createBufferInfoFromArrays(this.gl, this.model.arrays);

    this.renderCallback = (time) => {
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
    // twgl.resizeCanvasToDisplaySize(gl.canvas);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.model.uniforms.time = this.time * 0.001;
    this.model.uniforms.resolution[0] = this.canvas.width;
    this.model.uniforms.resolution[1] = this.canvas.height;

    this.gl.useProgram(this.model.material.program);

    setBuffersAndAttributes(this.gl, this.model.material, this.model.info);
    setUniforms(this.model.material, this.model.uniforms);
    drawBufferInfo(this.gl, this.model.info);
  }
}
