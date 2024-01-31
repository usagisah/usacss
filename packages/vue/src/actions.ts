import { inject } from "vue"
import { CSSContext, cssContextKey } from "./context.js"

export type DeleteAtomStyle = (cls: string[]) => void
export type DeleteDeepStyle = (cls: (string | { class: string; force: boolean })[]) => void
export type StyleSheetActions = {
  deleteAtomStyle: DeleteAtomStyle
  deleteDeepStyle: DeleteDeepStyle
}

export function useStyleSheetActions(): StyleSheetActions {
  const { sheet } = inject<CSSContext>(cssContextKey)!
  const deleteAtomStyle: DeleteAtomStyle = cls => {
    sheet.deleteAtomStyle(cls)
  }
  const deleteDeepStyle: DeleteDeepStyle = cls => {
    sheet.deleteDeepStyle(cls)
  }
  return { deleteAtomStyle, deleteDeepStyle }
}
