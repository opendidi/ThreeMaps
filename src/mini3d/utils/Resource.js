import { Loader, LoadingManager, TextureLoader } from "three"
import { EventEmitter } from "./EventEmitter"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
let ResourceType = {
  GLTFLoader: "GLTF",
  TextureLoader: "Texture",
  FontLoader: "Font",
  MMDLoader: "MMD",
  MTLLoader: "MTL",
  OBJLoader: "OBJ",
  PCDLoader: "PCD",
  FileLoader: "File",
  ImageLoader: "Image",
  ObjectLoader: "Object",
  MaterialLoader: "Material",
  CubeTextureLoader: "CubeTexture",
  RGBELoader: "RGBELoader",
  FBXLoader: "FBX",
}
const types = Object.values(ResourceType)
export class Resource extends EventEmitter {
  constructor({ dracoPath } = {}) {
    super()
    this.dracoPath = dracoPath || "./draco/gltf/"
    this.itemsLoaded = 0
    this.itemsTotal = 0
    this.assets = []
    this.loaders = {}
    this.initDefaultLoader()
  }
  initManager() {
    const manager = new LoadingManager()
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded
      this.itemsTotal = itemsTotal
      this.emit("onProgress", url, itemsLoaded, itemsTotal)
    }
    manager.onError = (err) => {
      this.emit("onError", err)
    }
    return manager
  }
  initDefaultLoader() {
    ;[
      { loader: GLTFLoader, name: "GLTFLoader" },
      { loader: TextureLoader, name: "TextureLoader" },
    ].map((item) => this.addLoader(item.loader, item.name))
  }
  initDraco(loader) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(this.dracoPath)
    dracoLoader.preload()
    loader.setDRACOLoader(dracoLoader)
  }
  addLoader(loader, loaderName = "") {
    if (loader.name && ResourceType[loaderName]) {
      let hasLoader = this.loaders[loaderName]
      if (!hasLoader) {
        let instance = new loader(this.manager)
        let name = loaderName
        if (instance instanceof Loader) {
          if (name === "GLTFLoader") {
            this.initDraco(instance)
          }
          this.loaders[ResourceType[name]] = instance
        }
      }
    } else {
      throw new Error("请配置正确的加载器")
    }
  }
  loadItem(item) {
    return new Promise((resolve, reject) => {
      if (!this.loaders[item.type]) {
        throw new Error(`资源${item.path}没有配置加载器`)
      }
      this.loaders[item.type].load(
        item.path,
        (data) => {
          this.itemsLoaded++
          this.emit("onProgress", item.path, this.itemsLoaded, this.itemsTotal)
          resolve({ ...item, data })
        },
        null,
        (err) => {
          this.emit("onError", err)
          reject(err)
        }
      )
    })
  }
  loadAll(assets) {
    this.itemsLoaded = 0
    this.itemsTotal = 0
    return new Promise((resolve, reject) => {
      let currentAssets = this.matchType(assets)
      let promise = []
      this.itemsTotal = currentAssets.length
      currentAssets.map((item) => {
        let currentItem = this.loadItem(item)
        promise.push(currentItem)
      })
      Promise.all(promise)
        .then((res) => {
          this.assets = res
          this.emit("onLoad")
          resolve(res)
        })
        .catch((err) => {
          this.emit("onError", err)
          reject(err)
        })
    })
  }
  matchType(assets) {
    this.assets = assets
      .map((item) => {
        let type = types.includes(item.type) ? item.type : ""
        return {
          type: type,
          path: item.path,
          name: item.name,
          data: null,
        }
      })
      .filter((item) => {
        if (!item.type) {
          throw new Error(`资源${item.path},type不正确`)
        }
        return item.type
      })
    return this.assets
  }
  getResource(name) {
    let current = this.assets.find((item) => {
      return item.name === name
    })
    if (!current) {
      throw new Error(`资源${name}不存在`)
    }
    return current.data
  }
  destroy() {
    this.off("onProgress")
    this.off("onLoad")
    this.off("onError")
    this.assets = []
  }
}
