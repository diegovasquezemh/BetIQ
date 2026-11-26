const LOCAL_ACCOUNTS_KEY = 'betiq-accounts-v1'
const LOCAL_SESSION_KEY = 'betiq-active-email-v1'

function createError(message, status = 400) {
  const error = new Error(message)
  error.status = status
  return error
}

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
  return new Promise((resolve, reject) => {
    const storage = getStorage(customStorage)
    const accounts = getAccounts(storage)
    const activeEmail = storage.getItem(LOCAL_SESSION_KEY) || ''

    if (!payload) {
      const current = activeEmail ? accounts[activeEmail] : null
      resolve(current ? toSnapshot(current) : { user: null })
      return
    }

    if (payload.action === 'register') {
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
      const alias = typeof payload.alias === 'string' ? payload.alias.trim() : ''

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        reject(createError('Revisa el correo y la contraseña.', 400))
        return
      }
      if (payload.adult !== true) {
        reject(createError('Confirma que tienes 18 años o más.', 400))
        return
      }
      if (typeof payload.password !== 'string' || payload.password.length < 10 || alias.length > 40) {
        reject(createError('Revisa el apodo y usa al menos 10 caracteres para tu contraseña.', 400))
        return
      }
      if (accounts[email]) {
        reject(createError('Ese correo ya está registrado. Puedes iniciar sesión.', 409))
        return
      }

      const record = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email,
        alias,
        adultAt: new Date().toISOString(),
        password: payload.password,
        revision: 0,
        bets: [],
      }

      accounts[email] = record
      saveAccounts(storage, accounts)
      storage.setItem(LOCAL_SESSION_KEY, email)
      resolve(toSnapshot(record))
      return
    }

    if (payload.action === 'login') {
      const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
      const record = accounts[email]
      if (!record || record.password !== payload.password) {
        reject(createError('El correo o la contraseña son incorrectos.', 401))
        return
      }
      storage.setItem(LOCAL_SESSION_KEY, email)
      resolve(toSnapshot(record))
      return
    }

    const record = activeEmail ? accounts[activeEmail] : null
    if (!record) {
      reject(createError('Vuelve a iniciar sesión.', 401))
      return
    }

    if (payload.action === 'logout') {
      storage.removeItem(LOCAL_SESSION_KEY)
      resolve({ user: null })
      return
    }

    if (payload.userId && payload.userId !== record.id) {
      reject(createError('La sesión cambió. Recarga la página.', 409))
      return
    }

    if (payload.revision !== undefined && payload.revision !== record.revision) {
      reject(createError('Hay cambios en otra pestaña. Recarga la página antes de continuar.', 409))
      return
    }

    if (payload.action === 'profile') {
      const nextAlias = typeof payload.alias === 'string' ? payload.alias.trim() : ''
      if (nextAlias.length > 40) {
        reject(createError('El apodo no puede superar 40 caracteres.', 400))
        return
      }
      record.alias = nextAlias
      record.revision = (record.revision || 0) + 1
      accounts[activeEmail] = record
      saveAccounts(storage, accounts)
      resolve(toSnapshot(record))
      return
    }

    if (payload.action === 'bets' && Array.isArray(payload.bets)) {
      record.bets = payload.bets
      record.revision = (record.revision || 0) + 1
      accounts[activeEmail] = record
      saveAccounts(storage, accounts)
      resolve(toSnapshot(record))
      return
    }

    reject(createError('Revisa los datos del registro.', 400))
  })
}
