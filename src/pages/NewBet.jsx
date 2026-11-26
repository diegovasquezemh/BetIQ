import { useEffect, useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { sports } from '../data/sampleBets.js'
import { CalcularResultado, EsApuestaValida, formatMoney } from '../utils/betCalculations.js'

function createLeg(sport = 'Fútbol') {
  return {
    id: 'leg-' + Date.now() + '-' + Math.random(),
    sport: sport,
    event: '',
    selection: '',
    odds: '',
  }
}

function buildInitialForm(initialBet) {
  const today = new Date().toISOString().slice(0, 10)

  if (!initialBet) {
    return {
      date: today,
      modality: 'SIMPLE',
      moment: 'ANTES DEL EVENTO',
      sport: 'Fútbol',
      event: '',
      selection: '',
      market: '',
      bookmaker: '',
      stake: '',
      odds: '',
      status: 'pending',
      liveMinute: '',
      legs: [createLeg(), createLeg()],
    }
  }

  const hasLegs = Array.isArray(initialBet.legs) && initialBet.legs.length >= 2
  return {
    date: initialBet.date || today,
    modality: initialBet.modality === 'COMBINADA' ? 'COMBINADA' : 'SIMPLE',
    moment: initialBet.moment === 'EN VIVO' ? 'EN VIVO' : 'ANTES DEL EVENTO',
    sport: initialBet.sport && initialBet.sport !== 'Combinada' ? initialBet.sport : 'Fútbol',
    event: initialBet.event || '',
    selection: initialBet.selection || '',
    market: initialBet.market || '',
    bookmaker: initialBet.bookmaker || '',
    stake: initialBet.stake !== undefined ? String(initialBet.stake) : '',
    odds: initialBet.odds !== undefined ? String(initialBet.odds) : '',
    status: initialBet.status || 'pending',
    liveMinute: initialBet.liveMinute || '',
    legs: hasLegs
      ? initialBet.legs.map((leg) => ({
          id: leg.id || 'leg-' + Date.now() + '-' + Math.random(),
          sport: leg.sport || 'Fútbol',
          event: leg.event || '',
          selection: leg.selection || '',
          odds: leg.odds !== undefined ? String(leg.odds) : '',
        }))
      : [createLeg(), createLeg()],
  }
}

const statusOptions = [
  { id: 'pending', label: 'Pendiente' },
  { id: 'won', label: 'Ganada' },
  { id: 'lost', label: 'Perdida' },
  { id: 'void', label: 'Anulada' },
]

export default function NewBet({ initialBet = null, onSave, onCancel }) {
  const [form, setForm] = useState(buildInitialForm(initialBet))
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(initialBet)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  let effectiveOdds = Number(form.odds) || 0
  if (form.modality === 'COMBINADA') {
    const hasInvalidLeg = form.legs.some((leg) => Number(leg.odds) <= 1)
    if (hasInvalidLeg) {
      effectiveOdds = 0
    } else {
      effectiveOdds = form.legs.reduce((total, leg) => total * Number(leg.odds), 1)
    }
  }

  const stakeNumber = Number(form.stake) || 0
  const canPreview = stakeNumber > 0 && effectiveOdds > 1
  const potentialProfit = canPreview ? CalcularResultado(stakeNumber, effectiveOdds, true) : 0
  const totalReturn = canPreview ? stakeNumber + potentialProfit : 0

  function updateField(event) {
    const name = event.target.name
    const value = event.target.value
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', general: '' }))
  }

  function setQuickField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', general: '' }))
  }

  function updateLeg(index, field, value) {
    setForm((current) => ({
      ...current,
      legs: current.legs.map((leg, legIndex) => (legIndex === index ? { ...leg, [field]: value } : leg)),
    }))
    setErrors((current) => ({ ...current, [`leg-${index}-${field}`]: '', general: '' }))
  }

  function addLeg() {
    setForm((current) => ({ ...current, legs: [...current.legs, createLeg(current.sport)] }))
  }

  function removeLeg(index) {
    if (form.legs.length <= 2) return
    setForm((current) => ({
      ...current,
      legs: current.legs.filter((_, legIndex) => legIndex !== index),
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.date) {
      nextErrors.date = 'Indica la fecha.'
    }
    if (!form.stake || Number(form.stake) <= 0) {
      nextErrors.stake = 'Ingresa un monto mayor a 0.'
    }

    if (form.modality === 'SIMPLE') {
      if (!form.event.trim()) {
        nextErrors.event = 'Escribe el partido o jugada.'
      }
      if (!form.odds || Number(form.odds) <= 1) {
        nextErrors.odds = 'La cuota debe ser mayor a 1.00.'
      }
    } else {
      form.legs.forEach((leg, index) => {
        if (!leg.event.trim()) {
          nextErrors[`leg-${index}-event`] = 'Escribe el evento o selección.'
        }
        if (!leg.odds || Number(leg.odds) <= 1) {
          nextErrors[`leg-${index}-odds`] = 'Mayor a 1.00.'
        }
      })
    }

    const validationType = form.moment === 'EN VIVO' ? 'EN VIVO' : form.modality
    if (!EsApuestaValida(validationType, form.stake, effectiveOdds)) {
      if (Number(form.stake) <= 0) {
        nextErrors.stake = 'Ingresa un monto mayor a 0.'
      }
      if (effectiveOdds <= 1) {
        nextErrors.general = 'Verifica que la cuota sea mayor a 1.00.'
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const isCombined = form.modality === 'COMBINADA'
    onSave({
      id: initialBet ? initialBet.id : 'bet-' + Date.now(),
      date: form.date,
      type: validationType,
      modality: form.modality,
      moment: form.moment,
      sport: isCombined ? 'Combinada' : form.sport,
      event: isCombined ? form.legs.map((leg) => leg.event.trim()).join(' + ') : form.event.trim(),
      selection: isCombined
        ? form.legs.map((leg) => (leg.selection ? leg.selection.trim() : leg.event.trim())).join(' + ')
        : form.selection.trim() || 'Registro directo',
      market: isCombined ? form.legs.length + ' selecciones' : form.market.trim(),
      bookmaker: form.bookmaker.trim() || 'Personal',
      stake: Number(form.stake),
      odds: Number(effectiveOdds.toFixed(2)),
      status: form.status,
      liveMinute: form.moment === 'EN VIVO' ? form.liveMinute.trim() : '',
      legs: isCombined
        ? form.legs.map((leg) => ({
            ...leg,
            event: leg.event.trim(),
            selection: leg.selection ? leg.selection.trim() : leg.event.trim(),
            odds: Number(leg.odds),
          }))
        : [],
    })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <section
        className="modal-card panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-bet-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{isEditing ? 'EDITAR REGISTRO' : 'ANOTE RÁPIDO'}</p>
            <h2 id="new-bet-modal-title">{isEditing ? 'Modificar jugada' : 'Nuevo registro en bitácora'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Cerrar ventana">
            <X size={20} />
          </button>
        </header>

        <form className="bet-form modal-form" onSubmit={handleSubmit} noValidate>
          <div className="quick-toggles-row">
            <div className="toggle-group">
              <span className="toggle-label">Tipo</span>
              <div className="segmented-control" role="group" aria-label="Modalidad">
                <button
                  type="button"
                  className={`segment-btn ${form.modality === 'SIMPLE' ? 'is-selected' : ''}`}
                  onClick={() => setQuickField('modality', 'SIMPLE')}
                >
                  Simple
                </button>
                <button
                  type="button"
                  className={`segment-btn ${form.modality === 'COMBINADA' ? 'is-selected' : ''}`}
                  onClick={() => setQuickField('modality', 'COMBINADA')}
                >
                  Combinada ({form.legs.length})
                </button>
              </div>
            </div>

            <div className="toggle-group">
              <span className="toggle-label">Momento</span>
              <div className="segmented-control" role="group" aria-label="Momento">
                <button
                  type="button"
                  className={`segment-btn ${form.moment === 'ANTES DEL EVENTO' ? 'is-selected' : ''}`}
                  onClick={() => setQuickField('moment', 'ANTES DEL EVENTO')}
                >
                  Pre-partido
                </button>
                <button
                  type="button"
                  className={`segment-btn ${form.moment === 'EN VIVO' ? 'is-selected' : ''}`}
                  onClick={() => setQuickField('moment', 'EN VIVO')}
                >
                  En vivo
                </button>
              </div>
            </div>
          </div>

          <div className="form-block">
            {form.modality === 'SIMPLE' ? (
              <div className="form-grid">
                <label className="field">
                  <span>Evento o partido *</span>
                  <input
                    type="text"
                    name="event"
                    value={form.event}
                    onChange={updateField}
                    placeholder="Ej. Real Madrid vs. Valencia"
                    required
                    className={errors.event ? 'campo-invalido' : ''}
                  />
                  {errors.event && <small className="field-error mensaje-error">{errors.event}</small>}
                </label>

                <label className="field">
                  <span>Deporte</span>
                  <select name="sport" value={form.sport} onChange={updateField}>
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </label>

                <label className="field full-field">
                  <span>Pronóstico / Selección (opcional)</span>
                  <input
                    type="text"
                    name="selection"
                    value={form.selection}
                    onChange={updateField}
                    placeholder="Ej. Gana Real Madrid, Más de 2.5 goles, Hándicap -1.5..."
                  />
                </label>
              </div>
            ) : (
              <div className="legs-list">
                {form.legs.map((leg, index) => (
                  <fieldset className="leg-card" key={leg.id}>
                    <legend>Selección {index + 1}</legend>
                    {form.legs.length > 2 && (
                      <button
                        type="button"
                        className="remove-leg"
                        onClick={() => removeLeg(index)}
                        aria-label={`Eliminar selección ${index + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div className="leg-compact-grid">
                      <label className="field">
                        <span>Evento y pronóstico *</span>
                        <input
                          type="text"
                          value={leg.event}
                          onChange={(event) => updateLeg(index, 'event', event.target.value)}
                          placeholder="Ej. Lakers vs Suns · Más de 224.5"
                          required
                          className={errors[`leg-${index}-event`] ? 'campo-invalido' : ''}
                        />
                        {errors[`leg-${index}-event`] && (
                          <small className="field-error mensaje-error">{errors[`leg-${index}-event`]}</small>
                        )}
                      </label>
                      <label className="field">
                        <span>Deporte</span>
                        <select value={leg.sport} onChange={(event) => updateLeg(index, 'sport', event.target.value)}>
                          {sports.map((sport) => (
                            <option key={sport} value={sport}>{sport}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        <span>Cuota *</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="1.01"
                          step="0.01"
                          value={leg.odds}
                          onChange={(event) => updateLeg(index, 'odds', event.target.value)}
                          placeholder="1.50"
                          required
                          className={errors[`leg-${index}-odds`] ? 'campo-invalido' : ''}
                        />
                        {errors[`leg-${index}-odds`] && (
                          <small className="field-error mensaje-error">{errors[`leg-${index}-odds`]}</small>
                        )}
                      </label>
                    </div>
                  </fieldset>
                ))}
                <button type="button" className="add-leg-button" onClick={addLeg}>
                  <Plus size={16} /> Agregar otra selección a la combinada
                </button>
              </div>
            )}
          </div>

          <div className="form-block">
            <div className="form-grid numbers-grid">
              <label className="field">
                <span>Monto arriesgado (USD) *</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  name="stake"
                  value={form.stake}
                  onChange={updateField}
                  placeholder="25.00"
                  required
                  className={errors.stake ? 'campo-invalido' : ''}
                />
                {errors.stake && <small className="field-error mensaje-error">{errors.stake}</small>}
              </label>

              <label className="field">
                <span>{form.modality === 'COMBINADA' ? 'Cuota total calculada' : 'Cuota decimal *'}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1.01"
                  step="0.01"
                  name="odds"
                  value={form.modality === 'COMBINADA' ? (effectiveOdds ? effectiveOdds.toFixed(2) : '') : form.odds}
                  onChange={updateField}
                  placeholder="1.85"
                  required
                  readOnly={form.modality === 'COMBINADA'}
                  className={`${form.modality === 'COMBINADA' ? 'calculated-input' : ''} ${errors.odds ? 'campo-invalido' : ''}`.trim()}
                />
                {errors.odds && <small className="field-error mensaje-error">{errors.odds}</small>}
              </label>
            </div>

            <div className="profit-preview-bar" aria-live="polite">
              <div>
                <span>Ganancia neta si gana</span>
                <strong className="positive-text">{canPreview ? `+${formatMoney(potentialProfit)}` : '$0.00'}</strong>
              </div>
              <div>
                <span>Retorno total</span>
                <strong>{canPreview ? formatMoney(totalReturn) : '$0.00'}</strong>
              </div>
              <div>
                <span>Si se pierde</span>
                <strong className="negative-text">{stakeNumber > 0 ? `-${formatMoney(stakeNumber)}` : '$0.00'}</strong>
              </div>
            </div>
          </div>

          <div className="form-block final-form-block">
            <div className="field status-picker-field">
              <span>Estado del registro (puedes cambiarlo después en 1 clic)</span>
              <div className="status-choice-grid" role="group" aria-label="Estado del registro">
                {statusOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`status-choice-btn choice-${item.id} ${form.status === item.id ? 'is-selected' : ''}`}
                    onClick={() => setQuickField('status', item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid optional-meta-grid">
              <label className="field">
                <span>Fecha</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateField}
                  required
                  className={errors.date ? 'campo-invalido' : ''}
                />
              </label>
              <label className="field">
                <span>Casa o plataforma (opcional)</span>
                <input
                  type="text"
                  name="bookmaker"
                  value={form.bookmaker}
                  onChange={updateField}
                  placeholder="Ej. Bet365, Betway, Personal..."
                />
              </label>
              {form.moment === 'EN VIVO' && (
                <label className="field full-field">
                  <span>Nota de momento en vivo (opcional)</span>
                  <input
                    type="text"
                    name="liveMinute"
                    value={form.liveMinute}
                    onChange={updateField}
                    placeholder="Ej. Minuto 60 (1-1) o 2do cuarto"
                  />
                </label>
              )}
            </div>

            {errors.general && <div className="form-error-banner">{errors.general}</div>}
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="primary-button">
              <Check size={18} />
              <span>{isEditing ? 'Guardar cambios' : 'Guardar registro'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
