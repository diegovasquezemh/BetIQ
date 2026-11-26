import { useState } from 'react'
import { loginOrRegisterAccount } from '../utils/accountStorage.js'
import Logo from './Logo.jsx'
import './account.css'

export default function AccountGate({ onLogin }) {
  const [register, setRegister] = useState(false)
  const [alias, setAlias] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adult, setAdult] = useState(true)

  function handleSubmit(event) {
    event.preventDefault()

    const sessionData = loginOrRegisterAccount({
      alias: alias,
      email: email,
      password: password,
      adult: adult,
    })

    try {
      sessionStorage.setItem('betiq-active-user', JSON.stringify(sessionData.user))
    } catch {
      /* sessionStorage opcional */
    }

    onLogin(sessionData)
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

            <button type="submit" className="primary-button">
              {register ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            className="text-button account-switch"
            onClick={() => setRegister(!register)}
          >
            {register ? 'Ya tengo cuenta · Iniciar sesión' : '¿Primera vez en BetIQ? Crear cuenta'}
          </button>
        </section>
      </div>
    </main>
  )
}
