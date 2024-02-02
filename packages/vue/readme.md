# @usacss/vue

一个将`CSS-in-JS`和原子 `css` 相结合的原子样式库

当前具备的能力

1. 原子化 `css`

   可以将写的样式拆解成一个个原子，内容相同即可复用

2. 动态能力

   提供了简单的深度选择器功能，用来弥补原子`css`无法深度选中元素修改样式的软肋

3. 支持服务端渲染 `ssr`

4. 支持热更新

5. 大部分 `css` 能力都支持

   1. 一般样式 `div{color:red}`
   2. 伪类 `div:hover{}`
   3. 媒体查询
   4. 动画
   5. `important!`
   6. 自定义 `css` 变量

6. 规则继承

   所有样式都可以拆解为一条条的样式规则，继承则意味着可以跨项目共享样式

7. 自定义主题模式切换

   比如亮色主题，暗色主题，其他任意主题

8. 静态模式（0js）

   通过配置可以做到把所有样式全部打成静态样式内容，写的是 `js`，最终产物关于样式则是 `0js`

核心优点

- 自身包的体积小——除了`js`以外所有的文件，内部支持 `treeshaking`，最终体积可能会更小
  - 包的体积 `9.63kb` 
  - `gzip` 压缩后 `3.7kb`

- 大幅度优化项目中的样式体积，主要通过以下两个方面支持
  - 样式共享的继承能力
  - 原子 `css` 的复用能力
- 对原子样式的能力的补充，提供简单的深度选择器能力



## 注意事项

