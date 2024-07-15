<template>
  <div class="m-radar">
    <img class="m-radar-bg" src="@/assets/images/radar/radar-bg.png" alt="" />
    <img class="m-radar-saomiao" src="@/assets/images/radar/saomiao.png" alt="" />
  </div>
</template>
<style lang="scss">
.m-radar {
  position: relative;
  width: 92px;
  height: 92px;
  &-bg {
    width: 92px;
    height: 92px;
  }
  &-saomiao {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -39px;
    margin-top: -39px;
    width: 79px;
    height: 79px;
    animation: rotate360Animate 3s linear infinite;
  }
}
</style>
