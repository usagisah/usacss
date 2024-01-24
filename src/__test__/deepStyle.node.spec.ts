import { ClientDeepStyleRule, NodeDeepMapRule, deepStyle } from "../index"
import { getStyleSheet, setNodeStyleSheet } from "../styleSheet"

beforeEach(() => {
  setNodeStyleSheet()
})

describe("deepStyle.node", () => {
  const deepStyleConfig = {
    select: [".c1", ".c2"],
    width: "100px",
    fontSize: "12px",
    ":hover": {
      color: "pink"
    }
  }

  it("base", () => {
    const res = deepStyle(deepStyleConfig)
    expect(res).toEqual({
      t: 2,
      __$usa_style_: true,
      $delete: expect.any(Function),
      className: expect.any(String)
    })
    expect(res.className.split(" ").length).toBe(2)
  })

  it("is it the some when used again", () => {
    const s1 = deepStyle(deepStyleConfig).className
    const s2 = deepStyle(deepStyleConfig).className
    expect(s1).toEqual(s2)
  })

  it("dom style content", () => {
    const { className } = deepStyle(deepStyleConfig)
    const rules: Map<string, NodeDeepMapRule> = getStyleSheet().deepRules
    const [styleCls, pseudoCls] = className.split(" ").map(s => s.trim())
    expect(rules.get(styleCls).content).toBe(`.${styleCls} .c1 .c2{width:100px;font-size:12px;}`)
    expect(rules.get(pseudoCls).content).toBe(`.${pseudoCls} .c1 .c2:hover{color:pink;}`)
  })

  it("delete", () => {
    const { $delete } = deepStyle(deepStyleConfig)
    $delete()
    const rules: Map<string, ClientDeepStyleRule> = getStyleSheet().deepRules
    expect(rules.size).toBe(0)
  })
})
