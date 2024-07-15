import {
  Fog,
  Group,
  MeshBasicMaterial,
  DirectionalLight,
  AmbientLight,
  PointLight,
  Vector3,
  MeshLambertMaterial,
  LineBasicMaterial,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
  VideoTexture,
  NearestFilter,
  BoxGeometry,
  TubeGeometry,
  QuadraticBezierCurve3,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  CustomBlending,
  AddEquation,
  DstColorFactor,
  OneFactor,
} from "three"
import {
  Mini3d,
  ExtrudeMap,
  BaseMap,
  Line,
  Grid,
  Label3d,
  Plane,
  Particles,
  GradientShader,
  DiffuseShader,
  Focus,
} from "@/mini3d"

import { geoMercator } from "d3-geo"
import labelIcon from "@/assets/texture/label-icon.png"
import chinaData from "./map/chinaData"
import provincesData from "./map/provincesData"
import scatterData from "./map/scatter"
import infoData from "./map/infoData"
import gsap from "gsap"
import emitter from "@/utils/emitter"
import { InteractionManager } from "three.interactive"
function sortByValue(data) {
  data.sort((a, b) => b.value - a.value)
  return data
}
export class World extends Mini3d {
  constructor(canvas, assets) {
    super(canvas)
    // 中心坐标
    this.geoProjectionCenter = [113.280637, 23.125178]
    // 缩放比例
    this.geoProjectionScale = 120
    // 飞线中心
    this.flyLineCenter = [113.544372, 23.329249]
    // 地图拉伸高度
    this.depth = 0.5
    this.mapFocusLabelInfo = {
      name: "广东省",
      enName: "GUANGDONG PROVINCE",
      center: [113.280637, 20.625178],
    }
    // 是否点击
    this.clicked = false
    // 雾
    this.scene.fog = new Fog(0x102736, 1, 50)
    // 背景
    this.scene.background = new Color(0x102736)

    // 相机初始位置
    this.camera.instance.position.set(-13.767695123014105, 12.990152163077308, 39.28228164159694)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()
    // 创建交互管理
    this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)

