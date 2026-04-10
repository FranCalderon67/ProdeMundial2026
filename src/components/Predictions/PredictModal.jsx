import { useState, useEffect } from 'react'
import { teamNameES, teamFlag } from '../../lib/footballApi'
import { canPredict, timeUntilClose } from '../../lib/points'
import styles from './PredictModal.module.css'

export default function PredictModal({ match, existingPrediction, onSave, onClose }) {
  const [homeGoals, setHomeGoals] = useState(
    existingPrediction?.home_goals ?? 0
  )
  const [awayGoals, setAwayGoals] = useState(
    existingPrediction?.away_goals ?? 0
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const homeName = teamNameES(match.homeTeam.name)
  const awayName = teamNameES(match.awayTeam.name)
  const homeFlag = teamFlag(match.homeTeam.name)
  const awayFlag = teamFlag(match.awayTeam.name)
  const canStillPredict = canPredict(match.utcDate)
  const closeLabel = timeUntilClose(match.utcDate)

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (!canStillPredict) return
    setSaving(true)
    setError(null)
    try {
      await onSave(match.id, homeGoals, awayGoals)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function adjust(team, delta) {
    if (team === 'home') {
      setHomeGoals(v => Math.max(0, Math.min(20, v + delta)))
    } else {
      setAwayGoals(v => Math.max(0, Math.min(20, v + delta)))
    }
  }

  // Preview del resultado predicho
  function getResultLabel() {
    if (homeGoals > awayGoals) return `Gana ${homeName}`
    if (awayGoals > homeGoals) return `Gana ${awayName}`
    return 'Empate'
  }

  const matchDate = new Date(match.utcDate)
  const dateStr = matchDate.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const timeStr = matchDate.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.group}>{match.group || 'Eliminatoria'}</div>
            <div className={styles.dateStr}>{dateStr} · {timeStr} hs</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Equipos */}
        <div className={styles.teams}>
          <div className={styles.team}>
            <span className={styles.flag}>{homeFlag}</span>
            <span className={styles.teamName}>{homeName}</span>
          </div>
          <span className={styles.vs}>VS</span>
          <div className={styles.team}>
            <span className={styles.flag}>{awayFlag}</span>
            <span className={styles.teamName}>{awayName}</span>
          </div>
        </div>

        {/* Predicción */}
        {canStillPredict ? (
          <>
            <div className={styles.scoreInputs}>
              {/* Local */}
              <div className={styles.scoreControl}>
                <button className={styles.adjBtn} onClick={() => adjust('home', 1)}>+</button>
                <span className={styles.scoreValue}>{homeGoals}</span>
                <button className={styles.adjBtn} onClick={() => adjust('home', -1)}>−</button>
              </div>

              <div className={styles.scoreSep}>—</div>

              {/* Visitante */}
              <div className={styles.scoreControl}>
                <button className={styles.adjBtn} onClick={() => adjust('away', 1)}>+</button>
                <span className={styles.scoreValue}>{awayGoals}</span>
                <button className={styles.adjBtn} onClick={() => adjust('away', -1)}>−</button>
              </div>
            </div>

            {/* Preview resultado */}
            <div className={styles.resultPreview}>
              <span className={styles.resultLabel}>{getResultLabel()}</span>
            </div>

            {/* Info puntos */}
            <div className={styles.pointsInfo}>
              <div className={styles.pointsRow}>
                <span className={styles.pointsBadge} style={{ background: 'rgba(0,212,160,.15)', color: 'var(--accent)' }}>5 pts</span>
                <span>Si acertás el marcador exacto</span>
              </div>
              <div className={styles.pointsRow}>
                <span className={styles.pointsBadge} style={{ background: 'rgba(245,158,11,.15)', color: 'var(--accent2)' }}>2 pts</span>
                <span>Si acertás el ganador o empate</span>
              </div>
            </div>

            <div className={styles.closeTime}>{closeLabel}</div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : existingPrediction ? 'Actualizar predicción' : 'Guardar predicción'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.closed}>
            <div className={styles.closedIcon}>🔒</div>
            <div className={styles.closedTitle}>Predicciones cerradas</div>
            <div className={styles.closedSub}>
              Las predicciones se cierran 1 hora antes del partido
            </div>
            {existingPrediction && (
              <div className={styles.myPrediction}>
                <div className={styles.predLabel}>Tu predicción</div>
                <div className={styles.predValue}>
                  {homeName} {existingPrediction.home_goals} — {existingPrediction.away_goals} {awayName}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
