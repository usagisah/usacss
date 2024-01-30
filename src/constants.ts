export const atomStyleTag = "data-u-atom"
export const deepStyleTag = "data-u-deep"

export const atomHtmlTag = "data-u-ahtml"
export const deepHtmlTag = "data-u-dhtml"

export const styleContentHashPlaceholder = `__#:h#`

export const deepStyleSelectReg = /\s([a-zA-Z])/
export const deepStyleContentHashReg = new RegExp(styleContentHashPlaceholder, "g")

export const mediaPseudoReg = /\s&(?=:+\w+$)/

export const blankReg = /\s/g

export const enum StyleRuleType {
  atom,
  deep,
  keyframes,
  mediaQuery
}
