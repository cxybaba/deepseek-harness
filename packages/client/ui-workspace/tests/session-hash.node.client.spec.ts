import { describe, expect, it } from 'vitest'
import { readSessionHash, replaceSessionHash } from '../src/client/session-hash.ts'

describe('Session hash route outside a browser', () => {
  it('ignores the hash without a window', () => {
    expect(readSessionHash()).toBeUndefined()
    expect(() => { replaceSessionHash('#/session/anything') }).not.toThrow()
  })
})
