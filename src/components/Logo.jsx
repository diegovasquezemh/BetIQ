export default function Logo({ compact = false }) {
  return (
    <div className="brand" aria-label="BetIQ">
      <span className="brand-bet">Bet</span>
      <span className="brand-iq">IQ</span>
      {!compact && <span className="brand-dot">●</span>}
    </div>
  )
}
