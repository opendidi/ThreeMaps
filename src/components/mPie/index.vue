<template>
  <div class="three-pie-wrap">
    <div class="three-pie" ref="pieDom"></div>
    <div class="three-pie-slot">
      <slot v-bind:data="currentData"></slot>
    </div>
  </div>
</template>

<script>
import * as THREE from "three"
import gsap from "gsap"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { emptyObject } from "@/mini3d"

import ring2 from "@/assets/texture/pie/ring2.png"
import ring3 from "@/assets/texture/pie/ring3.png"
import ring4 from "@/assets/texture/pie/ring4.png"
export default {
  name: "ThreePie",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    colors: {
      type: Array,
      default: () => [0x20faae, 0xeab108, 0x2fa4e7, 0x00ffff, 0xfc5430],
    },
    opacity: {
      type: Number,
      default: 0.5,
    },
    delay: {
      type: Number,
      default: 5000,
    },
    loopComplete: {
      type: Function,
      default: () => {},
    },
  },
  computed: {
    currentData() {
      return {
        ...this.data[this.activeIndex],
        count: this.count,
      }
    },
  },
  data() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.axes = null
    this.pieGroup = new THREE.Group()
    return {
      width: 300,
      height: 200,
      activeIndex: 0,
      count: 0,
      timer: null,
    }
  },
  mounted() {
    this.width = this.$refs["pieDom"].offsetWidth
    this.height = this.$refs["pieDom"].offsetHeight
    this.count = this.data.map((item) => item.value).reduce((prev, current) => prev + current, 0)
    this.init()
  },
  beforeUnmount() {
    clearInterval(this.timer)
    this.destroy()
  },
  methods: {
    init() {
      this.scene = new THREE.Scene()
      this.initCamera()
      this.initRenderer()
      this.initLight()
      this.initAxes()
      this.initControls()
      this.createPlane({
        url: ring2,
        width: 5,
        position: new THREE.Vector3(0, 0, -0.01),
        color: "#00ffff",
      })
      this.createPlane({
        url: ring3,
        width: 6.5,
        position: new THREE.Vector3(0, 0, -0.02),
        color: "#00ffff",
      })
      this.createPlane({
        url: ring4,
        width: 5.5,
        position: new THREE.Vector3(0, 0, -0.03),
        animate: true,
        color: "#00ffff",
      })
      this.createPie()
      this.loop()
    },
    createPlane(opt) {
      let defaultOpt = {
        url: "texture/ring1.png",
        width: 5.5,
        z: 0,
        position: new THREE.Vector3(0, 0, 0),
        animate: false,
        color: null,
      }
      let options = Object.assign(defaultOpt, opt)
      const geometry = new THREE.PlaneGeometry(options.width, options.width)
      const material = new THREE.MeshBasicMaterial({
        map: this.getTexture(options.url),
        // color: 0x00ffff,
        transparent: true,
        side: THREE.DoubleSide,
        // depthWrite: false,
        depthTest: false,
      })
      if (options.color) {
        material.color = new THREE.Color(options.color)
      }
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(options.position)
      mesh.rotation.x = (-1 * Math.PI) / 2
      if (options.animate) {
        gsap.to(mesh.rotation, {
          z: 2 * Math.PI,
          repeat: -1,
          ease: "none",
          duration: 3,
        })
      }
      this.scene.add(mesh)
    },
    getTexture(url) {
      const texture = new THREE.TextureLoader().load(url)
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      return texture
    },
    createPie() {
      let startAngle = 0
      let endAngle = 0

      for (var i = 0; i < this.data.length; i++) {
        let percent = this.data[i].value / this.count
        if (i == 0) {
          startAngle = 0
        } else {
          startAngle = endAngle + 0.0001
        }
        endAngle = endAngle + 2 * Math.PI * percent - 0.0001

        let ring = this.addRing({
          startAngle: startAngle,
          endAngle: endAngle,
          color: new THREE.Color(this.colors[i % this.colors.length]),
        })
        ring.name = "ring" + i
        this.pieGroup.add(ring)
      }
      this.scene.add(this.pieGroup)
      this.chooseRing(this.activeIndex, true)

      this.timer = setInterval(() => {
        this.loopChange()
      }, this.delay)
    },

    loopChange() {
      let index = this.activeIndex + 1

      if (index >= this.data.length) {
        index = 0
        this.loopComplete && this.loopComplete()
      }
      this.chooseRing(index)
    },
    chooseRing(activeIndex = 0, isFirst = false) {
      let prevIndex = activeIndex - 1 < 0 ? this.data.length - 1 : activeIndex - 1
      let prevMesh = this.pieGroup.children[prevIndex]
      this.prevMesh = prevMesh
      this.activeIndex = activeIndex
      let chooseMesh = this.pieGroup.children[activeIndex]
      if (!isFirst) {
        gsap.to(prevMesh.scale, { z: 1 })
        gsap.to(prevMesh.material, { opacity: this.opacity })
      }
      gsap.to(chooseMesh.scale, { z: 2 })
      gsap.to(chooseMesh.material, { opacity: 0.8 })
    },
    addRing(opt = {}) {
      let defaultOpt = {
        innerRadius: 1.5, // 内圆半径
        outerRadius: 2, // 外援半径
        thickness: 0.5, // 厚度
        startAngle: 0,
        endAngle: Math.PI / 2,
        color: 0x00ffff,
        segments: 120,
      }
      let options = Object.assign(defaultOpt, opt)
      // 外层
      let outerShape = new THREE.Shape()
      outerShape.arc(0, 0, options.outerRadius, options.startAngle, options.endAngle)
      let outerPoints = outerShape.getPoints(options.segments)
      // 内层：需要把开始结束角度调换下，并反向绘制
      let innerShape = new THREE.Shape()
      innerShape.arc(0, 0, options.innerRadius, options.endAngle, options.startAngle, true)
      let innerPoints = innerShape.getPoints(options.segments)
      // 组合内外侧的点，并重新生成shape
      let shape = new THREE.Shape(outerPoints.concat(innerPoints))
      // 扩展设置
      const extrudeSettings = {
        steps: 1,
        depth: options.thickness,
        bevelEnabled: true,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0,
      }
      const extruGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      let material = new THREE.MeshLambertMaterial({
        color: options.color,
        transparent: true,
        opacity: this.opacity,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(extruGeometry, material.clone())
      mesh.renderOrder = 10
      mesh.rotation.x = (-1 * Math.PI) / 2
      return mesh
    },
    initCamera() {
      var rate = this.width / this.height
      this.camera = new THREE.PerspectiveCamera(30, rate, 0.1, 1500)
      // this.camera .position.set(4.972679988078243, 4.643664044427053, 5.723022308725478)
      this.camera.position.set(6.023813305272227, 4.838542633695233, 6.111272698256137)
      this.camera.lookAt(0, 0, 0)
    },

    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(this.width, this.height)
      this.$refs["pieDom"].appendChild(this.renderer.domElement)
    },

    initLight() {
      //   平行光1
      let directionalLight1 = new THREE.DirectionalLight(0xffffff, 2)
      directionalLight1.position.set(200, 300, 200)
      //   平行光2
      let directionalLight2 = new THREE.DirectionalLight(0xffffff, 2)
      directionalLight2.position.set(-200, -300, -200)
      // 环境光
      let ambientLight = new THREE.AmbientLight(0xffffff, 2)
      // 将光源添加到场景中
      this.scene.add(directionalLight1)
      this.scene.add(directionalLight2)
      this.scene.add(ambientLight)
    },

    initAxes() {
      this.axes = new THREE.AxesHelper(0)
      this.scene.add(this.axes)
    },

    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.maxPolarAngle = Math.PI
      this.controls.autoRotate = false
      this.controls.enableDamping = true
      this.controls.enabled = false
    },

    loop() {
      this.renderer.setAnimationLoop(() => {
        this.renderer.render(this.scene, this.camera)
        this.controls && this.controls.update()
        // console.log(this.camera .position);
      })
    },
    start() {
      this.loop()
      this.controls.enabled = true
      this.timer = setInterval(() => {
        this.loopChange()
      }, this.delay)
    },
    stop() {
      clearInterval(this.timer)
      if (this.controls) {
        this.controls.enabled = false
      }
      if (this.renderer) {
        this.renderer.setAnimationLoop(null)
      }
    },
    // 获取场景
    getScene() {
      return this.scene
    },
    getRender() {
      return this.renderer
    },
    resize() {
      this.width = this.$refs["pieDom"].offsetWidth
      this.height = this.$refs["pieDom"].offsetHeight
      let aspect = this.width / this.height
      this.camera.aspect = aspect
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
    },
    destroy() {
      if (this.prevMesh) {
        gsap.set(this.prevMesh.scale, { z: 1 })
        gsap.set(this.prevMesh.material, { opacity: this.opacity })
      }
      this.stop()
      window.removeEventListener("resize", () => {
        this.resize()
      })
      if (this.renderer) {
        emptyObject(this.pieGroup)
        this.renderer.dispose()
        this.renderer.forceContextLoss()
        this.controls.dispose()
        this.$refs["pieDom"].innerHTML = ""
        this.scene = null
        this.camera = null
        this.renderer = null
        this.controls = null
        this.axes = null
      }
    },
  },
}
</script>

<style>
.three-pie-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.three-pie {
  width: 100%;
  height: 100%;
}
.three-pie-slot {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
