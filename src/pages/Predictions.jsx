import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { teamNameES, teamFlag } from '../lib/footballApi'
import { canPredict, timeUntilClose, pointsLabel, POINTS_EXACT, POINTS_WINNER } from '../lib/points'
import PredictModal from '../components/Predictions/PredictModal'
import { usePointsCalculator } from '../hooks/usePointsCalculator'
import styles from './Predictions.module.css'

export default function Predictions() {
  const { upcoming, finished, loading } = useMatches()
  const { getPrediction, savePrediction } = usePredictions()
  usePointsCalculator(finished)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [tab, setTab] = useState('upcoming')

  const matches = tab === 'upcoming' ? upcoming : finished

  async function handleSave(matchId, homeGoals, awayGoals) {
    await savePrediction(matchId, homeGoals, awayGoals)
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}><div className="spinner" /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis predicciones</h1>
        <p className={styles.sub}>5 pts resultado exacto · 2 pts ganador correcto</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={tab === 'upcoming' ? styles.tabActive : styles.tab}
          onClick={() => setTab('upcoming')}
        >
          Próximos partidos
        </button>
        <button
          className={tab === 'finished' ? styles.tabActive : styles.tab}
          onClick={() => setTab('finished')}
        >
          Partidos jugados
        </button>
      </div>

      <div className={styles.list}>
        {matches.length === 0 && (
          <div className={styles.empty}>No hay partidos en esta sección por el momento.</div>
        )}

        {matches.map(match => {
          const prediction = getPrediction(match.id)
          const isPredicted = !!prediction
          const closed = !canPredict(match.utcDate)
          const isFinished = match.status === 'FINISHED'

          const homeName = teamNameES(match.homeTeam.name)
          const awayName = teamNameES(match.awayTeam.name)
          const homeFlag = teamFlag(match.homeTeam.name)
          const awayFlag = teamFlag(match.awayTeam.name)

          const matchDate = new Date(match.utcDate)
          const dateStr = matchDate.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
          const timeStr = matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={match.id} className={styles.matchCard}>
              <div className={styles.matchInfo}>
                <div className={styles.matchMeta}>
                  <span className={styles.groupTag}>{match.group || 'Eliminatoria'}</span>
                  <span className={styles.matchDate}>{dateStr} · {timeStr} hs</span>
                </div>
                <div className={styles.matchTeams}>
                  <div className={styles.teamRow}>
                    <span className={styles.flag}>{homeFlag}</span>
                    <span className={styles.teamName}>{homeName}</span>
                  </div>
                  {isFinished ? (
                    <div className={styles.finalScore}>
                      {match.score.fullTime.home} — {match.score.fullTime.away}
                    </div>
                  ) : (
                    <div className={styles.vsTag}>VS</div>
                  )}
                  <div className={styles.teamRow}>
                    <span className={styles.flag}>{awayFlag}</span>
                    <span className={styles.teamName}>{awayName}</span>
                  </div>
                </div>
              </div>

              <div className={styles.predictionSection}>
                {isPredicted ? (
                  <div className={styles.predictionMade}>
                    <div className={styles.predScore}>
                      {prediction.home_goals} — {prediction.away_goals}
                    </div>
                    {isFinished && prediction.points !== null && (
                      <div className={`${styles.pointsTag} ${
                        prediction.points === POINTS_EXACT ? styles.exact :
                        prediction.points === POINTS_WINNER ? styles.winner : styles.none
                      }`}>
                        {prediction.points > 0 ? `+${prediction.points} pts` : '0 pts'} · {pointsLabel(prediction.points)}
                      </div>
                    )}
                    {!isFinished && !closed && (
                      <button className={styles.editBtn} onClick={() => setSelectedMatch(match)}>
                        Editar
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.noPrediction}>
                    {closed ? (
                      <span className={styles.closedTag}>🔒 Cerrado</span>
                    ) : (
                      <button className={styles.predictBtn} onClick={() => setSelectedMatch(match)}>
                        ⚡ Predecir
                        <span className={styles.closeLabel}>{timeUntilClose(match.utcDate)}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedMatch && (
        <PredictModal
          match={selectedMatch}
          existingPrediction={getPrediction(selectedMatch.id)}
          onSave={handleSave}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}
