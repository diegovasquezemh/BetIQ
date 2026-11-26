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
  const [adult, setAdult] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (register && password.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres.')
      return
    }
    if (register && !adult) {
      setError('Debes confirmar que tienes 18 años o más.')
      return
    }

    setBusy(true)
    setError('')

    const payload = {
      action: register ? 'register' : 'login',
      alias: alias.trim(),
      email: cleanEmail,
      password,
      adult,
    }

    accountApi(payload)
      .then((result) => {
        onEnter(result)
      })
      .catch((err) => {
        setError(err.message || 'No se pudo iniciar sesión.')
      })
      .then(() => {
        setBusy(false)
      })
  }

  const toggleMode = () => {
    setRegister(!register)
    setError('')
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
              <span>Correo electrónico</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                autoComplete="email"
                required
                maxLength="254"
                placeholder="tucorreo@ejemplo.com"
                className={error && !email.includes('@') ? 'campo-invalido' : ''}
              />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                autoComplete={register ? 'new-password' : 'current-password'}
                minLength={register ? 10 : 1}
                maxLength="128"
                required
                placeholder={register ? 'Mínimo 10 caracteres' : 'Tu contraseña'}
                className={error && register && password.length < 10 ? 'campo-invalido' : ''}
              />
            </label>

            {register && (
              <>
                <small>Usa al menos 10 caracteres.</small>
                <label className="adult-check">
                  <input
                    type="checkbox"
                    name="adult"
                    checked={adult}
                    onChange={(event) => {
                      setAdult(event.target.checked)
                      setError('')
                    }}
                    required
                  />
                  <span>Confirmo que tengo 18 años o más.</span>
                </label>
              </>
            )}

            {error && (
              <p role="alert" className="account-error mensaje-error">
                {error}
              </p>
            )}

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Un momento…' : register ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            className="text-button account-switch"
            disabled={busy}
            onClick={toggleMode}
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
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    accountApi()
      .then((data) => {
        if (mounted) setSnapshot(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'No se pudo cargar la sesión.')
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
          <p>{error || 'Abriendo BetIQ…'}</p>
          {error && (
            <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          )}
        </div>
      </main>
    )
  }

  if (!snapshot.user) {
    return <Access onEnter={switchAccount} />
  }

  return children(snapshot, () => switchAccount({ user: null }))
}
