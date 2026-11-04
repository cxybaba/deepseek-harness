/** Browser-hash route for the selected Session and its Conversation View. */
import { SessionId } from '@deepseek-ai/dsh-session/types'

/** Prefix identifying a Session route in the browser hash. */
const SESSION_HASH_PREFIX = '#/session/'

/** One Session route parsed from the browser hash. */
export interface SessionHashRoute {
  /** Explicit Session identity; absent when the route names only a View for the current Session. */
  readonly sessionId?: SessionId
  /** Selected Conversation View identity. */
  readonly view?: string
}

/**
 * Parse a browser hash into a Session route.
 * @param hash - fragment such as `#/session/trajectory` or `#/session/trajectory/<id>`.
 * @returns the parsed route, or undefined when the hash is not a Session route.
 */
export function parseSessionHash(hash: string): SessionHashRoute | undefined {
  if (!hash.startsWith(SESSION_HASH_PREFIX)) return undefined
  const segments = hash.slice(SESSION_HASH_PREFIX.length).split('/')
  const rawView = segments[0]
  if (rawView === undefined || rawView === '') return undefined
  if (segments.length > 2) return undefined
  try {
    const view = decodeURIComponent(rawView)
    if (segments.length === 1) return { view }
    const rawSessionId = segments[1]
    if (rawSessionId === undefined || rawSessionId === '') return undefined
    return { view, sessionId: SessionId(decodeURIComponent(rawSessionId)) }
  } catch {
    return undefined
  }
}

/**
 * Build the browser hash for one View on the current Session.
 * @param view - selected Conversation View identity.
 * @returns the fragment, including its leading `#`.
 */
export function viewHash(view: string): string {
  return `${SESSION_HASH_PREFIX}${encodeURIComponent(view)}`
}

/**
 * Build the browser hash for one explicit Session route.
 * @param sessionId - selected Session.
 * @param view - selected Conversation View identity.
 * @returns the fragment, including its leading `#`.
 */
export function sessionHash(sessionId: SessionId, view: string): string {
  return `${SESSION_HASH_PREFIX}${encodeURIComponent(view)}/${encodeURIComponent(sessionId)}`
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
