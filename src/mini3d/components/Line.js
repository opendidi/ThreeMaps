import {
  LineBasicMaterial,
  Mesh,
  Group,
  LineLoop,
  Vector3,
  BufferGeometry,
  CatmullRomCurve3,
  TubeGeometry,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { transfromMapGeoJSON, getBoundBox } from "@/mini3d";
import { geoMercator } from "d3-geo";

export class Line {
  /**
   *
   * @param {*} base this
   * @param {*} config
   */
  constructor({}, config = {}) {
    this.config = Object.assign(
      {
        visibelProvince: "",
        geoProjectionCenter: [0, 0],
        geoProjectionScale: 120,
        position: new Vector3(0, 0, 0),
        data: "",
        material: new LineBasicMaterial({ color: 0xffffff }),
        type: "LineLoop",
        renderOrder: 1,
        tubeRadius: 0.2,
      },
      config
    );

    let mapData = transfromMapGeoJSON(this.config.data);
    let lineGroup = this.create(mapData);
    this.lineGroup = lineGroup;

    this.lineGroup.position.copy(this.config.position);
  }
  geoProjection(args) {
    return geoMercator()
      .center(this.config.geoProjectionCenter)
      .scale(this.config.geoProjectionScale)
      .translate([0, 0])(args);
  }

  create(data) {
    const { type, visibelProvince } = this.config;
    let features = data.features;
    let lineGroup = new Group();
    for (let i = 0; i < features.length; i++) {
      const element = features[i];
      let group = new Group();
      group.name = "meshLineGroup" + i;
      if (element.properties.name === visibelProvince) {
        continue;
      }
      element.geometry.coordinates.forEach((coords) => {
        const points = [];
        let line = null;

        if (type === "Line2") {
          coords[0].forEach((item) => {
            const [x, y] = this.geoProjection(item);
            points.push(x, -y, 0);
          });
          line = this.createLine2(points);
        } else if (type === "Line3") {
          coords[0].forEach((item) => {
            const [x, y] = this.geoProjection(item);
            points.push(new Vector3(x, -y, 0));
          });
          line = this.createLine3(points);
        } else {
          coords[0].forEach((item) => {
            const [x, y] = this.geoProjection(item);
            points.push(new Vector3(x, -y, 0));
            line = this.createLine(points);
          });
        }
        // 将线条插入到组中
        group.add(line);
      });
      lineGroup.add(group);
    }
    return lineGroup;
  }
  createLine3(points) {
    const tubeRadius = this.config.tubeRadius;
    const tubeSegments = 256 * 10;
    const tubeRadialSegments = 4;
    const closed = false;

    const { material, renderOrder } = this.config;

    const curve = new CatmullRomCurve3(points);
    const tubeGeometry = new TubeGeometry(
      curve,
      tubeSegments,
      tubeRadius,
      tubeRadialSegments,
      closed
    );
    const line = new Mesh(tubeGeometry, material);
    line.name = "mapLine3";
    line.renderOrder = renderOrder;
    return line;
  }
  createLine2(points) {
    const { material, renderOrder } = this.config;
    const geometry = new LineGeometry();
    geometry.setPositions(points);
    let line = new Line2(geometry, material);
    line.name = "mapLine2";
    line.renderOrder = renderOrder;
    line.computeLineDistances();
    return line;
  }
  createLine(points) {
    const { material, renderOrder, type } = this.config;
    const geometry = new BufferGeometry();
    geometry.setFromPoints(points);
    let line = new LineLoop(geometry, material);
    line.renderOrder = renderOrder;
    line.name = "mapLine";
    return line;
  }

  setParent(parent) {
    parent.add(this.lineGroup);
  }
}
