export function isPlainObject(v: unknown): v is Record<string, any> {
  return Object.prototype.toString.call(v) === "[object Object]"
}

const _camelToKebabReg = /([a-z])([A-Z])/g
export function camelToKebab(camelCase: string) {
  return camelCase.replace(_camelToKebabReg, "$1-$2").toLowerCase()
}

export const deepSelectReg = /\s([a-zA-Z])/

export const EmptyFunc = () => {}
