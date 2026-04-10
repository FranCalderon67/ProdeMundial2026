import { useState, useMemo } from 'react'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { teamNameES, teamFlag } from '../lib/footballApi'
import { canPredict, timeUntilClose } from '../lib/points'
import PredictModal from '../components/Predictions/PredictModal'
import styles from './Fixture.module.css'

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'live', label: 'En vivo' },
  { key: 'finished', label: 'Terminados' },
]

export default function Fixture() {
  const { upcoming, live, finished, loading } = useMatches()
  const { getPrediction, savePrediction } = usePredictions()
  const [filter, setFilter] = useState('all')
  const [selectedMatch, setSelectedMatch] = useState(null)

  // Unir todos los partidos
  const allMatches = useMemo(() => {
    const all = [
      ...live.map(m => ({ ...m, status: 'LIVE' })),
      ...upcoming,
      ...finished,
    ]
    // Ordenar por fecha
    return all.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  }, [live, upcoming, finished])

  // Filtrar
  const filtered = useMemo(() => {
    if (filter === 'all') return allMatches
    if (filter === 'live') return allMatches.filter(m => m.status === 'LIVE')
    if (filter === 'upcoming') return allMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED')
    if (filter === 'finished') return allMatches.filter(m => m.status === 'FINISHED')
    return allMatches
  }, [allMatches, filter])

  // Agrupar por fecha
  const groupedByDate = useMemo(() => {
    const groups = {}
    filtered.forEach(match => {
      const date = new Date(match.utcDate)
      const key = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
      if (!groups[key]) groups[key] = []
      groups[key].push(match)
    })
    return groups
  }, [filtered])

  if (loading) {
    return <div style={{ padding: '2rem' }}><div className="spinner" /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fixture</h1>
        <p className={styles.sub}>Mundial 2026 · {allMatches.length} partidos</p>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={filter === key ? styles.filterActive : styles.filter}
            onClick={() => setFilter(key)}
          >
            {key === 'live' && live.length > 0 && (
              <span className={styles.liveDot} />
            )}
            {label}
            {key === 'live' && live.length > 0 && (
              <span className={styles.liveCount}>{live.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sin resultados */}
      {filtered.length === 0 && (
        <div className={styles.empty}>
          No hay partidos en esta categoría por el momento.
        </div>
      )}

      {/* Grupos por fecha */}
      {Object.entries(groupedByDate).map(([date, matches]) => (
        <div key={date} className={styles.dateGroup}>
          <div className={styles.dateHeader}>
            <span className={styles.dateLabel}>{date}</span>
            <span className={styles.dateCount}>{matches.length} partido{matches.length !== 1 ? 's' : ''}</span>
          </div>

          <div className={styles.matchList}>
            {matches.map(match => (
              <MatchRow
                key={match.id}
                match={match}
                prediction={getPrediction(match.id)}
                onPredict={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedMatch && (
        <PredictModal
          match={selectedMatch}
          existingPrediction={getPrediction(selectedMatch.id)}
          onSave={savePrediction}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

function MatchRow({ match, prediction, onPredict }) {
  const isLive = match.status === 'LIVE'
  const isFinished = match.status === 'FINISHED'
  const isScheduled = match.status === 'SCHEDULED' || match.status === 'TIMED'

  const homeName = teamNameES(match.homeTeam.name)
  const awayName = teamNameES(match.awayTeam.name)
  const homeFlag = teamFlag(match.homeTeam.name)
  const awayFlag = teamFlag(match.awayTeam.name)

  const matchDate = new Date(match.utcDate)
  const timeStr = matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const canStillPredict = canPredict(match.utcDate)
  const closeLabel = timeUntilClose(match.utcDate)

  // Color del resultado de predicción
  function pointsStyle() {
    if (!prediction || prediction.points === null) return ''
    if (prediction.points === 5) return styles.exactResult
    if (prediction.points === 2) return styles.winnerResult
    return styles.noneResult
  }

  return (
    <div className={`${styles.matchRow} ${isLive ? styles.liveRow : ''}`}>

      {/* Hora / Estado */}
      <div className={styles.matchTime}>
        {isLive ? (
          <div className={styles.liveIndicator}>
            <span className={styles.livePulse} />
            <span className={styles.liveMin}>{match.minute ? `${match.minute}'` : 'VIVO'}</span>
          </div>
        ) : isFinished ? (
          <span className={styles.finishedTag}>FIN</span>
        ) : (
          <span className={styles.timeStr}>{timeStr}</span>
        )}
      </div>

      {/* Equipos y marcador */}
      <div className={styles.matchCenter}>
        <div className={styles.teamLine}>
          <span className={styles.flag}>{homeFlag}</span>
          <span className={`${styles.teamName} ${
            isFinished && match.score.fullTime.home > match.score.fullTime.away ? styles.winner : ''
          }`}>
            {homeName}
          </span>
        </div>

        <div className={styles.scoreArea}>
          {isLive || isFinished ? (
            <span className={styles.score}>
              {match.score.fullTime.home ?? 0} — {match.score.fullTime.away ?? 0}
            </span>
          ) : (
            <span className={styles.scorePlaceholder}>vs</span>
          )}
        </div>

        <div className={`${styles.teamLine} ${styles.teamLineAway}`}>
          <span className={`${styles.teamName} ${
            isFinished && match.score.fullTime.away > match.score.fullTime.home ? styles.winner : ''
          }`}>
            {awayName}
          </span>
          <span className={styles.flag}>{awayFlag}</span>
        </div>
      </div>

      {/* Grupo */}
      <div className={styles.matchGroup}>
        <span className={styles.groupTag}>{match.group || 'Elim.'}</span>
      </div>

      {/* Predicción */}
      <div className={styles.predictionCol}>
        {prediction ? (
          <div className={`${styles.predBadge} ${pointsStyle()}`}>
            <span className={styles.predScore}>
              {prediction.home_goals} — {prediction.away_goals}
            </span>
            {isFinished && prediction.points !== null && (
              <span className={styles.predPoints}>
                {prediction.points > 0 ? `+${prediction.points}` : '0'} pts
              </span>
            )}
            {canStillPredict && (
              <button className={styles.editBtn} onClick={onPredict}>✏️</button>
            )}
          </div>
        ) : (
          <div className={styles.noPred}>
            {canStillPredict ? (
              <button className={styles.predictBtn} onClick={onPredict}>
                <span>⚡</span>
                <span className={styles.predictBtnText}>
                  {closeLabel}
                </span>
              </button>
            ) : isScheduled ? (
              <span className={styles.closedTag}>🔒</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
