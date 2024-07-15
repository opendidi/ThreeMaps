import { AxesHelper, Scene, Mesh } from "three";
import { EventEmitter, Sizes, Time } from "../utils";
import { Renderer } from "./Renderer";
import { Camera } from "./Camera";
import { geoMercator } from "d3-geo";
export class Mini3d extends EventEmitter {
  constructor(canvas, config = {}) {
    super();
    let defaultConfig = {
      isOrthographic: false,
    };
    this.config = Object.assign({}, defaultConfig, config);
    this.canvas = canvas;
    this.scene = new Scene();
    this.sizes = new Sizes(this);
    this.time = new Time(this);
    this.camera = new Camera(this, {
      isOrthographic: this.config.isOrthographic,
    });
    this.renderer = new Renderer(this);
    this.sizes.on("resize", () => {
      this.resize();
    });
    this.time.on("tick", (delta) => {
      this.update(delta);
    });
  }
  /**
   * 设置AxesHelper
   * @param {*} size 尺寸
   * @returns
   */
  setAxesHelper(size = 250) {
    if (!size) {
      return false;
    }
    let axes = new AxesHelper(size);
    this.scene.add(axes);
  }
  resize() {
    this.camera.resize();
    this.renderer.resize();
  }
  update(delta) {
    this.camera.update(delta);
    this.renderer.update(delta);
  }
  /**
   * 销毁
   */
  destroy() {
    this.sizes.destroy();
    this.time.destroy();
    this.camera.destroy();
    this.renderer.destroy();
    this.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
    this.canvas.parentNode.removeChild(this.canvas);
  }
}
