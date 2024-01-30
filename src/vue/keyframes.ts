import { KeyframesStyleConfig, UsaStyleSheet, keyframes as _keyframes } from "../index.js"
export function keyframes(name: string, frames: KeyframesStyleConfig) {
  return (sheet: UsaStyleSheet) => {
    _keyframes(name, frames, sheet)
  }
}
