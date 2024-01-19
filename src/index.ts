export { atomStyle } from "./atomStyle"
export type { AtomStyleAction, AtomStyleConfig, AtomStyleDelete } from "./atomStyle"

export { deepStyle } from "./deepStyle"
export type { DeepStyleAction, DeepStyleConfig, DeepStyleDelete } from "./deepStyle"

export type { AtomStyleClassNames, DeppStyleClassNames } from "./style.type"

import { ClientStyleSheet } from "./ClientStyleSheet"
import { setStyleSheet } from "./styleSheet"
setStyleSheet(new ClientStyleSheet())
