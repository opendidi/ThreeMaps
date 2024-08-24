<template>
  <div class="map">
    <canvas id="canvasMap"></canvas>
  </div>
</template>
<script setup>
import { onMounted, shallowRef, onBeforeUnmount } from "vue";
import { World } from "./map.js";
import emitter from "@/utils/emitter";
const canvasMap = shallowRef(null);
onMounted(() => {
  emitter.$on("loadMap", loadMap);
});
onBeforeUnmount(() => {
  canvasMap.value && canvasMap.value.destroy();
  emitter.$off("loadMap", loadMap);
});
function loadMap(assets) {
  canvasMap.value = new World(document.getElementById("canvasMap"), assets);
  canvasMap.value.time.pause();
}
async function play() {
  canvasMap.value.time.resume();
  canvasMap.value.animateTl.timeScale(1); // 设置播放速度正常
  canvasMap.value.animateTl.play();
}
defineExpose({
  loadMap,
  play,
  canvasMap,
});
</script>

<style lang="scss">
.map {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  .info-point {
    background: rgba(0, 0, 0, 0.5);
    color: #a3dcde;
    font-size: 14px;
    width: 170px;
    height: 106px;
    padding: 16px 12px 0;
    margin-bottom: 30px;
    will-change: transform;
    &-wrap {
      &:after,
      &:before {
        display: block;
        content: "";
        position: absolute;
        top: 0;
        width: 15px;
        height: 15px;
        border-top: 1px solid #4b87a6;
      }
      &:before {
        left: 0;
        border-left: 1px solid #4b87a6;
      }
      &:after {
        right: 0;
        border-right: 1px solid #4b87a6;
      }
      &-inner {
        &:after,
        &:before {
          display: block;
          content: "";
          position: absolute;
          bottom: 0;
          width: 15px;
          height: 15px;
          border-bottom: 1px solid #4b87a6;
        }
        &:before {
          left: 0;
          border-left: 1px solid #4b87a6;
        }
        &:after {
          right: 0;
          border-right: 1px solid #4b87a6;
        }
      }
    }
    &-line {
      position: absolute;
      top: 7px;
      right: 12px;
      display: flex;
      .line {
        width: 5px;
        height: 2px;
        margin-right: 5px;
        background: #17e5c3;
      }
    }
    &-content {
      .content-item {
        display: flex;
        height: 28px;
        line-height: 28px;
        background: rgba(35, 47, 58, 0.6);
        margin-bottom: 5px;
        .label {
          width: 60px;
          padding-left: 10px;
        }
        .value {
          color: #ffffff;
        }
      }
    }
  }
  .provinces-label {
    &-wrap {
      transform: translate(50%, 200%);
      opacity: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 18px;
      width: 200px;
      height: 53px;
      border-radius: 30px 30px 30px 0px;
      background: rgba(0, 0, 0, 0.4);
    }
    .number {
      color: #fff;
      font-size: 30px;
      font-weight: 700;

      .unit {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
        opacity: 0.5;
        padding-left: 5px;
      }
    }
    .name {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      span {
        display: block;
      }
      .en {
        color: #fff;
        font-size: 10px;
        opacity: 0.5;
        font-weight: 700;
      }
    }
    .no {
      color: #7efbf6;
      text-shadow: 0 0 5px #7efbf6, 0 0 10px #7efbf6;
      font-size: 30px;
      font-weight: 700;
    }
    .yellow {
      .no {
        color: #fef99e !important;
        text-shadow: 0 0 5px #fef99e, 0 0 10px #fef99e !important;
      }
    }
  }

  .china-label {
    color: #fff;

    font-size: 12px;
    will-change: transform;
    .other-label {
      display: flex;
      align-items: center;
      padding: 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.6);
      will-change: transform;
    }

    &.blur {
      filter: blur(2px);
      opacity: 0.5;
    }
    .label-icon {
      display: block;
      width: 20px;
      height: 20px;
      margin: 0 10px 0 0;
    }
  }
  .map-label {
    padding: 5px;
    color: #fff;
    will-change: transform;
    font-size: 36px;
    font-weight: bold;
    letter-spacing: 4.5px;
    -webkit-box-reflect: below 0 -webkit-linear-gradient(transparent, transparent
          20%, rgba(255, 255, 255, 0.3));
    .other-label {
      display: flex;
      flex-direction: column;
    }
    span {
      font-size: 46px;
      &:last-child {
        font-size: 12px;
        font-weight: normal;
        letter-spacing: 0px;
        color: #a7d5ef;
      }
    }
  }
  .decoration-label {
    // &.reflect {
    //   -webkit-box-reflect: below 0 -webkit-linear-gradient(transparent, transparent 20%, rgba(255, 255, 255, 0.3));
    // }
    // padding-bottom: 10px;
    .label-icon {
      display: block;
      width: 40px;
      height: 40px;
    }
  }
  .other-label {
    transform: translateY(200%);
    opacity: 0;
    background: none;
    will-change: transform;
  }
}
</style>