- 只支持 `vite`
- 最新的文档，请以仓库中，最新版本为主，[点击跳转](https://github.com/usagisah/usacss/tree/main/packages/vue)



## 下载依赖

```sh
npm install @usacss/vue @usacss/vite-vue
```

`@usacss/vite-vue` 插件

`@usacss/vue` 核心库



## 配置具备动态能力的项目

首先请自行创建一个 `vue` 项目

### 配置 `vite.config.ts`

```ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { UsacssPlugin } from "@usacss/vite-vue"

export default defineConfig({
  plugins: [vue(), UsacssPlugin()]
})
```

在支持动态能力的情况下，配置插件会有更好的性能

插件会将样式文件编译成静态的样式规则，它会省去在浏览器处理的耗时

### 配置入口文件

```ts
import { createUsacssProvide } from "@usacss/vue"
import { createApp } from "vue"
import App from "./App.vue"

createUsacssProvide({ app: App }).then(({ UsacssProvide }) => {
  createApp(UsacssProvide).mount("#app")
})
```

通过  `createUsacssProvide` 创建一个上下文组件，内部会使用 `provide` 依赖注入一些必要的东西



## 创建原子样式的样式文件

所有以 `.style["js", "jsx", "ts", "tsx"]` 结尾的都会被当做样式文件尝试进行处理

在动态模式下，我们可以创建三种类型的原子样式的方式



### 动画

```ts
import { keyframes } from "@usacss/vue"
//写法1
export const route = keyframes("route", {
  "0%": {
    transform: "rotate(0deg)"
  },
  "100%": {
    transform: "rotate(360deg)"
  }
})
//写法2
export const route = keyframes("route", {
  "from": {
    transform: "rotate(0deg)"
  },
  "to": {
    transform: "rotate(360deg)"
  }
})
```

### 一般原子样式

```ts
import { atomStyle } from "@usacss/vue"
export const imgStyle = atomStyle({
  width: "120px",
  height: "120px",
  animation: "route 3s linear infinite"
})
```

### 伪类 和 元素伪类

以 `:` 开头会被当成伪类使用

```ts
export const inputStyle = atomStyle({
  width: "100%",
  color: {
    "::placeholder": "red",
    ":hover": "blue"
  }
})
```

### 媒体查询

以 `@media+空格` 开头的会被当成媒体查询 

```ts
export const containerStyle = atomStyle({
  background: {
    "@media screen and (max-width: 600px) ": "slateblue"
  }
})
```

### 媒体查询+伪类

满足媒体查询的开头，以`空格+&:+内容` 结尾的，会被当做伪类 

```ts
export const containerStyle = atomStyle({
  background: {
    "@media screen and (max-width: 600px) &:hover": "black"
  }
})
```

### 适配自定义主题

以 `@mode+空格` 开头会被当做是要适配主题，空格后的内容则是主题

```ts
export const containerStyle = atomStyle({
  boxShadow: {
    "@mode light": "0 0 20px 30px rgba(255, 255, 0, 0.5),inset 0 0 20px 30px rgba(255, 255, 0, 0.5)",
    "@mode dark": "0 0 20px 30px rgba(255, 0, 0, 0.5),inset 0 0 20px 30px rgba(0, 0, 0, 0.4)"
  }
})
```

### 适配自定义主题 + 伪类

满足适配主题的开头，以`空格+&:+内容` 结尾的，会被当做伪类 

```ts
export const containerStyle = atomStyle({
  boxShadow: {
    "@mode dark &:hover": "0 0 20px 30px rgba(255, 0, 0, 0.5),inset 0 0 20px 30px rgba(0, 0, 0, 0.4)"
  }
})
```



## 组件中使用

假设在 `App.vue` 同级有一个 `app.style.ts` 的样式文件

```vue
<script setup lang="ts">
import { useAtomStyle } from "@usacss/vue"
import { style1, style2, style3 } from "app.style"
</script>
<template>
	<div :class="useAtomStyle(style1, style2, style3)">
  	<h1>hello</h1>
 	</div>
</template>
```

在动态模式下，经过插件的编译，样式文件会被编译成完全静态的，只包含样式规则的文件

`useAtomStyle` 则会根据规则返回 `className` 原子样式类，并把样式插入到 `dom` 中

如果不使用插件，也可以正常工作，性能会有略微的损耗（原子 `css` 内部会缓存，大部分情况下可以忽略不计）



## 动态切换原子样式

```vue
<script setup lang="ts">
import { useAtomStyle } from "@usacss/vue"
import { style1, style2, style3 } from "app.style"
</script>
<template>
	<div :class="boolean ? useAtomStyle(style1) : useAtomStyle(style2, style3)">
  	<h1>hello</h1>
 	</div>
</template>
```

切换只需要看情况使用不同的规则即可



## `useAtomStyle` 动态创建原子样式

```vue
<script setup lang="ts">
import {keyframes, useAtomStyle } from "@usacss/vue"
  
const clsssName = useAtomStyle({
  //...
})
  
  
const route =  ("route", {
  "0%": {
    transform: "rotate(0deg)"
  },
  "100%": {
    transform: "rotate(360deg)"
  }
})
const clsssName = useAtomStyle(route, {
  //...
})
</script>
```

`useAtomStyle` 可以接收样式文件中 `atomStyle` 同样的参数直接创建

参数可以是任意数量个，接收类型有三种

- 样式规则 （主要来源于编译后的样式文件）
- 样式对象（这个例子中的裸写写法）
- 样式函数（未编译的样式文件）



## 在原子样式中创建样式变量

样式变量就是 `css` 样式变量，写法上裸写即可

```ts
//样式文件
export const style = atomStyle({
  "--c": "red"
})


//使用
export const style = atomStyle({
  "color": "var(--c, blue)"
})
```

### `useStyleVar`

每个人喜欢切换自定义主题的方式不同，可以使用框架提供的，也可以通过自定义样式变量实现

该辅助函数提供了操作节点样式变量的快捷操作

```ts
export interface StyleVarActions {
  has: (key: string) => boolean     //是否存在
  get: (key: string) => string      //获取
  set: (key: string, val: string) => void //设置
  del: (key: string) => void         //删除
}

export function useStyleVar(selector: string): StyleVarActions
export function useStyleVar(selector: string, key: string, value: string): StyleVarActions
export function useStyleVar(selector: string, ps: [string, string][]): StyleVarActions
```

内部会在 `nextTick` 中获取节点，如果节点找不到不报错，但所有操作都会失效



使用

```ts
import { useStyleVar } from "@usacss/vue"

//获取到节点，但不立即设置
const action = useStyleVar("body")

//获取到节点，立即设置单个
const action = useStyleVar("body", "c", "red")

//获取到节点，立即批量设置
const action = useStyleVar("body", [
  ["c", "red"], ["b", "pink"]
])


action.set("c", "blue")
action.has("c") //true
action.get("c") //blue
action.del("c") 
action.has("c") //false
```





## 自定义样式主题

样式主题的原理是，内部会将配置了，适配自定义主题的样式，编译成以下格式

`.适配的主题 .编译出的hash类名 { /*具体样式*/ }`

主题就是一个自定义的类名，只需要在父元素或者祖先元素上绑定主题类名，就会生效



### `useThemeMode`

大部分时候我们希望主题是全局的，所以可以把主题类名挂载 `body/html` 上，可是在组件内部操作会比价麻烦，使用辅助函数 `useThemeMode` 可以轻松做到

类型声明如下

```ts
type useThemeMode(
	selector: string,  //document.querySelector 的参数
	mode?: string | null | undefined
	unMount?: boolean  //默认是 false，组件卸载时是否清除
): ShallowRef<string | null>
```

内部会在 `nextTick` 时获取 `dom` 节点，并设置主题为 `mode`

返回一个 `ref`，当修改内容时会自动同步到节点，赋值成 `null` 表示移除



使用

```ts
import { useThemeMode } from "@usacss/vue"

//获取但不立即创建
const mode = useThemeMode("body")
//获取 并且立即创建
const mode = useThemeMode("body", "dark")、

mode.value = "light" //修改
mode.value = null //移除
```





## `useDeepStyle` 深度选择器样式

深度选择器会动态创建 `style` 标签并计算 `hash` 类名，这点和其他 `CSS-in-JS` 一样，不一样的是，不支持样式嵌套

如果要支持样式嵌套，就需要引入一个巨大的样式编译器，计算 `hash` 也会更加的耗时。如果只支持普通的样式嵌套，不通过专业的编译器，边界情况和代码量都会陡增

原则上还是推荐原子样式，支持深度选择还要支持样式嵌套，对于整体收益的一定是弊端严重大于收益的



### 基本写法

```ts
const [css1, setStyle] = useDeepStyle({
  select: ".el-input__inner",
  border: "1px solid red"
})
```

编译出来格式类似于  `.hash .el-input__inner{border: "1px solid red"}`

`select` 是放在哈希类名后的选择器

其他样式会被简单的拼接后放入节点中

返回内容是一个数组，第一个是哈希类名，第二个是个修改器

修改器参数和 `useDeepStyle` 一样

### 伪类

```ts
const [css1, setStyle] = useDeepStyle({
  select: ".el-input__inner",
  ":hover": {
    border: "1px solid red"
  }
})
```

以 `:` 开头的会被当做是伪元素，值是伪类下的多条样式

### 这里也可以使用 css 变量

```ts
import { useDeepStyle } from "@usacss/vue"
const randomNum = () => (Math.random() * 255) >>> 0
const [css1, setStyle] = useDeepStyle()
const setInputDeepStyle = () => {
  setStyle({
    select: ".el-input__inner",
    color: `var(--c, rgb(${randomNum()},${randomNum()},${randomNum()}))`,
  })
}
```



## 配置 0js 的静态样式项目

### 配置 `vite.config.ts`

配置插件 `static: true` 即可

```ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { UsacssPlugin } from "@usacss/vite-vue"

export default defineConfig({
  plugins: [vue(), UsacssPlugin({ static: true })]
})
```

### 配置入口文件

```ts
import { createApp } from "vue"
import App from "./App.vue"
import "virtual:usacss"
createApp(App).mount("#app")
```

这里就不需要 `createUsacssProvide` 来创建上下文了，插件会将用到的样式文件编译成样式，替换掉 `virtual:usacss`

### 样式文件

既然是 0js，那就不能用 `useDeepStyle` 动态创建深度样式了

此时我们可以在样式文件中用 `deepStyle` 来做下位替代

```ts
import { atomStyle, deepStyle, keyframes } from "@usacss/vue"
export const route = keyframes("route", {
  "0%": {
    transform: "rotate(0deg)"
  },
  "100%": {
    transform: "rotate(360deg)"
  }
})
export const imgStyle = atomStyle({
  width: "120px",
  height: "120px",
  animation: "route 3s linear infinite"
})
export const deepInputStyle = deepStyle({
  select: ".el-input__inner",
  color: `red`
})
```

### 使用

```vue
<script setup>
import { route, imgStyle, deepInputStyle } from "./xxx.style"
</script>
<template>
<img src :class="[route, imgStyle, deepInputStyle]" />
</template>
```

配置静态生成后，样式文件的导出就是，已经生成好的，样式的哈希类名，所以直接绑定即可

实际的样式文件内容都在虚拟文件 `virtual:usacss` 中



## 服务端渲染

服务端渲染要做的事情某种程度上和插件做的事非常相像

0js 的原理是只使用生成好的样式，但不用实际的样式函数，否则就是动态的

**服务端渲染使用插件的静态模式会部分失效，因为动态替换虚拟文件到实际样式的行为，需要依赖服务器完成**

接下来我们来配置一个支持动态的方案

### 配置入口文件

```ts
//client.entry.ts
createUsacssProvide({ app: App, hydrate: true }).then(({ UsacssProvide }) => {
  const app = createSSRApp(UsacssProvide)
  app.mount("#app")
})

//server.entry.ts
export async function render() {
  const { UsacssProvide, sheet } = await createUsacssProvide({ app: App })
  
  //流式渲染
  const stream = renderToWebStream(createSSRApp(UsacssProvide), {})
  return { stream, sheet }
  
  //字符串渲染
  return {
    content: renderToString(createSSRApp(UsacssProvide), {}),
    sheet
  }
}
```

如果是浏览器端，请配置 `hydrate: true`

服务器端，请把返回参数中的 `sheet` 拿出来使用，它是内部用来管理样式规则的实例

### 配置服务器的返回

假设我们的服务器用 `express` 搭建

```ts
import express from 'express'
const app = express()
app.use("*", async (req, res) => {
  //... 省略一些前置内容
  
  //流式渲染
  const { content, sheet } = await render(url, ssrManifest)
  const [htmlStart, htmlEnd] = template.split('<!--app-html-->')
  res.status(200).set({ 'Content-Type': 'text/html' })
  res.write(htmlStart)
  for await (const chunk of stream) {
    if (res.closed) break
    res.write(chunk)
  }
  res.write(htmlEnd)
  res.write(sheet.toHTMLString())
  res.end()
  
  //字符串渲染
  const { content, sheet } = await render(url, ssrManifest)
  const html = template
  	.replace("<!--app-css-->", sheet.toHTMLString())
  	.replace("<!--app-html-->", html)
 	res.end(html)
})
```

通过实例的  `sheet` 的方法 `.toHTMLString` 可以生成能够被水合的 `css` 样式标签内容

### 其他内容

保持不变



## 样式规则继承

规则继承需要用到作为实例的 `sheet`，项目中通过 `createUsacssProvide` 的返回值获取

内部提供了 3 中导出方法

- `.toString` 返回不能水合的，纯静态样式
- `.toHTMLString` 返回能水合的，纯静态样式
- `.toJson` 返回内部样式规则序列化成 json 的对象

### 静态继承

可以用 `toString` 打成静态样式，给用户直接引入

### 动态继承 

`.toJson` 打成 json 交给要继承的项目中

然后使用实例的插入规则方法插入

```ts
//ui 库
export const rules = sheet.toJson()

//使用
sheet.insertAtomRules(rules.atomRules)
sheet.insertDeepRules(rules.deepRules)
```

### 0js模式下在插件中配置

```ts
import {rules} from "lib"
defineConfig({
  rules: [UsacssPlugin({ static: true, rules })]
})
```

### 项目中手动继承

```ts
import {rules} from "lib"
createUsacssProvide({ app: App }).then(({ UsacssProvide, sheet }) => {
	sheet.insertAtomRules(rules.atomRules)
	sheet.insertDeepRules(rules.deepRules)

  const app = createApp(UsacssProvide)
  app.mount("#app")
})
```

