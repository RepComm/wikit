
import { dist, angle } from "../../code/math.js";
import { Brush, API } from "../../code/api.js";

/**@param {API} api*/
export default function onRegister (api) {
  api.registerBrush(new DefaultBrush());
}

class DefaultBrush extends Brush {
  constructor () {
    super("Default brush");
    //Distance between last and current points
    this.pointDist = 0;

    //Angle between last and current points
    this.angle = 0;

    //The perpendicular of angle
    this.perpendicular = 0;

    this.points = {
      bl:{x:0, y:0},
      br:{x:0, y:0},
      tl:{x:0, y:0},
      tr:{x:0, y:0}
    };
  }

  onStroke(x, y, lx, ly) {
    this.pointDist = dist(x, y, lx, ly);
    this.angle = angle(x, y, lx, ly);
    this.perpendicular = this.angle + Math.PI / 2;

    this.points.tl.x = x + (Math.cos(this.perpendicular) * Brush.width);
    this.points.tl.y = y + (Math.sin(this.perpendicular) * Brush.width);

    this.points.tr.x = x - (Math.cos(this.perpendicular) * Brush.width);
    this.points.tr.y = y - (Math.sin(this.perpendicular) * Brush.width);

    
  }
}


