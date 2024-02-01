<script lang="ts" setup>
import { ref } from "vue"
import { flexCenterStyle, inputStyle, containerStyle, route, imgStyle } from "./app.style"
import { useAtomStyle, useDeepStyle, useThemeMode, useStyleVar } from "@usacss/vue"
import { ElButton, ElInput, ElSpace } from "element-plus"

const randomNum = () => (Math.random() * 255) >>> 0
const [css1, setStyle] = useDeepStyle()
const setInputDeepStyle = () => {
  setStyle({
    select: ".el-input__inner",
    color: `var(--c, rgb(${randomNum()},${randomNum()},${randomNum()}))`,
  })
}

const mode = useThemeMode("body")


const input = ref("")
const action = useStyleVar("body")
</script>

<template>
  <div :class="[useAtomStyle(flexCenterStyle, containerStyle), css1]">
    <div :class="useAtomStyle(flexCenterStyle)">
      <p>
        当前自定义主题为: <b>{{ mode ?? "默认" }}</b>
      </p>
      <p>移入变灰</p>
      <p>媒体查询：小于600像素变色</p>
      <p>媒体查询：小于600像素变色，移入变色</p>
    </div>
    <img src="/vite.svg" alt="" :class="useAtomStyle(route, imgStyle)" />
    <input :class="useAtomStyle(inputStyle)" type="text" placeholder="自定义 placeholder 样式" />
    <ElSpace direction="vertical">
      <ElInput v-model="input" placeholder="请输入..." size="large" />
      <ElSpace>
        <ElButton @click="setInputDeepStyle">随机输入点内容，点击随机改变 ElInput 的字体颜色</ElButton>
        <ElButton @click="action.set('c', input)">通过css变量设置成输入的颜色</ElButton>
        <ElButton @click="action.del('c')">清空css变量设置的颜色</ElButton>
      </ElSpace>
    </ElSpace>
    <ElSpace>
      <ElButton @click="mode = null">清除自定义主题</ElButton>
      <ElButton @click="mode = 'sun'">切换自定义主题--》sun</ElButton>
      <ElButton @click="mode = 'moon'">切换自定义主题--》moon</ElButton>
    </ElSpace>
  </div>
</template>
