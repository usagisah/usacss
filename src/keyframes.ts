import { Properties } from "csstype"

export type Keyframes =
  | { name?: string }
  | {
      from: Properties
      to: Properties
    }
  | Record<`${number}%`, Properties>

export function keyframes(name: string, frames: Keyframes) {}

/* 
keyframes("route", {
  from: {}
  to: {}
})

keyframes({
  route: {
    from:{}
    to:{}
  }
  scale: {
    0%:{}
    100:{}
  }
})
*/
