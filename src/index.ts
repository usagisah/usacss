export { atomStyle } from "./atomStyle"
export type { AtomStyleAction, AtomStyleConfig, AtomStyleDelete } from "./atomStyle"

export { deepStyle } from "./deepStyle"
export type { DeepStyleAction, DeepStyleConfig, DeepStyleDelete } from "./deepStyle"

export type { ClientAtomStyleRule, ClientDeepStyleRule, NodeAtomStyleRule, NodeDeepMapRule, NodeDeepObjRule, NodeDeepStyleRule } from "./style.type"

export { ClientStyleSheet } from "./ClientStyleSheet"
export { NodeStyleSheet } from "./NodeStyleSheet"

import { ClientStyleSheet } from "./ClientStyleSheet"
import { setStyleSheet } from "./styleSheet"
setStyleSheet(new ClientStyleSheet())
