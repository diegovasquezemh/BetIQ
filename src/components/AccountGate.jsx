import { useEffect, useState } from 'react'
import { accountApi } from '../utils/accountStorage.js'
import Logo from './Logo.jsx'
import './account.css'

export { accountApi }

function Access({ onEnter }) {
  const [register, setRegister] = useState(false)
  const [alias, setAlias] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adult, setAdult] = useState(true)
  const [busy, setBusy] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setBusy(true)

    const payload = {
      action: register ? 'register' : 'login',
      alias: alias.trim(),
      email: email.trim() || 'demo@betiq.app',
      password: password || 'demo',
      adult: true,
    }

    accountApi(payload)
      .then((result) => {
        onEnter(result)
      })
      .then(() => {
        setBusy(false)
      })
  }

  return (
    <main className="account-home">
      <div className="account-shell">
        <div className="account-brand">
          <Logo />
          <h2>Tu bitácora personal</h2>
          <p>Reúne tus registros en una cuenta privada y consulta cómo cambia tu balance con cada resultado.</p>
        </div>

        <section className="account-body">
          <h1>{register ? 'Crea tu cuenta' : 'Iniciar sesión'}</h1>
          <form onSubmit={handleSubmit} className="account-fields" noValidate>
            {register && (
              <label className="field">
                <span>Apodo (opcional)</span>
                <input
                  type="text"
                  name="alias"
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                  autoComplete="nickname"
                  maxLength="40"
                  placeholder="Ej. Luna"
                />
              </label>
            )}

            <label className="field">
              <span>Correo o usuario</span>
              <input
                type="text"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                maxLength="254"
                placeholder="Cualquier correo o usuario (ej. demo@betiq.app)"
              />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={register ? 'new-password' : 'current-password'}
                maxLength="128"
                placeholder="Cualquier contraseña"
              />
            </label>

            {register && (
              <label className="adult-check">
                <input
                  type="checkbox"
                  name="adult"
                  checked={adult}
                  onChange={(event) => setAdult(event.target.checked)}
                />
                <span>Confirmo que tengo 18 años o más.</span>
              </label>
            )}

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Un momento…' : register ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            className="text-button account-switch"
            disabled={busy}
            onClick={() => setRegister(!register)}
          >
            {register ? 'Ya tengo cuenta · Iniciar sesión' : '¿Primera vez en BetIQ? Crear cuenta'}
          </button>
        </section>
      </div>
    </main>
  )
}

export default function AccountGate({ children }) {
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    let mounted = true

    accountApi().then((data) => {
      if (mounted) setSnapshot(data)
    })

    function sessionChanged(event) {
      if (event.key === 'betiq-session-change') window.location.reload()
    }

    window.addEventListener('storage', sessionChanged)
    return () => {
      mounted = false
      window.removeEventListener('storage', sessionChanged)
    }
  }, [])

  function switchAccount(data) {
    setSnapshot(data)
    try {
      localStorage.setItem('betiq-session-change', String(Date.now()))
      if (data && data.user) {
        sessionStorage.setItem('betiq-active-user', JSON.stringify(data.user))
      } else {
        sessionStorage.removeItem('betiq-active-user')
      }
    } catch {
      /* Almacenamiento local */
    }
  }

  if (!snapshot) {
    return (
      <main className="account-home">
        <div className="account-body" role="status">
          <p>Abriendo BetIQ…</p>
        </div>
      </main>
    )
  }

  if (!snapshot.user) {
    return <Access onEnter={switchAccount} />
  }

  return children(snapshot, () => switchAccount({ user: null }))
}
