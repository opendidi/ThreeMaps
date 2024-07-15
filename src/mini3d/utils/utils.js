import { Box3, Vector3 } from "three"
import pointInPolygon from "point-in-polygon"
export const isType = function (type, value) {
  return Object.prototype.toString.call(value) === `[object ${type}]`
}

export const isObject = function (value) {
  return isType("Object", value)
}
export const isArray = function (value) {
  return isType("Array", value)
}
export function uuid(len = 10, radix = 62) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")
  var uuid = [],
    i
  radix = radix || chars.length

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    var r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-"
    uuid[14] = "4"
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join("")
}

export function getBoundBox(group) {
  var size = new Vector3()
  var box3 = new Box3()
  box3.expandByObject(group)
  var boxSize = new Vector3()
  box3.getSize(boxSize)
  var center = new Vector3()
  box3.getCenter(center)
  let obj = {
    box3,
    boxSize,
    center,
  }
  if (group.geometry) {
    group.geometry.computeBoundingBox()
    group.geometry.computeBoundingSphere()
    const { max, min } = group.geometry.boundingBox
    size.x = max.x - min.x
    size.y = max.y - min.y
    size.z = max.z - min.z
    obj.size = size
  }
  return obj
}

export const transfromMapGeoJSON = (data) => {
  let worldData = JSON.parse(data)
  let features = worldData.features
  for (let i = 0; i < features.length; i++) {
    const element = features[i]
    if (["Polygon"].includes(element.geometry.type)) {
      element.geometry.coordinates = [element.geometry.coordinates]
    }
  }
  return worldData
}

export const transformGeoRoad = (roadData) => {
  let features = roadData.features
  for (let i = 0; i < features.length; i++) {
    const element = features[i]
    //LineString处理跟MultiLineString一样的数据结构
    if (element.geometry.type === "LineString") {
      element.geometry.coordinates = [[element.geometry.coordinates]]
    } else {
      element.geometry.coordinates = [element.geometry.coordinates]
    }
  }
  return roadData
}
export function deepClone(data) {
  let obj

  if (isArray(data)) {
    obj = []
  } else if (isObject(data)) {
    obj = {}
  } else {
    return data
  }

  if (isArray(data)) {
    for (let i = 0; i < data.length; i += 1) {
      obj.push(deepClone(data[i]))
    }
  } else if (isObject(data)) {
    Object.keys(data).forEach((key) => {
      obj[key] = deepClone(data[key])
    })
  }
  return obj
}

export function deepMerge(target, source) {
  target = deepClone(target)
  for (let key in source) {
    if (key in target) {
      if (isObject(source[key])) {
        if (!isObject(target[key])) {
          target[key] = source[key]
        } else {
          target[key] = deepMerge(target[key], source[key])
        }
      } else {
        target[key] = source[key]
      }
    } else {
      target[key] = source[key]
    }
  }
  return target
}

export function latLongToVector3(longitude, latitude, R = 100) {
  var lon = (longitude * Math.PI) / 180 //转弧度值
  var lat = (latitude * Math.PI) / 180 //转弧度值
  lon = -lon
  var x = R * Math.cos(lat) * Math.cos(lon)
  var y = R * Math.sin(lat)
  var z = R * Math.cos(lat) * Math.sin(lon)
  return {
    x: x,
    y: y,
    z: z,
  }
}

export const setMeshQuaternion = (mesh, lon, lat, R) => {
  const { x, y, z } = latLongToVector3(lon, lat, R)
  mesh.position.set(x, y, z)
  let meshVector = new Vector3(x, y, z).normalize()
  let normal = new Vector3(0, 0, 1)
  //.setFromUnitVectors();计算两个向量之间构成的四元数值
  mesh.quaternion.setFromUnitVectors(normal, meshVector)
  return mesh
}

export function findMinMax(arr) {
  let max = arr.reduce((a, b) => Math.max(a, b), Math.max(arr[0], arr[1]))
  let min = arr.reduce((a, b) => Math.min(a, b), Math.min(arr[0], arr[1]))
  return { max, min }
}
/**
 * 查找最小值
 * @param {*} data 
 * @param {*} getter 
 * @returns 
 * @example
 * let data = [
      {x: 0, y: 1, value: 3},
      {x: 10, y: 2, value: 13}
    ];  
    let min = minBy(data, o => o.x);
    console.log(min.x);

 */
export function minBy(data, getter) {
  let minItem = data[0]
  for (let i = 1; i < data.length; i++) {
    const item = data[i]
    if (getter(item) < getter(minItem)) {
      minItem = item
    }
  }
  return minItem
}
/**
 * 查找最大值
 * @param {*} data 
 * @param {*} getter 
 * @returns 
 * @example
 * let data = [
      {x: 0, y: 1, value: 3},
      {x: 10, y: 2, value: 13}
    ];  
    let max = maxBy(data, o => o.y);
    console.log(max.y);
 */
export function maxBy(data, getter) {
  let maxItem = data[0]
  for (let i = 1; i < data.length; i++) {
    const item = data[i]
    if (getter(item) > getter(maxItem)) {
      maxItem = item
    }
  }
  return maxItem
}

export const generateGrid = (coordinates, gap = 3) => {
  let coords = coordinates.map((item) => {
    return [item.x, item.y]
  })
  let minLon = Math.floor(
    minBy(coordinates, function (o) {
      return o.x
    }).x
  )
  let maxLon = Math.ceil(
    maxBy(coordinates, function (o) {
      return o.x
    }).x
  )
  let minLat = Math.floor(
    minBy(coordinates, function (o) {
      return o.y
    }).y
  )
  let maxLat = Math.ceil(
    maxBy(coordinates, function (o) {
      return o.y
    }).y
  )
  let lonScope = Math.ceil((maxLon - minLon) / gap)
  let latScope = Math.ceil((maxLat - minLat) / gap)
  let scopePoint = []
  for (let i = 0; i < lonScope + 1; i++) {
    let x = minLon + i * gap
    for (let j = 0; j < latScope + 1; j++) {
      let y = minLat + j * gap
      scopePoint.push([x, y])
    }
  }
  let scopeInsidePoint = scopePoint
    .filter((item) => {
      return pointInPolygon(item, coords)
    })
    .map((item) => {
      return new THREE.Vector3(item[0], item[1], 0)
    })
  return { scopeInsidePoint, scopePoint }
}
