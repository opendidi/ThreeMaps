import { Shape, BufferGeometry } from "three"

/**
 * 圆环线条几何体
 * @date 2023/9/6 - 10:29:22
 *
 * @export
 * @class CircleLineGeometry
 * @typedef {CircleLineGeometry}
 * @extends {BufferGeometry}
 */
export class CircleLineGeometry extends BufferGeometry {
  constructor(radius = 1, segmentCount = 32) {
    super()
    this.type = "CircleLineGeometry"
    this.parameters = { radius, segmentCount }
    // 创建shape
    let shape = new Shape()
    // 通过shape的arc函数，绘制圆环
    shape.arc(0, 0, radius, 0, 2 * Math.PI)
    // 获取还原的分段点
    let points = shape.getPoints(segmentCount)
    // 根据点设置几何体
    this.setFromPoints(points)
  }
}
