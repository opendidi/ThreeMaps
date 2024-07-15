<template>
  <div class="left-card">
    <m-card title="近年经济情况">
      <v-chart ref="vChart" :option="option" :autoresize="true" />
    </m-card>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"
import * as echarts from "echarts"
import mCard from "@/components/mCard/index.vue"
import VChart from "vue-echarts"

const option = ref({
  title: {
    text: "亿元",
    left: "5%",
    top: "8%",
    textStyle: {
      color: "#D3F8F2",
      fontSize: 8,
    },
  },
  grid: {
    left: "12%",
    top: "25%",
    width: "82%",
    height: "55%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
      shadowStyle: { opacity: 0.2 },
    },
    backgroundColor: "rgba(0,0,0,1)",
    borderWidth: 1,
    borderColor: "#999999",
    textStyle: {
      color: "#ffffff",
      fontSize: 10,
    },
  },
  color: ["#6BC7F6"],
  xAxis: [
    {
      type: "category",

      axisLine: {
        show: false,
        lineStyle: {
          color: "#435459",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLabel: {
        color: "#ffffff",
        fontSize: 10,
        interval: 1,
        padding: [0, 0, 0, 0],
      },
      data: [
        "2023/04",
        "2023/05",
        "2023/06",
        "2023/07",
        "2023/08",
        "2023/09",
        "2023/10",
        "2023/11",
        "2023/12",
        "2024/01",
        "2024/02",
        "2024/03",
      ],
    },
    {
      axisLine: {
        show: false,
        lineStyle: {
          color: "rgba(0,0,0,0)",
        },
      },
      data: [],
    },
  ],
  yAxis: {
    type: "value",

    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: [2, 2],
        dashOffset: 5,
        color: ["rgba(255, 255, 255, 1)"],
        opacity: 1,
        width: 0.3,
      },
    },
    axisLabel: {
      color: "#8B9EA4",
      fontSize: 9,
    },
  },
  series: [
    {
      data: [500, 1000, 300, 1300, 500, 1330, 620, 400, 700, 1300, 300, 1234],
      type: "line",
      smooth: true,
      symbol:
        "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAQ5JREFUOE+1la1OQ0EQRs8kCFIQdVCCxIBpCK1AInkDHC+B4QkwvASub4GsaE0NGCRpKhGFVDQZ+Mjem9vNbkphmWTMfjNnd3b2x0iYuxuwH7wNbIewBfAGzORm5nG6ElfM3QU6AXZSkzXG3oEnMxO8thWgux8DR2tAsfxiZs/VYA38Jazi1NBvYCizv+HK4vCRyrfQgIsf7Nm6+bSnjwIeAGeZaGnXQDfoE+ABmGbixwKeAoeJAMHuv3w30ubATQb6KqDKjZPEuAXOMysZAncJbS7gJbCVEAdAKwP8AK4S2vJfgMVLLt6UDtAreWx0W8od7OJXryq16OPwR2j6+WpAyz2wDagape7vARt9AZ+G3HmhiKS3xwAAAABJRU5ErkJggg==",
      symbolSize: 10,
      showSymbol: false, // 是否显示 symbol, 如果 false 则只有在 tooltip hover 的时候显示。
      yAxisIndex: 0,
      z: 0,
      // 设置高亮样式
      emphasis: {
        focus: "none",
        itemStyle: { color: "white" },
      },
      label: {
        show: true,
        position: "top",
        distance: 10,
        color: "#ffffff",
        fontSize: 10,
      },

      lineStyle: {
        shadowColor: "rgba(0, 0, 0, 0.4)",
        shadowBlur: 3,
        shadowOffsetY: 10,
        width: 3,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(115, 208, 255, 1)",
          },
          {
            offset: 1,
            color: "rgba(18,60,98,1)",
          },
        ]),
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(25, 255, 236, 0.4)",
          },
          {
            color: "rgba(51, 153, 255, 0)",
            offset: 1,
          },
        ]),
      },
    },
  ],
})

</script>
<style lang="scss"></style>
