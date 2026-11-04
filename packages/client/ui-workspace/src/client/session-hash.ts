/** Browser-hash route for the selected Session and its Conversation View. */
import { SessionId } from '@deepseek-ai/dsh-session/types'

/** Prefix identifying a Session route in the browser hash. */
const SESSION_HASH_PREFIX = '#/session/'

/** One Session route parsed from the browser hash. */
export interface SessionHashRoute {
  /** Selected Session identity. */
  readonly sessionId: SessionId
  /** Selected Conversation View identity; absent when the route names only a Session. */
  readonly view?: string
}

/**
 * Parse a browser hash into a Session route.
 * @param hash - fragment such as `#/session/<id>/trajectory`.
 * @returns the parsed route, or undefined when the hash is not a Session route.
 */
export function parseSessionHash(hash: string): SessionHashRoute | undefined {
  if (!hash.startsWith(SESSION_HASH_PREFIX)) return undefined
  const segments = hash.slice(SESSION_HASH_PREFIX.length).split('/')
  const rawSessionId = segments[0]
  if (rawSessionId === undefined || rawSessionId === '') return undefined
  const rawView = segments[1]
  try {
    const sessionId = SessionId(decodeURIComponent(rawSessionId))
    const view = rawView === undefined || rawView === '' ? undefined : decodeURIComponent(rawView)
    return { sessionId, ...(view === undefined ? {} : { view }) }
  } catch {
    return undefined
  }
}

/**
 * Build the browser hash for one Session route.
 * @param sessionId - selected Session.
 * @param view - selected Conversation View; absent names only the Session.
 * @returns the fragment, including its leading `#`.
 */
export function sessionHash(sessionId: SessionId, view?: string): string {
  const session = encodeURIComponent(sessionId)
  return view === undefined || view === ''
    ? `${SESSION_HASH_PREFIX}${session}`
    : `${SESSION_HASH_PREFIX}${session}/${encodeURIComponent(view)}`
}

/**
 * Read the Session route from the current browser hash.
 * @returns the parsed route, or undefined outside a browser or for an unrelated hash.
 */
export function readSessionHash(): SessionHashRoute | undefined {
  return typeof window === 'undefined' ? undefined : parseSessionHash(window.location.hash)
}

/**
 * Replace the current browser hash without adding a history entry.
 * @param hash - fragment to write.
 */
export function replaceSessionHash(hash: string): void {
  if (typeof window === 'undefined') return
  if (window.location.hash === hash) return
  try {
    window.history.replaceState(window.history.state, '', hash)
  } catch {
    // A browser that refuses history writes keeps the current URL; navigation still works.
  }
}
