// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import {
  parseSessionHash, readSessionHash, replaceSessionHash, sessionHash,
} from '../src/client/session-hash.ts'

const SID = SessionId('om_x100b619b537')

describe('Session hash route', () => {
  it('round-trips a Session and View through the hash', () => {
    expect(sessionHash(SID, 'trajectory')).toBe('#/session/om_x100b619b537/trajectory')
    expect(parseSessionHash(sessionHash(SID, 'trajectory'))).toEqual({ sessionId: SID, view: 'trajectory' })
  })

  it('omits an absent View and ignores unrelated hashes', () => {
    expect(sessionHash(SID)).toBe('#/session/om_x100b619b537')
    expect(parseSessionHash('#/session/om_x100b619b537')).toEqual({ sessionId: SID })
    expect(parseSessionHash('#/other/om_x100b619b537')).toBeUndefined()
    expect(parseSessionHash('#/session/')).toBeUndefined()
  })

  it('decodes escaped Session and View identities', () => {
    const escaped = SessionId('session/with space')
    const hash = sessionHash(escaped, 'view/one')
    expect(hash).toBe('#/session/session%2Fwith%20space/view%2Fone')
    expect(parseSessionHash(hash)).toEqual({ sessionId: escaped, view: 'view/one' })
  })

  it('rejects malformed escapes', () => {
    expect(parseSessionHash('#/session/%E0%A4%A')).toBeUndefined()
    expect(parseSessionHash('#/session/ok/%E0%A4%A')).toBeUndefined()
  })

  it('reads and replaces the current browser hash', () => {
    window.history.replaceState(null, '', '/')
    expect(readSessionHash()).toBeUndefined()
    replaceSessionHash(sessionHash(SID, 'trajectory'))
    expect(window.location.hash).toBe('#/session/om_x100b619b537/trajectory')
    expect(readSessionHash()).toEqual({ sessionId: SID, view: 'trajectory' })
    replaceSessionHash(sessionHash(SID, 'trajectory'))
    expect(window.location.hash).toBe('#/session/om_x100b619b537/trajectory')
  })

  it('keeps the current hash when history refuses the write', () => {
    window.history.replaceState(null, '', '/')
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
      throw new Error('history denied')
    })
    expect(() => { replaceSessionHash(sessionHash(SID)) }).not.toThrow()
    expect(window.location.hash).toBe('')
    replaceState.mockRestore()
  })
})
