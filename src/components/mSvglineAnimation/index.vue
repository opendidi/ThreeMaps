<template>
  <div class="svg-line-animation">
    <svg width="100%" height="100%" :viewBox="`0 0 ${width} ${height}`" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient :id="radialGradientId" cx="50%" cy="50%" fx="100%" fy="50%" r="50%">
          <stop offset="0%" stop-color="#fff" :stop-opacity="dir[1]" />
          <stop offset="100%" stop-color="#fff" :stop-opacity="dir[0]" />
        </radialGradient>
        <mask :id="maskId">
          <circle :r="length" cx="0" cy="0" :fill="`url(#${radialGradientId})`">
            <animateMotion
              :begin="`${begin}s`"
              :dur="`${duration}s`"
              :path="path"
              rotate="auto"
              :keyPoints="`${dir[0]};${dir[1]}`"
              keyTimes="0;1"
              repeatCount="indefinite"
            ></animateMotion>
          </circle>
        </mask>
      </defs>
      <path class="path-line" :d="path" :stroke="color" :stroke-width="strokeWidth" :mask="`url(#${maskId})`" />
    </svg>
  </div>
</template>

<script>
/**
 * SVG动画路径组件
 * @description  SVG动画路径组件
 * @property {Number} width  svg的宽度
 * @property {Number} height  svg的高度
 * @property {String} path  svg的路径值
 * @property {Number} duration  路径动画持续时间
 * @property {Number} length  路径显示的长度
 * @property {Number} begin  路径开始的位置
 * @property {Number} dir 路径移动方向 [0,1]-正向 [1,0]-反向
 * @property {Number} strokeWidth 路径的粗细
 * @property {String} color 路径的颜色
 */
export default {
  name: "SvglineAnimation",
  props: {
    width: {
      type: Number,
      default: 135,
    },
    height: {
      type: Number,
      default: 150,
    },
    path: {
      type: String,
      default: "M0 72.5H682L732 0.5H3082",
    },
    color: {
      type: String,
      default: "#0091FF",
    },
    duration: {
      type: Number,
      default: 3,
    },
    length: {
      type: Number,
      default: 100,
    },
    begin: {
      type: Number,
      default: 0,
    },
    dir: {
      type: Array,
      default: () => [0, 1],
    },
    strokeWidth: {
      type: Number,
      default: 4,
    },
  },
  data() {
    let uid = 1
    return {
      maskId: "svgline-" + uid,
      radialGradientId: "radialGradient-" + uid,
    }
  },
  mounted() {
    let uid = this._.uid
    this.maskId = "svgline-" + uid
    this.radialGradientId = "radialGradient-" + uid
  },
}
</script>

<style>
.path-line {
  mix-blend-mode: screen;
}
</style>
