import { AtomStyleConfig, NodeAtomStyleRule, atomStyle } from "../index"
import { getStyleSheet, setNodeStyleSheet } from "../styleSheet"

beforeEach(() => {
  setNodeStyleSheet()
})

describe("atomStyle.node", () => {
  const config: AtomStyleConfig = {
    button: {
      width: "100px",
      height: {
        value: "200px",
        ":hover": "3vh"
      }
    }
  }

  it("base", () => {
    const res = atomStyle(config)
    expect(res).toEqual({
      t: 1,
      __$usa_style_: true,
      style: {
        button: {
          width: expect.any(String),
          height: expect.any(String),
          "height:hover": expect.any(String)
        }
      },
      $delete: expect.any(Function)
    })
  })

  it("is it the some when used again", () => {
    const s1 = atomStyle(config).style
    const s2 = atomStyle(config).style
    expect(s1).toEqual(s2)
  })

  it("dom style content", () => {
    const res = atomStyle(config).style.button
    const rules: NodeAtomStyleRule[] = getStyleSheet().atomRules
    expect(rules.find(r => r.key === "width")).toEqual({ key: "width", hash: res.width, content: `.${res.width}{width:100px}` })
    expect(rules.find(r => r.key === "height")).toEqual({ key: "height", hash: res.height, content: `.${res.height}{height:200px}` })
    expect(rules.find(r => r.key === "height:hover")).toEqual({ key: "height:hover", hash: res["height:hover"], content: `.${res["height:hover"]}{height:3vh}` })
  })

  it("delete", () => {
    const res = atomStyle(config)
    res.$delete("button")
    const rules: NodeAtomStyleRule[] = getStyleSheet().atomRules
    expect(rules.length).toBe(0)
  })
})
