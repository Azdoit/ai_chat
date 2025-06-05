<template>
  <svg aria-hidden="true" class="w-[18px] h-[18px] iconClass" :class="strokeClass">
    <use :class="fillClass" :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // tailwind定义svg的stroke颜色
  strokeClass: {
    type: String
  },
  // 显示的 svg 图标名称（剔除 icon-）
  name: {
    type: String,
    required: true
  },
  // 直接指定 svg 图标的颜色
  color: {
    type: String
    // default:'white'
  },
  // 通过 tailwind 指定 svg 颜色的类名
  fillClass: {
    type: String
  }
})
// 真实显示的 svg 图标名（拼接 #icon-）
const symbolId = computed(() => `#icon-${props.name}`)
</script>
