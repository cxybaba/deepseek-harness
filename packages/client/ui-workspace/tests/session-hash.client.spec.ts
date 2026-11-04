// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import {
  parseSessionHash, readSessionHash, replaceSessionHash, sessionHash, viewHash,
} from '../src/client/session-hash.ts'

const SID = SessionId('om_x100b619b537')

describe('Session hash route', () => {
  it('round-trips a View and Session through the hash', () => {
    expect(sessionHash(SID, 'trajectory')).toBe('#/session/trajectory/om_x100b619b537')
    expect(parseSessionHash(sessionHash(SID, 'trajectory'))).toEqual({ view: 'trajectory', sessionId: SID })
  })

  it('parses view-only and explicit routes', () => {
    expect(viewHash('trajectory')).toBe('#/session/trajectory')
    expect(parseSessionHash('#/session/trajectory')).toEqual({ view: 'trajectory' })
    expect(sessionHash(SID, 'chat')).toBe('#/session/chat/om_x100b619b537')
    expect(parseSessionHash('#/session/chat/om_x100b619b537')).toEqual({ view: 'chat', sessionId: SID })
    expect(parseSessionHash('#/other/om_x100b619b537')).toBeUndefined()
    expect(parseSessionHash('#/session/')).toBeUndefined()
    expect(parseSessionHash('#/session/trajectory/')).toBeUndefined()
    expect(parseSessionHash('#/session/chat/om_x100b619b537/extra')).toBeUndefined()
  })

  it('decodes escaped View and Session identities', () => {
    const escaped = SessionId('session/with space')
    const hash = sessionHash(escaped, 'view/one')
    expect(hash).toBe('#/session/view%2Fone/session%2Fwith%20space')
    expect(parseSessionHash(hash)).toEqual({ view: 'view/one', sessionId: escaped })
  })

  it('rejects malformed escapes', () => {
    expect(parseSessionHash('#/session/%E0%A4%A')).toBeUndefined()
    expect(parseSessionHash('#/session/ok/%E0%A4%A')).toBeUndefined()
  })

  it('reads and replaces the current browser hash', () => {
    window.history.replaceState(null, '', '/')
    expect(readSessionHash()).toBeUndefined()
    replaceSessionHash(sessionHash(SID, 'trajectory'))
    expect(window.location.hash).toBe('#/session/trajectory/om_x100b619b537')
    expect(readSessionHash()).toEqual({ view: 'trajectory', sessionId: SID })
    replaceSessionHash(sessionHash(SID, 'trajectory'))
    expect(window.location.hash).toBe('#/session/trajectory/om_x100b619b537')
  })

  it('keeps the current hash when history refuses the write', () => {
    window.history.replaceState(null, '', '/')
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
      throw new Error('history denied')
    })
    expect(() => { replaceSessionHash(sessionHash(SID, 'chat')) }).not.toThrow()
    expect(window.location.hash).toBe('')
    replaceState.mockRestore()
  })
})
