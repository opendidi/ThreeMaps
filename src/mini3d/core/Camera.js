import { PerspectiveCamera, OrthographicCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export class Camera {
  constructor({ sizes, scene, canvas }, options = { isOrthographic: false }) {
    this.sizes = sizes;
    this.scene = scene;
    this.canvas = canvas;
    this.options = Object.assign({ isOrthographic: false }, options);
    this.setInstance();
  }
  setInstance() {
    this.instance = null;
    this.setCamera(this.options.isOrthographic);

    this.instance.position.set(10, 10, 10);

    this.scene.add(this.instance);
  }
  /**
   * 设置当前相机
   * @param {*} isOrthographic true 默认正交相机，false 透视相机
   */
  setCamera(isOrthographic = true) {
    let aspect = this.sizes.width / this.sizes.height;
    if (isOrthographic) {
      let s = 120;
      this.instance = new OrthographicCamera(
        -s * aspect,
        s * aspect,
        s,
        -s,
        1,
        10000
      );
    } else {
      // 透视相机
      this.instance = new PerspectiveCamera(45, aspect, 1, 10000);
    }
    this.setControls();
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.update();
  }
  resize() {
    let aspect = this.sizes.width / this.sizes.height;
    if (this.options.isOrthographic) {
      let s = 120;
      this.instance.left = -s * aspect;
      this.instance.right = s * aspect;
      this.instance.top = s;
      this.instance.bottom = -s;
    } else {
      this.instance.aspect = aspect;
    }
    this.instance.updateProjectionMatrix();
  }
  update() {
    this.controls.update();
  }
  destroy() {
    this.controls.dispose();
  }
}
