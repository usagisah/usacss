export function isPlainObject(v: unknown): v is Record<string, any> {
  return Object.prototype.toString.call(v) === "[object Object]"
}

const _camelToKebabReg = /([a-z])([A-Z])/g
export function camelToKebab(camelCase: string) {
  return camelCase.replace(_camelToKebabReg, "$1-$2").toLowerCase()
}

/**
 * 引用自 murmurhash
 */
const createBuffer = (val: string) => new TextEncoder().encode(val)
const randomSeed = (Math.random() * 100 + 100) >>> 0
export function murmurHash(str: string | Uint8Array, seed = randomSeed): string {
  if (typeof str === "string") str = createBuffer(str)
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k

  while (l >= 4) {
    k = (str[i] & 0xff) | ((str[++i] & 0xff) << 8) | ((str[++i] & 0xff) << 16) | ((str[++i] & 0xff) << 24)

    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)
    k ^= k >>> 24
    k = (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16)

    h = ((h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k

    l -= 4
    ++i
  }

  switch (l) {
    case 3:
      h ^= (str[i + 2] & 0xff) << 16
    case 2:
      h ^= (str[i + 1] & 0xff) << 8
    case 1:
      h ^= str[i] & 0xff
      h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  }

  h ^= h >>> 13
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)
  h ^= h >>> 15

  return (h >>> 0).toString(16)
}

let count = randomSeed
export function generateRandomHash() {
  return murmurHash((count++).toString())
}

export const deepSelectReg = /\s([a-zA-Z])/