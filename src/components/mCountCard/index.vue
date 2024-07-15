<template>
  <div class="count-card">
    <div class="count-card-left">
      <div class="count-card-icon" :class="'icon-' + info.icon"></div>
      <div class="count-card-title">
        <div class="title-zh">{{ info.zh }}</div>
        <div class="title-en">{{ toUpper(info.en) }}</div>
      </div>
    </div>
    <div class="count-card-right">
      <div class="value">
        <mCountTo
          :startVal="0"
          :endVal="info.value"
          :decimals="info.decimals"
          :duration="2000"
          separator=""
          :autoplay="true"
        ></mCountTo>
      </div>
      <div class="unit">{{ info.unit }}</div>
    </div>
  </div>
</template>
<script setup>
import mCountTo from "@/components/mCountTo/index.js"
defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        icon: "xiaoshoujine",
        zh: "2023年销售金额",
        en: "Sales amount in 2023",
        value: 9500,
        unit: "万元",
        decimals: 0,
      }
    },
  },
})
function toUpper(text) {
  return text.toUpperCase()
}
</script>
<style lang="scss">
.count-card {
  display: flex;
  align-items: center;
  &-left {
    display: flex;
    align-items: center;
  }
  &-right {
    display: flex;
    align-items: center;
    padding-left: 20px;
    .value {
      font-family: D-DIN;
      font-weight: bold;
      font-size: 28px;
      color: #ffffff;
      letter-spacing: 1px;
      margin-right: 10px;
      text-shadow: 0px 0px 18px rgba(255, 255, 255, 0.7);
      white-space: nowrap;
    }
    .unit {
      font-weight: 500;
      font-size: 12px;
      color: #ffffff;
      padding-top: 15px;
      opacity: 0.5;
      white-space: nowrap;
    }
  }
  &-icon {
    width: 58px;
    height: 58px;
    margin-right: 10px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100%;
    // 2023销售金额
    &.icon-xiaoshoujine {
      background-image: url("~@/assets/images/icon1.png");
    }
    // 2023总销量
    &.icon-zongxiaoliang {
      background-image: url("~@/assets/images/icon2.png");
    }
  }
  &-title {
    .title-zh {
      font-weight: bold;
      font-size: 18px;
      color: #ffffff;
      white-space: nowrap;
    }
    .title-en {
      font-family: D-DIN;
      font-weight: 400;
      font-size: 12px;
      color: #ffffff;
      opacity: 0.5;
      padding-top: 5px;
      white-space: nowrap;
    }
  }
}
</style>
