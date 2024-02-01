<script lang="ts" setup>
import { ref } from "vue"
import { flexCenterStyle, inputStyle, containerStyle, route, imgStyle } from "./app.style"
import { useAtomStyle, useDeepStyle } from "@usacss/vue"
import { ElButton, ElInput, ElSpace } from "element-plus"

const randomNum = () => (Math.random() * 255) >>> 0
const [css1, setStyle] = useDeepStyle()
const setInputDeepStyle = () => {
  setStyle({
    select: ".el-input__inner",
    color: `rgb(${randomNum()},${randomNum()},${randomNum()})`
  })
}
</script>

<template>
  <div :class="[useAtomStyle(flexCenterStyle, containerStyle), css1]">
    <div :class="useAtomStyle(flexCenterStyle)">
      <p>移入变灰</p>
      <p>媒体查询：小于600像素变色</p>
      <p>媒体查询：小于600像素变色，移入变色</p>
    </div>
    <img src="/vite.svg" alt="" :class="useAtomStyle(route, imgStyle)" />
    <input :class="useAtomStyle(inputStyle)" type="text" placeholder="自定义 placeholder 样式" />
    <ElInput value="深度修改组件样式" />
    <ElSpace>
      <ElButton @click="setInputDeepStyle">随机改变 ElInput 的字体颜色</ElButton>
    </ElSpace>
  </div>
</template>
