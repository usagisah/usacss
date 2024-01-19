import { ClientStyleSheet, DeepRule } from "../ClientStyleSheet"
import { deepStyle } from "../deepStyle"
import { getStyleSheet, setStyleSheet } from "../styleSheet"

beforeEach(() => {
  setStyleSheet(new ClientStyleSheet())
})

describe("deepStyle", () => {
  const deepStyleConfig = {
    button: {
      select: [".c1", ".c2"],
      width: "100px",
      height: "100vh",
      ":hover": {
        width: "200px",
        color: "pink"
      }
    }
  }

  it("base", () => {
    const res = deepStyle(deepStyleConfig)
    expect(res).toEqual({
      t: 2,
      __$usa_style_: true,
      $delete: expect.anything(),
      style: {
        button: { style: expect.any(String), pseudo: expect.any(String) }
      }
    })
  })

  it("is it the some when used again", () => {
    const s1 = deepStyle(deepStyleConfig).style
    const s2 = deepStyle(deepStyleConfig).style
    expect(s1).toEqual(s2)
  })

  it("dom style content", () => {
    const { style, pseudo } = deepStyle(deepStyleConfig).style.button
    const rules: Map<string, DeepRule> = getStyleSheet().deepRules
    expect(rules.get(style).content).toBe(`.${style} .c1 .c2{width:100px;height:100vh;}`)
    expect(rules.get(pseudo).content).toBe(`.${pseudo}:hover .c1 .c2{width:200px;color:pink;}`)
  })

  it("delete", () => {
    const { $delete } = deepStyle(deepStyleConfig)
    $delete("button")
    const rules: Map<string, DeepRule> = getStyleSheet().deepRules
    expect(rules.size).toBe(0)
  })
})
