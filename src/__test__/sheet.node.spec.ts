import { AtomStyleConfig, NodeStyleSheet, atomStyle, deepStyle } from "../"
import { getStyleSheet, setStyleSheet } from "../styleSheet"

describe("sheet.node", () => {
  beforeEach(() => {
    setStyleSheet(new NodeStyleSheet())
  })

  const atomConfig: AtomStyleConfig = {
    button: {
      width: "100px",
      height: {
        value: "200px",
        ":hover": "3vh"
      }
    }
  }

  const deepStyleConfig = {
    select: [".c1", ".c2"],
    width: "100px",
    fontSize: "12px",
    ":hover": {
      color: "pink"
    }
  }

  it("atomStyleToString", () => {
    const r = atomStyle(atomConfig).style.button
    const sheet = getStyleSheet() as NodeStyleSheet
    expect(sheet.atomStyleToString()).toBe(`.${r.width}{width:100px}.${r.height}{height:200px}.${r["height:hover"]}{height:3vh}`)
  })

  it("deepStyleToString", () => {
    const { className } = deepStyle(deepStyleConfig)
    const [styleCls, pseudoCls] = className.split(" ").map(s => s.trim())
    const sheet = getStyleSheet() as NodeStyleSheet
    expect(sheet.deepStyleToString()).toBe(`.${styleCls} .c1 .c2{width:100px;font-size:12px;}.${pseudoCls} .c1 .c2:hover{color:pink;}`)
  })

  it("styleToString", () => {
    const a = atomStyle(atomConfig).style.button
    const atomStr = `.${a.width}{width:100px}.${a.height}{height:200px}.${a["height:hover"]}{height:3vh}`

    const { className } = deepStyle(deepStyleConfig)
    const [styleCls, pseudoCls] = className.split(" ").map(s => s.trim())
    const deepStr = `.${styleCls} .c1 .c2{width:100px;font-size:12px;}.${pseudoCls} .c1 .c2:hover{color:pink;}`

    const sheet = getStyleSheet() as NodeStyleSheet
    expect(sheet.styleToString()).toBe(atomStr + deepStr)
  })

  it("styleToJson", () => {
    const a = atomStyle(atomConfig).style.button

    const { className } = deepStyle(deepStyleConfig)
    const [styleCls, pseudoCls] = className.split(" ").map(s => s.trim())

    const sheet = getStyleSheet() as NodeStyleSheet
    expect(sheet.styleToJson()).toEqual({
      atom: [
        {
          key: "width",
          hash: a.width,
          content: `.${a.width}{width:100px}`
        },
        {
          key: "height",
          hash: a.height,
          content: `.${a.height}{height:200px}`
        },
        {
          key: "height:hover",
          hash: a["height:hover"],
          content: `.${a["height:hover"]}{height:3vh}`
        }
      ],
      deep: [
        [styleCls, { content: `.${styleCls} .c1 .c2{width:100px;font-size:12px;}` }],
        [pseudoCls, { content: `.${pseudoCls} .c1 .c2:hover{color:pink;}` }]
      ]
    })
  })
})
