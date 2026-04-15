/**
 * Token storage — uses localStorage with silent in-memory fallback.
 *
 * Does a ONE-TIME check on module load to determine if localStorage
 * is available. Avoids repeated probing that generates console errors.
 */

const TOKEN_KEY = 'mingle-token'

// In-memory fallback
let _memToken: string | null = null

// One-time check: is localStorage usable?
let _useLocalStorage = false
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('__ls_test__', '1')
    window.localStorage.removeItem('__ls_test__')
    _useLocalStorage = true
  }
} catch {
  // Silently fall back to in-memory
}

export function getToken(): string | null {
  if (_useLocalStorage) {
    return localStorage.getItem(TOKEN_KEY)
  }
  return _memToken
}

export function setToken(token: string): void {
  if (_useLocalStorage) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  // Always keep in-memory copy as backup
  _memToken = token
}

export function removeToken(): void {
  if (_useLocalStorage) {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  }
  _memToken = null
}

