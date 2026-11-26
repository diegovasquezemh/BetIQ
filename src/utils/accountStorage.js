import { sampleBets } from '../data/sampleBets.js'

const LOCAL_ACCOUNTS_KEY = 'betiq-accounts-v1'
const LOCAL_SESSION_KEY = 'betiq-active-email-v1'

function getStorage(customStorage) {
  if (customStorage) {
    return customStorage
  }
  return window.localStorage
}

export function getStoredAccounts(customStorage) {
  const storage = getStorage(customStorage)
  try {
    const datosGuardados = storage.getItem(LOCAL_ACCOUNTS_KEY)
    return datosGuardados ? JSON.parse(datosGuardados) : {}
  } catch {
    return {}
  }
}

export function saveStoredAccounts(accounts, customStorage) {
  const storage = getStorage(customStorage)
  storage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts))
}

function buildSnapshot(record) {
  return {
    user: {
      id: record.id,
      email: record.email,
      alias: record.alias,
      adultAt: record.adultAt,
    },
    bets: Array.isArray(record.bets) ? record.bets : [],
  }
}

export function getActiveSession(customStorage) {
  const storage = getStorage(customStorage)
  const accounts = getStoredAccounts(storage)
  const activeEmail = storage.getItem(LOCAL_SESSION_KEY) || ''
  const current = activeEmail ? accounts[activeEmail] : null

  if (!current) {
    return { user: null, bets: [] }
  }
  return buildSnapshot(current)
}

export function loginOrRegisterAccount(datos, customStorage) {
  const storage = getStorage(customStorage)
  const accounts = getStoredAccounts(storage)

  const rawEmail = typeof datos.email === 'string' ? datos.email.trim() : ''
  const email = (rawEmail || 'demo@betiq.app').toLowerCase()
  const rawAlias = typeof datos.alias === 'string' ? datos.alias.trim() : ''
  const defaultAlias = rawAlias || email.split('@')[0] || 'Usuario'

  let record = accounts[email]
  if (!record) {
    record = {
      id: 'user-' + Date.now(),
      email: email,
      alias: defaultAlias.slice(0, 40),
      adultAt: new Date().toISOString(),
      bets: sampleBets.map((bet) => ({ ...bet })),
    }
  } else if (rawAlias) {
    record.alias = rawAlias.slice(0, 40)
  }

  accounts[email] = record
  saveStoredAccounts(accounts, storage)
  storage.setItem(LOCAL_SESSION_KEY, email)
  return buildSnapshot(record)
}

export function updateAccountBets(nextBets, customStorage) {
  const storage = getStorage(customStorage)
  const accounts = getStoredAccounts(storage)
  const activeEmail = storage.getItem(LOCAL_SESSION_KEY) || 'demo@betiq.app'

  let record = accounts[activeEmail]
  if (!record) {
    record = {
      id: 'user-' + Date.now(),
      email: activeEmail,
      alias: 'Usuario',
      adultAt: new Date().toISOString(),
      bets: [],
    }
  }

  record.bets = Array.isArray(nextBets) ? nextBets : []
  accounts[activeEmail] = record
  saveStoredAccounts(accounts, storage)
  return buildSnapshot(record)
}

export function updateAccountAlias(nextAlias, customStorage) {
  const storage = getStorage(customStorage)
  const accounts = getStoredAccounts(storage)
  const activeEmail = storage.getItem(LOCAL_SESSION_KEY) || 'demo@betiq.app'

  const record = accounts[activeEmail]
  if (!record) {
    return { user: null, bets: [] }
  }

  record.alias = typeof nextAlias === 'string' ? nextAlias.trim().slice(0, 40) : ''
  accounts[activeEmail] = record
  saveStoredAccounts(accounts, storage)
  return buildSnapshot(record)
}

export function logoutAccount(customStorage) {
  const storage = getStorage(customStorage)
  storage.removeItem(LOCAL_SESSION_KEY)
  return { user: null, bets: [] }
}

export function accountApi(payload, customStorage) {
  return new Promise((resolve) => {
    if (!payload) {
      resolve(getActiveSession(customStorage))
      return
    }
    if (payload.action === 'register' || payload.action === 'login') {
      resolve(loginOrRegisterAccount(payload, customStorage))
      return
    }
    if (payload.action === 'logout') {
      resolve(logoutAccount(customStorage))
      return
    }
    if (payload.action === 'profile') {
      resolve(updateAccountAlias(payload.alias, customStorage))
      return
    }
    if (payload.action === 'bets') {
      resolve(updateAccountBets(payload.bets, customStorage))
      return
    }
    resolve(getActiveSession(customStorage))
  })
}
