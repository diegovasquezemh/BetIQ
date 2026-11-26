import { useState } from 'react'

export default function Profile({ user, onSave, onLogout }) {
  const [alias, setAlias] = useState(user.alias || '')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(alias.trim())
  }

  return (
    <section className="panel profile-card">
      <p className="eyebrow">CUENTA ACTIVA</p>
      <h2>{user.alias ? `Hola, ${user.alias}` : 'Mi cuenta'}</h2>
      <dl>
        <dt>Correo electrónico</dt>
        <dd>{user.email}</dd>
        <dt>Mayoría de edad</dt>
        <dd>Declaraste tener 18 años o más.</dd>
      </dl>

      <form className="account-fields" onSubmit={handleSubmit}>
        <label className="field">
          <span>Apodo (opcional)</span>
          <input
            type="text"
            value={alias}
            maxLength="40"
            onChange={(event) => setAlias(event.target.value)}
            autoComplete="nickname"
            placeholder="Cómo quieres que te llamemos"
          />
        </label>
        <button type="submit" className="primary-button" disabled={alias.trim() === (user.alias || '')}>
          Guardar apodo
        </button>
      </form>

      <button type="button" className="secondary-button" onClick={onLogout}>
        Cerrar sesión
      </button>
    </section>
  )
}
