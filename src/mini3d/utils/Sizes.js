import { EventEmitter } from "./EventEmitter";
export class Sizes extends EventEmitter {
  constructor({ canvas }) {
    super();
    this.canvas = canvas;
    this.pixelRatio = 2;
    this.init();
    window.addEventListener("resize", () => {
      this.init();
      this.emit("resize");
    });
  }
  init() {
    this.width = this.canvas.parentNode.offsetWidth;
    this.height = this.canvas.parentNode.offsetHeight;
    this.pixelRatio = this.pixelRatio || Math.min(window.devicePixelRatio, 2);
  }
  destroy() {
    this.off("resize");
  }
}
