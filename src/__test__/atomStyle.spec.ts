import { AtomRule, ClientStyleSheet } from "../ClientStyleSheet"
import { AtomStyleConfig, atomStyle } from "../atomStyle"
import { getStyleSheet, setStyleSheet } from "../styleSheet"

beforeEach(() => {
  setStyleSheet(new ClientStyleSheet())
})

describe("atomStyle", () => {
  const config: AtomStyleConfig = {
    button: {
      width: "100px",
      height: {
        value: "200px",
        ":hover": "3vh"
      }
    }
  }
  it("basic", () => {
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
      $delete: expect.anything()
    })
  })

  it("is it the some when used again", () => {
    const s1 = atomStyle(config).style
    const s2 = atomStyle(config).style
    expect(s1).toEqual(s2)
  })

  it("dom style content", () => {
    const res = atomStyle(config).style.button
    const rules: AtomRule[] = getStyleSheet().atomRules
    expect(rules.find(r => r.key === "width")).toEqual({ key: "width", hash: res.width })
    expect(rules.find(r => r.key === "height")).toEqual({ key: "height", hash: res.height })
    expect(rules.find(r => r.key === "height:hover")).toEqual({ key: "height:hover", hash: res["height:hover"] })
  })

  it("delete", () => {
    const res = atomStyle(config)
    res.$delete("button")
    const rules: AtomRule[] = getStyleSheet().atomRules
    expect(rules.length).toBe(0)
  })
})