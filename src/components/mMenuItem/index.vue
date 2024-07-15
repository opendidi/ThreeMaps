<template>
  <div
    class="m-menu-item"
    :class="{ 'is-active': index === activeIndex }"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { defineComponent, inject } from "vue";
const props = defineProps({
  index: {
    type: [String, Number],
    required: true,
  },
});
const updateActive = inject("updateActive");
const activeIndex = inject("activeIndex");
const isActive = () => {
  return false; // 这里需要根据实际情况来判断是否活跃
};

const handleClick = () => {
  updateActive(props.index);
};
</script>
