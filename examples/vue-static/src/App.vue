<script lang="ts" setup>
import { ref } from "vue"
import { deepInputStyle, flexCenterStyle, inputStyle, containerStyle, route, imgStyle } from "./app.style"
import { ElInput } from "element-plus"
</script>

<template>
  <div :class="[flexCenterStyle, containerStyle, deepInputStyle]">
    <div :class="flexCenterStyle">
      <p>移入变灰</p>
      <p>媒体查询：小于600像素变色</p>
      <p>媒体查询：小于600像素变色，移入变色</p>
    </div>
    <img src="/vite.svg" alt="" :class="(route, imgStyle)" />
    <input :class="inputStyle" type="text" placeholder="自定义 placeholder 样式" />
    <ElInput value="深度修改组件样式" />
  </div>
</template>
