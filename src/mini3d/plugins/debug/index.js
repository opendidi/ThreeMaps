import GUI from "three/examples/jsm/libs/lil-gui.module.min"
export class Debug {
  constructor(active = false) {
    this.active = active
    if (window.location.hash === "#debug") {
      this.active = true
    }
    if (this.active) {
      this.instance = new GUI()
      this.instance.close()
    }
  }
  update() {}
  destroy() {
    if (this.active) {
      this.instance.destroy()
    }
  }
}
