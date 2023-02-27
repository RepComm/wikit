
import { Transform } from "./transform.js";

export type Texture = undefined;

export type Scene = undefined;

export class Layer {
  icon: Texture;

  texture: Texture;

  scene: Scene;

  transform: Transform;

  constructor () {
    this.transform = new Transform();
  }

}
