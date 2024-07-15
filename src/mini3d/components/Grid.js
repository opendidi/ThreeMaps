import {
  Mesh,
  DoubleSide,
  Vector2,
  Vector3,
  Shape,
  ShapeGeometry,
  MeshBasicMaterial,
  GridHelper,
  Group,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  AdditiveBlending,
  NormalBlending,
  MultiplyBlending,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { DiffuseShader } from "../shader/DiffuseShader";
export class Grid {
  constructor({ scene, time }, options) {
    this.scene = scene;
    this.time = time;
    this.instance = null;
    let defaultOptions = {
      position: new Vector3(0, 0, 0),
      gridSize: 100,
      gridDivision: 20,
      gridColor: 0x28373a,
      shapeSize: 1,
      shapeColor: 0x8e9b9e,
      pointSize: 0.2,
      pointColor: 0x28373a,
      pointLayout: {
        row: 200,
        col: 200,
      },
      pointBlending: NormalBlending,
    };
    this.options = Object.assign({}, defaultOptions, options);
    this.init();
  }
  init() {
    let group = new Group();
    group.name = "Grid";
    let grid = this.createGridHelp();
    let shapes = this.createShapes();
    let points = this.createPoint();
    group.add(grid, shapes, points);
    group.position.copy(this.options.position);
    this.instance = group;
    this.scene.add(group);
  }
  createShapes() {
    let { gridSize, gridDivision, shapeSize, shapeColor } = this.options;
    let shapeSpace = gridSize / gridDivision;
    let range = gridSize / 2;
    let shapeMaterial = new MeshBasicMaterial({
      color: shapeColor,
      side: DoubleSide,
    });
    let shapeGeometrys = [];
    for (let i = 0; i < gridDivision + 1; i++) {
      for (let j = 0; j < gridDivision + 1; j++) {
        let shapeGeometry = this.createPlus(shapeSize);
        shapeGeometry.translate(
          -range + i * shapeSpace,
          -range + j * shapeSpace,
          0
        );
        shapeGeometrys.push(shapeGeometry);
      }
    }
    let geometry = mergeGeometries(shapeGeometrys);
    let shapeMesh = new Mesh(geometry, shapeMaterial);
    shapeMesh.renderOrder = -1;
    shapeMesh.rotateX(-Math.PI / 2);
    shapeMesh.position.y += 0.01;
    return shapeMesh;
  }
  createGridHelp() {
    let { gridSize, gridDivision, gridColor } = this.options;
    let gridHelp = new GridHelper(gridSize, gridDivision, gridColor, gridColor);
    return gridHelp;
  }
  createPoint() {
    let { gridSize, pointSize, pointColor, pointBlending, pointLayout } =
      this.options;
    const rows = pointLayout.row;
    const cols = pointLayout.col;
    const positions = new Float32Array(rows * cols * 3);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let x = (i / (rows - 1)) * gridSize - gridSize / 2;
        let y = 0;
        let z = (j / (cols - 1)) * gridSize - gridSize / 2;
        let index = (i * cols + j) * 3;
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
      }
    }
    var geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    let material = new PointsMaterial({
      size: pointSize,
      sizeAttenuation: true,
      color: pointColor,
      blending: pointBlending,
    });
    const particles = new Points(geometry, material);

    return particles;
  }
  setPointMode() {}

  createPlus(shapeSize = 50) {
    let w = shapeSize / 6 / 3;
    let h = shapeSize / 3;
    let points = [
      new Vector2(-h, -w),
      new Vector2(-w, -w),
      new Vector2(-w, -h),
      new Vector2(w, -h),
      new Vector2(w, -h),
      new Vector2(w, -w),
      new Vector2(h, -w),
      new Vector2(h, w),
      new Vector2(w, w),
      new Vector2(w, h),
      new Vector2(-w, h),
      new Vector2(-w, w),
      new Vector2(-h, w),
    ];
    let shape = new Shape(points);
    let shapeGeometry = new ShapeGeometry(shape, 24);
    return shapeGeometry;
  }
}
