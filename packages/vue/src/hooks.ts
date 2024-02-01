import { ShallowRef, nextTick, onUnmounted, shallowRef, watch } from "vue"

function setElementClass(el: Element | null, mode?: string, oMode?: string) {
  if (!el) {
    return
  }
  if (!mode) {
    return oMode && el.classList.remove(oMode)
  }
  if (oMode) {
    el.classList.remove(oMode)
  }
  const has = el.classList.contains(mode)
  if (!has) {
    el.classList.add(mode)
  }
}
export function useThemeMode(selector: string, mode?: string | null): ShallowRef<string | null> {
  const m = shallowRef<string | null | undefined>(mode)
  let el: Element | null
  nextTick(() => {
    el = document.querySelector(selector)
    setElementClass(el, mode)
  })
  onUnmounted(() => setElementClass(el, null, m.value))

  watch(m, (mode, oMode) => {
    if (!el) return
    setElementClass(el, mode, oMode)
  })
  return m
}

export interface StyleVarActions {
  has: (key: string) => boolean
  get: (key: string) => string
  set: (key: string, val: string) => void
  del: (key: string) => void
}
export function useStyleVar(selector: string): StyleVarActions
export function useStyleVar(selector: string, key: string, value: string): StyleVarActions
export function useStyleVar(selector: string, ps: [string, string][]): StyleVarActions
export function useStyleVar(selector: string, p1?: any, p2?: any) {
  const ps: [string, string][] = []
  if (p2) {
    ps.push([p1, p2])
  } else if (Array.isArray(p1)) {
    ps.push(...p1)
  }

  let el: HTMLElement | null
  nextTick(() => {
    el = document.querySelector(selector)
    ps.forEach(v => setElementStyleVar(v[0], v[1]))
  })

  function setElementStyleVar(key: string, val: string) {
    if (!el) return
    el.style.setProperty(`--${key}`, val)
  }
  function getElementStyleVar(key: string) {
    if (!el) return ""
    return getComputedStyle(el).getPropertyValue(`--${key}`)
  }
  function delElementStyleVar(key: string) {
    if (!el) return
    el.style.removeProperty(`--${key}`)
  }

  return {
    has(k: string) {
      return !!getElementStyleVar(k)
    },
    get: getElementStyleVar,
    set: setElementStyleVar,
    del: delElementStyleVar
  }
}