    this.assets = assets
    // 创建环境光
    this.initEnvironment()
    this.init()
  }
  init() {
    // 标签组
    this.labelGroup = new Group()
    this.label3d = new Label3d(this)
    this.labelGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.labelGroup)
    // 飞线焦点光圈组
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.flyLineFocusGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.flyLineFocusGroup)
    // 区域事件元素
    this.eventElement = []
    // 鼠标移上移除的材质
    this.defaultMaterial = null // 默认材质
    this.defaultLightMaterial = null // 高亮材质
    // 创建底部高亮
    this.createBottomBg()
    // 模糊边线
    this.createChinaBlurLine()

    // 扩散网格
    this.createGrid()
    // 旋转圆环
    this.createRotateBorder()
    // 创建标签
    this.createLabel()
    // 创建地图
    this.createMap()
    // 添加事件
    this.createEvent()
    // 创建飞线
    this.createFlyLine()
    // 创建飞线焦点
    this.createFocus()
    // 创建粒子
    this.createParticles()
    // 创建散点图
    this.createScatter()
    // 创建信息点
    this.createInfoPoint()
    // 创建轮廓
    this.createStorke()
    // this.time.on("tick", () => {
    //   console.log(this.camera.instance.position);
    // });
    // 创建动画时间线
    let tl = gsap.timeline({
      onComplete: () => {},
    })
    tl.pause()
    this.animateTl = tl
    tl.addLabel("focusMap", 1.5)
    tl.addLabel("focusMapOpacity", 2)
    tl.addLabel("bar", 3)
    tl.to(this.camera.instance.position, {
      duration: 2,
      x: -0.17427287762525134,
      y: 13.678992786206543,
      z: 20.688611202093714,
      ease: "circ.out",
      onStart: () => {
        this.flyLineFocusGroup.visible = false
      },
    })
    tl.to(
      this.focusMapGroup.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      },
      "focusMap"
    )

    tl.to(
      this.focusMapGroup.scale,
      {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.flyLineGroup.visible = true
          this.scatterGroup.visible = true
          this.InfoPointGroup.visible = true
          this.createInfoPointLabelLoop()
        },
      },
      "focusMap"
    )

    tl.to(
      this.focusMapTopMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.focusMapSideMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
        onComplete: () => {
          this.focusMapSideMaterial.transparent = false
        },
      },
      "focusMapOpacity"
    )
    this.otherLabel.map((item, index) => {
      let element = item.element.querySelector(".other-label")
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.1 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "focusMapOpacity"
      )
    })
    tl.to(
      this.mapLineMaterial,
      {
        duration: 0.5,
        delay: 0.3,
        opacity: 1,
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder1.scale,
      {
        delay: 0.3,
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder2.scale,
      {
        duration: 1,
        delay: 0.5,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.flyLineFocusGroup.visible = true
          emitter.$emit("mapPlayComplete")
        },
      },
      "focusMapOpacity"
    )
    this.allBar.map((item, index) => {
      if (item.userData.name === "广州市") {
        return false
      }
      tl.to(
        item.scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
    this.allBarMaterial.map((item, index) => {
      tl.to(
        item,
        {
          duration: 1,
          delay: 0.1 * index,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })

    this.allProvinceLabel.map((item, index) => {
      let element = item.element.querySelector(".provinces-label-wrap")
      let number = item.element.querySelector(".number .value")
      let numberVal = Number(number.innerText)
      let numberAnimate = {
        score: 0,
      }
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.2 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
      tl.to(
        numberAnimate,
        {
          duration: 1,
          delay: 0.2 * index,
          score: numberVal,
          onUpdate: showScore,
        },
        "bar"
      )
      function showScore() {
        number.innerText = numberAnimate.score.toFixed(0)
      }
    })
    this.allGuangquan.map((item, index) => {
      tl.to(
        item.children[0].scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
      tl.to(
        item.children[1].scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
  }

  initEnvironment() {
    let sun = new AmbientLight(0xffffff, 5)
    this.scene.add(sun)
    let directionalLight = new DirectionalLight(0xffffff, 5)
    directionalLight.position.set(-30, 6, -8)
    directionalLight.castShadow = true
    directionalLight.shadow.radius = 20
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    this.scene.add(directionalLight)
    this.createPointLight({
      color: "#1d5e5e",
      intensity: 800,
      distance: 10000,
      x: -9,
      y: 3,
      z: -3,
    })
    this.createPointLight({
      color: "#1d5e5e",
      intensity: 200,
      distance: 10000,
      x: 0,
      y: 2,
      z: 5,
    })
  }
  createPointLight(pointParams) {
    const pointLight = new PointLight(0x1d5e5e, pointParams.intensity, pointParams.distance)
    pointLight.position.set(pointParams.x, pointParams.y, pointParams.z)
    this.scene.add(pointLight)
  }
  createMap() {
    let mapGroup = new Group()
    let focusMapGroup = new Group()
    this.focusMapGroup = focusMapGroup
    let { china, chinaTopLine } = this.createChina()
    let { map, mapTop, mapLine } = this.createProvince()
    china.setParent(mapGroup)
    chinaTopLine.setParent(mapGroup)
    // 创建扩散
    this.createDiffuse()
    map.setParent(focusMapGroup)
    mapTop.setParent(focusMapGroup)
    mapLine.setParent(focusMapGroup)
    focusMapGroup.position.set(0, 0, -0.01)
    focusMapGroup.scale.set(1, 1, 0)
    mapGroup.add(focusMapGroup)
    mapGroup.rotation.x = -Math.PI / 2
    mapGroup.position.set(0, 0.2, 0)
    this.scene.add(mapGroup)
    this.createBar()
  }
  createChina() {
    let params = {
      chinaBgMaterialColor: "#152c47",
      lineColor: "#3f82cd",
    }
    let chinaData = this.assets.instance.getResource("china")
    let chinaBgMaterial = new MeshLambertMaterial({
      color: new Color(params.chinaBgMaterialColor),
      transparent: true,
      opacity: 1,
    })
    let china = new BaseMap(this, {
      //position: new Vector3(0, 0, -0.03),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      merge: true,
      material: chinaBgMaterial,
      renderOrder: 2,
    })
    let chinaTopLineMaterial = new LineBasicMaterial({
      color: params.lineColor,
    })
    let chinaTopLine = new Line(this, {
      // position: new Vector3(0, 0, -0.02),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      material: chinaTopLineMaterial,
      renderOrder: 3,
    })
    chinaTopLine.lineGroup.position.z += 0.01
    return { china, chinaTopLine }
  }
  createProvince() {
    let mapJsonData = this.assets.instance.getResource("mapJson")
    let [topMaterial, sideMaterial] = this.createProvinceMaterial()
    this.focusMapTopMaterial = topMaterial
    this.focusMapSideMaterial = sideMaterial
    let map = new ExtrudeMap(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, 0.11),
      data: mapJsonData,
      depth: this.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      renderOrder: 9,
    })
    let faceMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      // fog: false,
    })
    let faceGradientShader = new GradientShader(faceMaterial, {
      // uColor1: 0x2a6e92,
      // uColor2: 0x102736,
      uColor1: 0x12bbe0,
      uColor2: 0x0094b5,
    })
    this.defaultMaterial = faceMaterial
    this.defaultLightMaterial = this.defaultMaterial.clone()
    this.defaultLightMaterial.color = new Color("rgba(115,208,255,1)")
    this.defaultLightMaterial.opacity = 0.8
    // this.defaultLightMaterial.emissive.setHex(new Color("rgba(115,208,255,1)"));
    // this.defaultLightMaterial.emissiveIntensity = 3.5;
    let mapTop = new BaseMap(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.22),
      data: mapJsonData,
      material: faceMaterial,
      renderOrder: 2,
    })
    mapTop.mapGroup.children.map((group) => {
      group.children.map((mesh) => {
        if (mesh.type === "Mesh") {
          this.eventElement.push(mesh)
        }
      })
    })
    this.mapLineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
      fog: false,
    })
    let mapLine = new Line(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      data: mapJsonData,
      material: this.mapLineMaterial,
      renderOrder: 3,
    })
    mapLine.lineGroup.position.z += this.depth + 0.23
    return {
      map,
      mapTop,
      mapLine,
    }
  }
  createProvinceMaterial() {
    let topMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      fog: false,
      side: DoubleSide,
    })
    topMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(0x2a6e92) }, // 419daa
        uColor2: { value: new Color(0x102736) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.x/15.78);       
      outgoingLight = outgoingLight*gradient;
      float topAlpha = 0.5;
      if(vPosition.z>0.3){
        diffuseColor.a *= topAlpha;
      }
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    let sideMap = this.assets.instance.getResource("side")
    sideMap.wrapS = RepeatWrapping
    sideMap.wrapT = RepeatWrapping
    sideMap.repeat.set(1, 1.5)
    sideMap.offset.y += 0.065
    let sideMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: sideMap,
      fog: false,
      opacity: 0,
      side: DoubleSide,
    })
    this.time.on("tick", () => {
      sideMap.offset.y += 0.005
    })
    sideMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(0x2a6e92) },
        uColor2: { value: new Color(0x2a6e92) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.z/1.2);
      outgoingLight = outgoingLight*gradient;
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    return [topMaterial, sideMaterial]
  }
  createBar() {
    let self = this
    let data = sortByValue(provincesData).filter((item, index) => index < 7)
    const barGroup = new Group()
    this.barGroup = barGroup
    const factor = 0.7
    const height = 4.0 * factor
    const max = data[0].value
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    data.map((item, index) => {
      let geoHeight = height * (item.value / max)
      let material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
        fog: false,
      })
      new GradientShader(material, {
        uColor1: index > 3 ? 0xfbdf88 : 0x50bbfe,
        uColor2: index > 3 ? 0xfffef4 : 0x77fbf5,
        size: geoHeight,
        dir: "y",
      })
      const geo = new BoxGeometry(0.1 * factor, 0.1 * factor, geoHeight)
      geo.translate(0, 0, geoHeight / 2)
      const mesh = new Mesh(geo, material)
      mesh.renderOrder = 5
      let areaBar = mesh
      let [x, y] = this.geoProjection(item.centroid)
      areaBar.position.set(x, -y, this.depth + 0.45)
      areaBar.scale.set(1, 1, 0)
      areaBar.userData = { ...item }
      let guangQuan = this.createQuan(new Vector3(x, this.depth + 0.44, y), index)
      let hg = this.createHUIGUANG(geoHeight, index > 3 ? 0xfffef4 : 0x77fbf5)
      areaBar.add(...hg)
      barGroup.add(areaBar)
      barGroup.rotation.x = -Math.PI / 2
      let barLabel = labelStyle04(item, index, new Vector3(x, -y, this.depth + 1.1 + geoHeight))
      this.allBar.push(areaBar)
      this.allBarMaterial.push(material)
      this.allGuangquan.push(guangQuan)
      this.allProvinceLabel.push(barLabel)
    })
    this.scene.add(barGroup)
    function labelStyle04(data, index, position) {
      let label = self.label3d.create("", "provinces-label", false)
      label.init(
        `<div class="provinces-label ${index > 4 ? "yellow" : ""}">
      <div class="provinces-label-wrap">
        <div class="number"><span class="value">${data.value}</span><span class="unit">万人</span></div>
        <div class="name">
          <span class="zh">${data.name}</span>
          <span class="en">${data.enName.toUpperCase()}</span>
        </div>
        <div class="no">${index + 1}</div>
      </div>
    </div>`,
        position
      )
      self.label3d.setLabelStyle(label, 0.01, "x")
      label.setParent(self.labelGroup)
      return label
    }
  }
  createEvent() {
    let objectsHover = []
    const reset = (mesh) => {
      mesh.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultMaterial
        }
      })
    }
    const move = (mesh) => {
      mesh.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = this.defaultLightMaterial
        }
      })
    }
    this.eventElement.map((mesh) => {
      this.interactionManager.add(mesh)
      mesh.addEventListener("mousedown", (ev) => {
        console.log(ev.target.userData.name)
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!objectsHover.includes(event.target.parent)) {
          objectsHover.push(event.target.parent)
        }
        document.body.style.cursor = "pointer"
        move(event.target.parent)
      })
      mesh.addEventListener("mouseout", (event) => {
        objectsHover = objectsHover.filter((n) => n.userData.name !== event.target.parent.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }
        reset(event.target.parent)
        document.body.style.cursor = "default"
      })
    })
  }
  createHUIGUANG(h, color) {
    let geometry = new PlaneGeometry(0.35, h)
    geometry.translate(0, h / 2, 0)
    const texture = this.assets.instance.getResource("huiguang")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    let material = new MeshBasicMaterial({
      color: color,
      map: texture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 10
    mesh.rotateX(Math.PI / 2)
    let mesh2 = mesh.clone()
    let mesh3 = mesh.clone()
    mesh2.rotateY((Math.PI / 180) * 60)
    mesh3.rotateY((Math.PI / 180) * 120)
    return [mesh, mesh2, mesh3]
  }
  createQuan(position, index) {
    const guangquan1 = this.assets.instance.getResource("guangquan1")
    const guangquan2 = this.assets.instance.getResource("guangquan2")
    let geometry = new PlaneGeometry(0.5, 0.5)
    let material1 = new MeshBasicMaterial({
      color: 0xffffff,
      map: guangquan1,
      alphaMap: guangquan1,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let material2 = new MeshBasicMaterial({
      color: 0xffffff,
      map: guangquan2,
      alphaMap: guangquan2,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let mesh1 = new Mesh(geometry, material1)
    let mesh2 = new Mesh(geometry, material2)
    mesh1.renderOrder = 6
    mesh2.renderOrder = 6
    mesh1.rotateX(-Math.PI / 2)
    mesh2.rotateX(-Math.PI / 2)
    mesh1.position.copy(position)
    mesh2.position.copy(position)
    mesh2.position.y -= 0.001
    mesh1.scale.set(0, 0, 0)
    mesh2.scale.set(0, 0, 0)
    this.quanGroup = new Group()
    this.quanGroup.add(mesh1, mesh2)
    this.scene.add(this.quanGroup)
    this.time.on("tick", () => {
      mesh1.rotation.z += 0.05
    })
    return this.quanGroup
  }
  // 创建扩散
  createDiffuse() {
    let geometry = new PlaneGeometry(200, 200)
    let material = new MeshBasicMaterial({
      color: 0x000000,
      depthWrite: false,
      // depthTest: false,
      transparent: true,
      blending: CustomBlending,
    })
    // 使用CustomBlending  实现混合叠加
    material.blendEquation = AddEquation
    material.blendSrc = DstColorFactor
    material.blendDst = OneFactor
    let diffuse = new DiffuseShader({
      material,
      time: this.time,
      size: 60,
      diffuseSpeed: 8.0,
      diffuseColor: 0x71918e,
      diffuseWidth: 2.0,
      callback: (pointShader) => {
        setTimeout(() => {
          gsap.to(pointShader.uniforms.uTime, {
            value: 4,
            repeat: -1,
            duration: 6,
            ease: "power1.easeIn",
          })
        }, 3)
      },
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 3
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, 0.21, 0)
    this.scene.add(mesh)
  }
  createGrid() {
    new Grid(this, {
      gridSize: 50,
      gridDivision: 20,
      gridColor: 0x1b4b70,
      shapeSize: 0.5,
      shapeColor: 0x2a5f8a,
      pointSize: 0.1,
      pointColor: 0x154d7d,
    })
  }
  createBottomBg() {
    let geometry = new PlaneGeometry(20, 20)
    const texture = this.assets.instance.getResource("ocean")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      opacity: 1,
      fog: false,
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, -0.7, 0)
    this.scene.add(mesh)
  }
  createChinaBlurLine() {
    let geometry = new PlaneGeometry(147, 147)
    const texture = this.assets.instance.getResource("chinaBlurLine")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.generateMipmaps = false
    texture.minFilter = NearestFilter
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      color: 0x3f82cd,
      alphaMap: texture,
      transparent: true,
      opacity: 0.5,
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.set(-19.3, -0.5, -19.7)
    this.scene.add(mesh)
  }

  createLabel() {
    let self = this
    let labelGroup = this.labelGroup
    let label3d = this.label3d
    let otherLabel = []
    chinaData.map((province) => {
      if (province.hide == true) return false
      let label = labelStyle01(province, label3d, labelGroup)
      otherLabel.push(label)
    })
    let mapFocusLabel = labelStyle02(
      {
        ...this.mapFocusLabelInfo,
      },
      label3d,
      labelGroup
    )
    let iconLabel1 = labelStyle03(
      {
        icon: labelIcon,
        center: [118.280637, 21.625178],
        width: "40px",
        height: "40px",
        reflect: true,
      },
      label3d,
      labelGroup
    )
    let iconLabel2 = labelStyle03(
      {
        icon: labelIcon,
        center: [106.280637, 25.625178],
        width: "20px",
        height: "20px",
        reflect: false,
      },
      label3d,
      labelGroup
    )
    otherLabel.push(mapFocusLabel)
    otherLabel.push(iconLabel1)
    otherLabel.push(iconLabel2)
    this.otherLabel = otherLabel
    function labelStyle01(province, label3d, labelGroup) {
      let label = label3d.create("", `china-label ${province.blur ? " blur" : ""}`, false)
      const [x, y] = self.geoProjection(province.center)
      label.init(
        `<div class="other-label"><img class="label-icon" src="${labelIcon}">${province.name}</div>`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle02(province, label3d, labelGroup) {
      let label = label3d.create("", "map-label", false)
      const [x, y] = self.geoProjection(province.center)
      label.init(
        `<div class="other-label"><span>${province.name}</span><span>${province.enName}</span></div>`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.015, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle03(data, label3d, labelGroup) {
      let label = label3d.create("", `decoration-label  ${data.reflect ? " reflect" : ""}`, false)
      const [x, y] = self.geoProjection(data.center)
      label.init(
        `<div class="other-label"><img class="label-icon" style="width:${data.width};height:${data.height}" src="${data.icon}">`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
    function labelStyle04(data, label3d, labelGroup, index) {
      let label = label3d.create("", "provinces-label", false)
      const [x, y] = self.geoProjection(data.center)
      label.init(
        `<div class="provinces-label">
      <div class="provinces-label-wrap">
        <div class="number">${data.value}<span>万人</span></div>
        <div class="name">
          <span class="zh">${data.name}</span>
          <span class="en">${data.enName.toUpperCase()}</span>
        </div>
        <div class="no">${index + 1}</div>
      </div>
    </div>`,
        new Vector3(x, -y, 2.4)
      )
      label3d.setLabelStyle(label, 0.02, "x")
      label.setParent(labelGroup)
      return label
    }
  }
  createRotateBorder() {
    let max = 12
    let rotationBorder1 = this.assets.instance.getResource("rotationBorder1")
    let rotationBorder2 = this.assets.instance.getResource("rotationBorder2")
    let plane01 = new Plane(this, {
      width: max * 1.178,
      needRotate: true,
      rotateSpeed: 0.001,
      material: new MeshBasicMaterial({
        map: rotationBorder1,
        color: 0x48afff,
        transparent: true,
        opacity: 0.2,
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(0, 0.28, 0),
    })
    plane01.instance.rotation.x = -Math.PI / 2
    plane01.instance.renderOrder = 6
    plane01.instance.scale.set(0, 0, 0)
    plane01.setParent(this.scene)
    let plane02 = new Plane(this, {
      width: max * 1.116,
      needRotate: true,
      rotateSpeed: -0.004,
      material: new MeshBasicMaterial({
        map: rotationBorder2,
        color: 0x48afff,
        transparent: true,
        opacity: 0.4,
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(0, 0.3, 0),
    })
    plane02.instance.rotation.x = -Math.PI / 2
    plane02.instance.renderOrder = 6
    plane02.instance.scale.set(0, 0, 0)
    plane02.setParent(this.scene)
    this.rotateBorder1 = plane01.instance
    this.rotateBorder2 = plane02.instance
  }
  createFlyLine() {
    this.flyLineGroup = new Group()
    this.flyLineGroup.visible = false
    this.scene.add(this.flyLineGroup)
    const texture = this.assets.instance.getResource("mapFlyline")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(0.5, 2)
    const tubeRadius = 0.1
    const tubeSegments = 32
    const tubeRadialSegments = 2
    const closed = false
    let [centerX, centerY] = this.geoProjection(this.flyLineCenter)
    let centerPoint = new Vector3(centerX, -centerY, 0)
    const material = new MeshBasicMaterial({
      map: texture,
      // alphaMap: texture,
      color: 0x2a6f72,
      transparent: true,
      fog: false,
      opacity: 1,
      depthTest: false,
      blending: AdditiveBlending,
    })
    this.time.on("tick", () => {
      texture.offset.x -= 0.006
    })
    provincesData
      .filter((item, index) => index < 7)
      .map((city) => {
        let [x, y] = this.geoProjection(city.centroid)
        let point = new Vector3(x, -y, 0)
        const center = new Vector3()
        center.addVectors(centerPoint, point).multiplyScalar(0.5)
        center.setZ(3)
        const curve = new QuadraticBezierCurve3(centerPoint, center, point)
        const tubeGeometry = new TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, closed)
        const mesh = new Mesh(tubeGeometry, material)
        mesh.rotation.x = -Math.PI / 2
        mesh.position.set(0, this.depth + 0.44, 0)
        mesh.renderOrder = 21
        this.flyLineGroup.add(mesh)
      })
  }
  // 创建焦点
  createFocus() {
    let focusObj = new Focus(this, { color1: 0xbdfdfd, color2: 0xbdfdfd })
    let [x, y] = this.geoProjection(this.flyLineCenter)
    focusObj.position.set(x, -y, this.depth + 0.44)
    focusObj.scale.set(1, 1, 1)
    this.flyLineFocusGroup.add(focusObj)
  }
  // 创建粒子
  createParticles() {
    this.particles = new Particles(this, {
      num: 10,
      range: 30,
      dir: "up",
      speed: 0.05,
      material: new PointsMaterial({
        map: Particles.createTexture(),
        size: 1,
        color: 0x00eeee,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    })
    this.particleGroup = new Group()
    this.scene.add(this.particleGroup)
    this.particleGroup.rotation.x = -Math.PI / 2
    this.particles.setParent(this.particleGroup)
    this.particles.enable = true
    this.particleGroup.visible = true
  }
  createScatter() {
    this.scatterGroup = new Group()
    this.scatterGroup.visible = false
    this.scatterGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.scatterGroup)
    const texture = this.assets.instance.getResource("arrow")
    const material = new SpriteMaterial({
      map: texture,
      color: 0xfffef4,
      fog: false,
      transparent: true,
      depthTest: false,
    })
    let scatterAllData = sortByValue(scatterData)
    let max = scatterAllData[0].value
    scatterAllData.map((data) => {
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = 0.1 + (data.value / max) * 0.2
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.geoProjection([data.lng, data.lat])
      sprite.position.set(x, -y, this.depth + 0.45)
      sprite.userData.position = [x, -y, this.depth + 0.45]
      this.scatterGroup.add(sprite)
    })
  }
  createInfoPoint() {
    let self = this
    this.InfoPointGroup = new Group()
    this.scene.add(this.InfoPointGroup)
    this.InfoPointGroup.visible = false
    this.InfoPointGroup.rotation.x = -Math.PI / 2
    this.infoPointIndex = 0
    this.infoPointLabelTime = null
    this.infoLabelElement = []
    let label3d = this.label3d
    const texture = this.assets.instance.getResource("point")
    let colors = [0xfffef4, 0x77fbf5]
    let infoAllData = sortByValue(infoData)
    let max = infoAllData[0].value
    infoAllData.map((data, index) => {
      const material = new SpriteMaterial({
        map: texture,
        color: colors[index % colors.length],
        fog: false,
        transparent: true,
        depthTest: false,
      })
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = 0.7 + (data.value / max) * 0.4
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.geoProjection([data.lng, data.lat])
      let position = [x, -y, this.depth + 0.7]
      sprite.position.set(...position)
      sprite.userData.position = [...position]
      sprite.userData = {
        position: [x, -y, this.depth + 0.7],
        name: data.name,
        value: data.value,
        level: data.level,
        index: index,
      }
      this.InfoPointGroup.add(sprite)
      let label = infoLabel(data, label3d, this.InfoPointGroup)
      this.infoLabelElement.push(label)
      this.interactionManager.add(sprite)
      sprite.addEventListener("mousedown", (ev) => {
        if (this.clicked || !this.InfoPointGroup.visible) return false
        this.clicked = true
        this.infoPointIndex = ev.target.userData.index
        this.infoLabelElement.map((label) => {
          label.visible = false
        })
        label.visible = true
        this.createInfoPointLabelLoop()
      })
      sprite.addEventListener("mouseup", (ev) => {
        this.clicked = false
      })
      sprite.addEventListener("mouseover", (event) => {
        document.body.style.cursor = "pointer"
      })
      sprite.addEventListener("mouseout", (event) => {
        document.body.style.cursor = "default"
      })
    })
    function infoLabel(data, label3d, labelGroup) {
      let label = label3d.create("", "info-point", true)
      const [x, y] = self.geoProjection([data.lng, data.lat])
      label.init(
        ` <div class="info-point-wrap">
          <div class="info-point-wrap-inner">
            <div class="info-point-line">
              <div class="line"></div>
              <div class="line"></div>
              <div class="line"></div>
            </div>
            <div class="info-point-content">
              <div class="content-item"><span class="label">名称</span><span class="value">${data.name}</span></div>
              <div class="content-item"><span class="label">PM2.5</span><span class="value">${data.value}ug/m²</span></div>
              <div class="content-item"><span class="label">等级</span><span class="value">${data.level}</span></div>
            </div>
          </div>
        </div>
      `,
        new Vector3(x, -y, self.depth + 1.9)
      )
      label3d.setLabelStyle(label, 0.015, "x")
      label.setParent(labelGroup)
      label.visible = false
      return label
    }
  }
  createInfoPointLabelLoop() {
    clearInterval(this.infoPointLabelTime)
    this.infoPointLabelTime = setInterval(() => {
      this.infoPointIndex++
      if (this.infoPointIndex >= this.infoLabelElement.length) {
        this.infoPointIndex = 0
      }
      this.infoLabelElement.map((label, i) => {
        if (this.infoPointIndex === i) {
          label.visible = true
        } else {
          label.visible = false
        }
      })
    }, 3000)
  }
  createStorke() {
    const mapStroke = this.assets.instance.getResource("mapStroke")
    const texture = this.assets.instance.getResource("pathLine3")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(2, 1)

    let pathLine = new Line(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.24),
      data: mapStroke,
      material: new MeshBasicMaterial({
        color: 0x2bc4dc,
        map: texture,
        alphaMap: texture,
        fog: false,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
      }),
      type: "Line3",
      renderOrder: 22,
      tubeRadius: 0.03,
    })
    // 设置父级
    this.focusMapGroup.add(pathLine.lineGroup)
    this.time.on("tick", () => {
      texture.offset.x += 0.005
    })
  }

  geoProjection(args) {
    return geoMercator().center(this.geoProjectionCenter).scale(this.geoProjectionScale).translate([0, 0])(args)
  }
  update() {
    super.update()
    this.interactionManager && this.interactionManager.update()
  }
  destroy() {
    super.destroy()
    this.label3d && this.label3d.destroy()
  }
}
