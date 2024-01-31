import { KeyframesStyleConfig, UsaStyleSheet, keyframes as _keyframes } from "@usacss/core"
export function keyframes(name: string, frames: KeyframesStyleConfig) {
  return ((sheet: UsaStyleSheet) => {
    return _keyframes(name, frames, sheet)
  }) as any as string
}
