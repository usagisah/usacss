import { ClientStyleSheet } from "../ClientStyleSheet"
import { atomStyle } from "../atomStyle"
import { setStyleSheet } from "../styleSheet"

beforeEach(() => {
  setStyleSheet(new ClientStyleSheet())
})

describe("atomStyle", () => {
  it("basic", () => {
    const res = atomStyle({
      btn: {
        width: "100px",
        height: {
          value: "200px",
          ":hover": "3vh"
        }
      }
    })
    expect(res).toEqual({
      t: 1,
      __$usa_style_: true,
      btn: {
        width: expect.any(String),
        height: expect.any(String),
        "height:hover": expect.any(String)
      }
    })
  })
})
