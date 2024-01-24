import { ClientDeepStyleRule, deepStyle } from "../index"
import { getStyleSheet, setClientStyleSheet } from "../styleSheet"

beforeEach(() => {
  setClientStyleSheet()
})

describe("deepStyle.client", () => {
  const deepStyleConfig = {
    select: [".c1", ".c2"],
    width: "100px",
    height: "100vh",
    ":hover": {
      width: "200px",
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
    const rules: Map<string, ClientDeepStyleRule> = getStyleSheet().deepRules
    const [styleCls, pseudoCls] = className.split(" ").map(s => s.trim())
    expect(rules.get(styleCls).el.textContent).toBe(`.${styleCls} .c1 .c2{width:100px;height:100vh;}`)
    expect(rules.get(pseudoCls).el.textContent).toBe(`.${pseudoCls} .c1 .c2:hover{width:200px;color:pink;}`)
  })

  it("delete", () => {
    const { $delete } = deepStyle(deepStyleConfig)
    $delete()
    const rules: Map<string, ClientDeepStyleRule> = getStyleSheet().deepRules
    expect(rules.size).toBe(0)
  })
})
