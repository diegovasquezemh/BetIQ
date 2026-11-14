import { useState } from 'react'
import { ArrowLeft, Check, Info, Plus, Trash2 } from 'lucide-react'
import { betModalities, betMoments, sports } from '../data/sampleBets.js'
import { EsApuestaValida } from '../utils/betCalculations.js'

function createLeg() {
  return {
    id: `leg-${Date.now()}-${Math.random()}`,
    sport: 'Fútbol',
    event: '',
    market: '',
    selection: '',
    odds: '',
  }
}

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  modality: 'SIMPLE',
  moment: 'ANTES DEL EVENTO',
  sport: 'Fútbol',
  event: '',
  market: '',
  selection: '',
  bookmaker: '',
  stake: '',
  odds: '',
  status: 'pending',
  liveMinute: '',
  liveScore: '',
  legs: [createLeg(), createLeg()],
}

const fieldLabels = { event: 'evento', market: 'mercado', selection: 'selección', odds: 'cuota' }

export default function NewBet({ onSave, onCancel }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  let combinedOdds = Number(form.odds) || 0
  if (form.modality === 'COMBINADA') {
    if (form.legs.some((leg) => Number(leg.odds) <= 1)) {
      combinedOdds = 0
    } else {
      combinedOdds = form.legs.reduce((total, leg) => total * Number(leg.odds), 1)
    }
  }

  const updateField = ({ target: { name, value } }) => {
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'moment' && value === 'EVENTO FINALIZADO' && current.status === 'pending') next.status = ''
      if (name === 'moment' && value !== 'EVENTO FINALIZADO' && current.status === '') next.status = 'pending'
      return next
    })
    setErrors((current) => ({ ...current, [name]: '', general: '' }))
  }

  const updateLeg = (index, field, value) => {
    setForm((current) => ({
      ...current,
      legs: current.legs.map((leg, legIndex) => legIndex === index ? { ...leg, [field]: value } : leg),
    }))
    setErrors((current) => ({ ...current, [`leg-${index}-${field}`]: '', general: '' }))
  }

  const addLeg = () => setForm((current) => ({ ...current, legs: [...current.legs, createLeg()] }))

  const removeLeg = (index) => {
    if (form.legs.length <= 2) return
    setForm((current) => ({ ...current, legs: current.legs.filter((_, legIndex) => legIndex !== index) }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const commonRequired = ['date', 'modality', 'moment', 'bookmaker', 'stake', 'status']
    const nextErrors = commonRequired.reduce((result, field) => {
      if (!form[field]) result[field] = 'Este campo es obligatorio.'
      return result
    }, {})

    if (form.modality === 'SIMPLE') {
      ;['event', 'market', 'selection', 'odds'].forEach((field) => {
        if (!form[field]) nextErrors[field] = 'Este campo es obligatorio.'
      })
    } else {
      form.legs.forEach((leg, index) => {
        ;['event', 'market', 'selection', 'odds'].forEach((field) => {
          if (!leg[field]) nextErrors[`leg-${index}-${field}`] = `Ingresa el ${fieldLabels[field]}.`
        })
        if (leg.odds && Number(leg.odds) <= 1) nextErrors[`leg-${index}-odds`] = 'Debe ser mayor a 1.00.'
      })
    }

    if (form.moment === 'EN VIVO' && !form.liveMinute) nextErrors.liveMinute = 'Indica el minuto, set, entrada o período.'
    if (form.moment === 'EVENTO FINALIZADO' && form.status === 'pending') nextErrors.status = 'Un evento finalizado necesita un resultado.'

    const validationType = form.moment === 'EN VIVO' ? 'EN VIVO' : form.modality
    if (!EsApuestaValida(validationType, form.stake, combinedOdds)) {
      if (!betModalities.includes(form.modality)) nextErrors.modality = 'Selecciona una modalidad permitida.'
      if (Number(form.stake) <= 0) nextErrors.stake = 'Ingresa un monto mayor a cero.'
      if (combinedOdds <= 1) nextErrors.general = 'Revisa las cuotas: deben ser mayores a 1.00.'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const isCombined = form.modality === 'COMBINADA'
    onSave({
      ...form,
      id: `bet-${Date.now()}`,
      type: validationType,
      stake: Number(form.stake),
      odds: Number(combinedOdds.toFixed(2)),
      sport: isCombined ? 'Combinada' : form.sport,
      event: isCombined ? form.legs.map((leg) => leg.event).join(' + ') : form.event,
      market: isCombined ? `${form.legs.length} selecciones` : form.market,
      selection: isCombined ? form.legs.map((leg) => leg.selection).join(' + ') : form.selection,
      legs: isCombined ? form.legs.map((leg) => ({ ...leg, odds: Number(leg.odds) })) : [],
    })
  }

  return (
    <div className="form-layout">
      <form className="panel bet-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section-heading">
          <button type="button" className="icon-button" onClick={onCancel} aria-label="Volver"><ArrowLeft size={20} /></button>
          <div><p className="eyebrow">REGISTRO MANUAL</p><h2>Datos de la apuesta</h2></div>
        </div>

        <div className="form-block">
          <div className="form-block-title"><span>1</span><div><h3>¿Cómo fue tu apuesta?</h3><p>Primero selecciona la modalidad y el momento en que la registras.</p></div></div>
          <div className="form-grid">
            <label className="field">
              <span>Modalidad</span>
              <select name="modality" value={form.modality} onChange={updateField} required>
                {betModalities.map((modality) => <option key={modality}>{modality}</option>)}
              </select>
              <small className="field-help">{form.modality === 'SIMPLE' ? 'Una sola selección.' : 'Dos o más selecciones en una apuesta.'}</small>
            </label>
            <label className="field">
              <span>Momento de registro</span>
              <select name="moment" value={form.moment} onChange={updateField} required>
                {betMoments.map((moment) => <option key={moment}>{moment}</option>)}
              </select>
              <small className="field-help">{form.moment === 'EVENTO FINALIZADO' ? 'Podrás guardar directamente el resultado.' : 'Indica cuándo hiciste o registraste la apuesta.'}</small>
            </label>
          </div>
        </div>

        <div className="form-block">
          <div className="form-block-title"><span>2</span><div><h3>{form.modality === 'COMBINADA' ? 'Selecciones de la combinada' : 'Información del evento'}</h3><p>{form.modality === 'COMBINADA' ? 'Agrega cada selección; BetIQ calculará la cuota total.' : 'Describe el evento y tu selección.'}</p></div></div>

          {form.modality === 'SIMPLE' ? (
            <div className="form-grid">
              <label className="field"><span>Deporte</span><select name="sport" value={form.sport} onChange={updateField} required>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
              <label className="field"><span>Evento</span><input type="text" name="event" value={form.event} onChange={updateField} placeholder="Ej. Barcelona vs. Sevilla" required minLength="3" maxLength="120" className={errors.event ? 'campo-invalido' : ''} />{errors.event && <small className="field-error mensaje-error">{errors.event}</small>}</label>
              <label className="field"><span>Mercado</span><input type="text" name="market" value={form.market} onChange={updateField} placeholder="Ej. Ganador del partido" required minLength="2" maxLength="80" className={errors.market ? 'campo-invalido' : ''} />{errors.market && <small className="field-error mensaje-error">{errors.market}</small>}</label>
              <label className="field"><span>Selección</span><input type="text" name="selection" value={form.selection} onChange={updateField} placeholder="Ej. Barcelona" required minLength="1" maxLength="80" className={errors.selection ? 'campo-invalido' : ''} />{errors.selection && <small className="field-error mensaje-error">{errors.selection}</small>}</label>
            </div>
          ) : (
            <div className="legs-list">
              {form.legs.map((leg, index) => (
                <fieldset className="leg-card" key={leg.id}>
                  <legend>Selección {index + 1}</legend>
                  {form.legs.length > 2 && <button type="button" className="remove-leg" onClick={() => removeLeg(index)} aria-label={`Eliminar selección ${index + 1}`}><Trash2 size={16} /></button>}
                  <div className="leg-grid">
                    <label className="field"><span>Deporte</span><select value={leg.sport} onChange={(event) => updateLeg(index, 'sport', event.target.value)} required>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
                    <label className="field"><span>Evento</span><input type="text" value={leg.event} onChange={(event) => updateLeg(index, 'event', event.target.value)} placeholder="Ej. Inter vs. Milan" required className={errors[`leg-${index}-event`] ? 'campo-invalido' : ''} />{errors[`leg-${index}-event`] && <small className="field-error mensaje-error">{errors[`leg-${index}-event`]}</small>}</label>
                    <label className="field"><span>Mercado</span><input type="text" value={leg.market} onChange={(event) => updateLeg(index, 'market', event.target.value)} placeholder="Ej. Ambos anotan" required className={errors[`leg-${index}-market`] ? 'campo-invalido' : ''} />{errors[`leg-${index}-market`] && <small className="field-error mensaje-error">{errors[`leg-${index}-market`]}</small>}</label>
                    <label className="field"><span>Selección</span><input type="text" value={leg.selection} onChange={(event) => updateLeg(index, 'selection', event.target.value)} placeholder="Ej. Sí" required className={errors[`leg-${index}-selection`] ? 'campo-invalido' : ''} />{errors[`leg-${index}-selection`] && <small className="field-error mensaje-error">{errors[`leg-${index}-selection`]}</small>}</label>
                    <label className="field leg-odds"><span>Cuota</span><input type="number" min="1.01" step="0.01" value={leg.odds} onChange={(event) => updateLeg(index, 'odds', event.target.value)} placeholder="1.50" required className={errors[`leg-${index}-odds`] ? 'campo-invalido' : ''} />{errors[`leg-${index}-odds`] && <small className="field-error mensaje-error">{errors[`leg-${index}-odds`]}</small>}</label>
                  </div>
                </fieldset>
              ))}
              <button type="button" className="add-leg-button" onClick={addLeg}><Plus size={17} /> Agregar otra selección</button>
            </div>
          )}

          {form.moment === 'EN VIVO' && (
            <div className="live-fields">
              <div className="live-label"><i /> Información en vivo</div>
              <div className="form-grid">
                <label className="field"><span>Minuto, set o período</span><input type="text" name="liveMinute" value={form.liveMinute} onChange={updateField} placeholder="Ej. Minuto 62 / Segundo set" required className={errors.liveMinute ? 'campo-invalido' : ''} />{errors.liveMinute && <small className="field-error mensaje-error">{errors.liveMinute}</small>}</label>
                <label className="field"><span>Marcador al registrar (opcional)</span><input type="text" name="liveScore" value={form.liveScore} onChange={updateField} placeholder="Ej. 1 - 1" /></label>
              </div>
            </div>
          )}
        </div>

        <div className="form-block final-form-block">
          <div className="form-block-title"><span>3</span><div><h3>Monto y resultado</h3><p>Completa los datos generales de la apuesta.</p></div></div>
          <div className="form-grid">
            <label className="field"><span>Fecha</span><input type="date" name="date" value={form.date} onChange={updateField} required className={errors.date ? 'campo-invalido' : ''} />{errors.date && <small className="field-error mensaje-error">{errors.date}</small>}</label>
            <label className="field"><span>Casa de apuestas</span><input type="text" name="bookmaker" value={form.bookmaker} onChange={updateField} placeholder="Ej. Bet365" required minLength="2" maxLength="60" className={errors.bookmaker ? 'campo-invalido' : ''} />{errors.bookmaker && <small className="field-error mensaje-error">{errors.bookmaker}</small>}</label>
            <label className="field">
              <span>Estado</span>
              <select name="status" value={form.status} onChange={updateField} required className={errors.status ? 'campo-invalido' : ''}>
                {form.moment === 'EVENTO FINALIZADO' && <option value="">Selecciona el resultado</option>}
                {form.moment !== 'EVENTO FINALIZADO' && <option value="pending">Pendiente</option>}
                <option value="won">Ganada</option><option value="lost">Perdida</option><option value="void">Anulada</option>
              </select>
              {errors.status && <small className="field-error mensaje-error">{errors.status}</small>}
            </label>
            <label className="field"><span>Monto apostado (USD)</span><input type="number" min="0.01" step="0.01" name="stake" value={form.stake} onChange={updateField} placeholder="0.00" required className={errors.stake ? 'campo-invalido' : ''} />{errors.stake && <small className="field-error mensaje-error">{errors.stake}</small>}</label>
            <label className="field full-field">
              <span>{form.modality === 'COMBINADA' ? 'Cuota combinada (calculada automáticamente)' : 'Cuota decimal'}</span>
              <input type="number" min="1.01" step="0.01" name="odds" value={form.modality === 'COMBINADA' ? (combinedOdds ? combinedOdds.toFixed(2) : '') : form.odds} onChange={updateField} placeholder="1.80" required readOnly={form.modality === 'COMBINADA'} className={`${form.modality === 'COMBINADA' ? 'calculated-input' : ''} ${errors.odds ? 'campo-invalido' : ''}`.trim()} />
              {errors.odds && <small className="field-error mensaje-error">{errors.odds}</small>}
            </label>
          </div>
          {errors.general && <div className="form-error-banner">{errors.general}</div>}
        </div>

        <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button><button type="submit" className="primary-button"><Check size={18} /> Guardar apuesta</button></div>
      </form>

      <aside className="form-aside">
        <div className="aside-card dark-card"><span className="message-icon">iQ</span><p className="eyebrow">REGISTRO FLEXIBLE</p><h3>Cada apuesta cuenta, aunque el evento ya haya terminado.</h3><p>Registrar apuestas pasadas ayuda a que el balance y el ROI representen tu historial real.</p></div>
        <div className="aside-card tip-card"><Info size={20} /><div><strong>Consejo</strong><p>En una combinada, todas las selecciones deben acertarse. BetIQ multiplica sus cuotas para obtener la cuota total.</p></div></div>
      </aside>
    </div>
  )
}
