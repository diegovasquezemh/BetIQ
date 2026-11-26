import { sampleBets } from '../data/sampleBets.js'

const LOCAL_ACCOUNTS_KEY = 'betiq-accounts-v1'
const LOCAL_SESSION_KEY = 'betiq-active-email-v1'

function getStorage(customStorage) {
  if (customStorage) return customStorage
  return window.localStorage
}

function getAccounts(storage) {
  try {
    const raw = storage.getItem(LOCAL_ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAccounts(storage, accounts) {
  storage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts))
}

function toSnapshot(record) {
  return {
    user: {
      id: record.id,
      email: record.email,
      alias: record.alias,
      adultAt: record.adultAt,
    },
    revision: record.revision || 0,
    bets: Array.isArray(record.bets) ? record.bets : [],
  }
}

export function accountApi(payload, customStorage) {
  return new Promise((resolve) => {
    const storage = getStorage(customStorage)
    const accounts = getAccounts(storage)
    const activeEmail = storage.getItem(LOCAL_SESSION_KEY) || ''

    if (!payload) {
      const current = activeEmail ? accounts[activeEmail] : null
      resolve(current ? toSnapshot(current) : { user: null })
      return
    }

    if (payload.action === 'register' || payload.action === 'login') {
      const rawEmail = typeof payload.email === 'string' ? payload.email.trim() : ''
      const email = (rawEmail || 'demo@betiq.app').toLowerCase()
      const rawAlias = typeof payload.alias === 'string' ? payload.alias.trim() : ''
      const defaultAlias = rawAlias || email.split('@')[0] || 'Usuario'

      let record = accounts[email]
      if (!record) {
        record = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          email,
          alias: defaultAlias.slice(0, 40),
          adultAt: new Date().toISOString(),
          revision: 0,
          bets: sampleBets.map((bet) => ({ ...bet })),
        }
      } else if (rawAlias) {
        record.alias = rawAlias.slice(0, 40)
      }

      accounts[email] = record
      saveAccounts(storage, accounts)
      storage.setItem(LOCAL_SESSION_KEY, email)
      resolve(toSnapshot(record))
      return
    }

    if (payload.action === 'logout') {
      storage.removeItem(LOCAL_SESSION_KEY)
      resolve({ user: null })
      return
    }

    let record = activeEmail ? accounts[activeEmail] : null
    if (!record) {
      record = {
        id: `user-${Date.now()}`,
        email: activeEmail || 'demo@betiq.app',
        alias: 'Usuario',
        adultAt: new Date().toISOString(),
        revision: 0,
        bets: sampleBets.map((bet) => ({ ...bet })),
      }
    }

    if (payload.action === 'profile') {
      const nextAlias = typeof payload.alias === 'string' ? payload.alias.trim().slice(0, 40) : ''
      record.alias = nextAlias
      record.revision = (record.revision || 0) + 1
      accounts[record.email] = record
      saveAccounts(storage, accounts)
      resolve(toSnapshot(record))
      return
    }

    if (payload.action === 'bets' && Array.isArray(payload.bets)) {
      record.bets = payload.bets
      record.revision = (record.revision || 0) + 1
      accounts[record.email] = record
      saveAccounts(storage, accounts)
      resolve(toSnapshot(record))
      return
    }

    resolve(toSnapshot(record))
  })
}
