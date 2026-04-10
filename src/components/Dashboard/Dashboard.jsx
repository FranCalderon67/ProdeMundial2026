import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMatches } from '../../hooks/useMatches'
import { usePredictions } from '../../hooks/usePredictions'
import { useRanking } from '../../hooks/useRanking'
import { usePointsCalculator } from '../../hooks/usePointsCalculator'
import { teamNameES, teamFlag } from '../../lib/footballApi'
import { canPredict } from '../../lib/points'
import PredictModal from '../Predictions/PredictModal'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { upcoming, live, finished, loading: matchesLoading } = useMatches()
  const { predictions, getPrediction, savePrediction } = usePredictions()
  const { ranking } = useRanking()
  const [selectedMatch, setSelectedMatch] = useState(null)
  const navigate = useNavigate()

  usePointsCalculator(finished)

  const firstName = profile?.display_name?.split(' ')[0] || 'jugador'
  const totalPoints = predictions.reduce((acc, p) => acc + (p.points || 0), 0)
  const myPosition = ranking.findIndex(r => r.id === user?.id) + 1

  async function handleSave(matchId, homeGoals, awayGoals) {
    await savePrediction(matchId, homeGoals, awayGoals)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.sub}>Hola, <strong>{firstName}</strong> · Prode Mundial 2026</p>
      </div>

      <div className={styles.gridTop}>
        <LiveMatchCard live={live} getPrediction={getPrediction} onPredict={setSelectedMatch} />
        <NextMatchCard upcoming={upcoming} loading={matchesLoading} getPrediction={getPrediction} onPredict={setSelectedMatch} />
        <RankingCard ranking={ranking} currentUserId={user?.id} onViewAll={() => navigate("/ranking")} />
      </div>

      <div className={styles.statsRow}>
        <StatCard
          label="Tu posición"
          value={myPosition > 0 ? `${myPosition}°` : '—'}
          sub={myPosition > 0 ? `de ${ranking.length} jugadores` : 'Hacé predicciones para aparecer'}
        />
        <StatCard
          label="Puntos totales"
          value={totalPoints}
          sub={`${predictions.length} predicciones realizadas`}
          accent
        />
      </div>

      <div className={styles.gridBottom}>
        <UpcomingMatchesCard upcoming={upcoming} loading={matchesLoading} getPrediction={getPrediction} onPredict={setSelectedMatch} onViewAll={() => navigate("/fixture")} />
        <BracketPreviewCard onViewAll={() => navigate("/llaves")} upcoming={upcoming} finished={finished} live={live} />
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

function LiveMatchCard({ live, getPrediction, onPredict }) {
  if (!live.length) {
    return (
      <div className={styles.liveCard}>
        <div className={styles.cardTitle}>En vivo</div>
        <div className={styles.noLive}>No hay partidos en este momento</div>
      </div>
    )
  }

  const match = live[0]
  const home = match.homeTeam.name
  const away = match.awayTeam.name
  const prediction = getPrediction(match.id)

  return (
    <div className={styles.liveCard}>
      <div className={styles.liveCardHeader}>
        <span className={styles.groupBadge}>{match.group || 'Eliminatoria'}</span>
        <div className="badge-live"><span className="live-dot" />EN VIVO</div>
      </div>
      <div className={styles.matchTeams}>
        <div className={styles.team}>
          <span className={styles.flag}>{teamFlag(home)}</span>
          <span className={styles.teamName}>{teamNameES(home)}</span>
        </div>
        <div className={styles.score}>
          <span className={styles.scoreMain}>
            {match.score.fullTime.home ?? 0} — {match.score.fullTime.away ?? 0}
          </span>
          <span className={styles.scoreTime}>{match.minute ? `${match.minute}'` : 'En curso'}</span>
        </div>
        <div className={styles.team}>
          <span className={styles.flag}>{teamFlag(away)}</span>
          <span className={styles.teamName}>{teamNameES(away)}</span>
        </div>
      </div>
      {match.venue && <div className={styles.venue}>{match.venue}</div>}
      {prediction && (
        <div className={styles.myPrediction}>
          <span className={styles.predictionLabel}>Tu predicción</span>
          <span className={styles.predictionValue}>
            {teamNameES(home)} {prediction.home_goals} — {prediction.away_goals} {teamNameES(away)}
          </span>
        </div>
      )}
    </div>
  )
}

function NextMatchCard({ upcoming, loading, getPrediction, onPredict }) {
  if (loading) return <div className="card"><div className="spinner" /></div>

  const next = upcoming[0]
  if (!next) {
    return (
      <div className="card">
        <div className="card-title">Próximo partido</div>
        <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginTop: '1rem' }}>
          No hay partidos programados por el momento.
        </p>
      </div>
    )
  }

  const home = next.homeTeam.name
  const away = next.awayTeam.name
  const date = new Date(next.utcDate)
  const dateStr = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const predicted = getPrediction(next.id)
  const canStillPredict = canPredict(next.utcDate)

  return (
    <div className="card">
      <div className="section-header">
        <div className="card-title">Próximo partido</div>
        {canStillPredict && (
          <span className={styles.predictTag} onClick={() => onPredict(next)}>⚡ Predecir</span>
        )}
      </div>
      <div className={styles.nextTeams}>
        <div className={styles.nextTeam}>
          <span className={styles.nextFlag}>{teamFlag(home)}</span>
          <span className={styles.nextName}>{teamNameES(home)}</span>
        </div>
        <span className={styles.vs}>VS</span>
        <div className={styles.nextTeam}>
          <span className={styles.nextFlag}>{teamFlag(away)}</span>
          <span className={styles.nextName}>{teamNameES(away)}</span>
        </div>
      </div>
      <div className={styles.matchTime}>{timeStr} hs</div>
      <div className={styles.matchDate}>{dateStr} · {next.group || 'Eliminatoria'}</div>
      {predicted ? (
        <div className={styles.myPrediction} style={{ marginTop: '.75rem' }}>
          <span className={styles.predictionLabel}>Tu predicción</span>
          <span className={styles.predictionValue}>{predicted.home_goals} — {predicted.away_goals}</span>
        </div>
      ) : canStillPredict ? (
        <button className="btn-primary" style={{ width: '100%', marginTop: '.75rem' }} onClick={() => onPredict(next)}>
          Hacer predicción
        </button>
      ) : (
        <div style={{ marginTop: '.75rem', textAlign: 'center', fontSize: '.75rem', color: 'var(--muted)' }}>
          🔒 Predicciones cerradas
        </div>
      )}
    </div>
  )
}

function RankingCard({ ranking, currentUserId, onViewAll }) {
  const top5 = ranking.slice(0, 5)

  return (
    <div className="card">
      <div className="section-header">
        <div className="card-title">Top ranking</div>
        <span className={styles.seeAll} onClick={onViewAll} style={{cursor:"pointer"}}>Ver todo</span>
      </div>
      {top5.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '.8rem', textAlign: 'center', padding: '1rem 0' }}>
          Aún no hay puntos registrados.
        </p>
      )}
      {top5.map((player, index) => {
        const pos = index + 1
        const isMe = player.id === currentUserId
        const initials = player.display_name
          ? player.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          : '?'
        return (
          <div key={player.id} className={styles.rankItem}>
            <span className={`${styles.rankPos} ${pos === 1 ? styles.gold : pos === 2 ? styles.silver : ''}`}>
              {pos}
            </span>
            <div className={`${styles.rankAvatar} ${isMe ? styles.avatarMe : ''}`}>{initials}</div>
            <span className={styles.rankName}>
              {player.display_name}
              {isMe && <span className={styles.meBadge}>vos</span>}
            </span>
            <span className={`${styles.rankPts} ${player.points === 0 ? styles.rankPtsZero : ''}`}>
              {player.points} pts
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={accent ? { color: 'var(--accent2)' } : {}}>{value}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

function UpcomingMatchesCard({ upcoming, loading, getPrediction, onPredict, onViewAll }) {
  if (loading) return <div className="card"><div className="spinner" /></div>

  return (
    <div className="card">
      <div className="section-header">
        <div className="card-title">Próximos partidos</div>
        <span className={styles.seeAll} onClick={onViewAll} style={{cursor:"pointer"}}>Ver fixture</span>
      </div>
      {upcoming.slice(0, 5).map(match => {
        const home = match.homeTeam.name
        const away = match.awayTeam.name
        const date = new Date(match.utcDate)
        const dateStr = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'numeric' })
        const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        const predicted = !!getPrediction(match.id)
        const canStillPredict = canPredict(match.utcDate)

        return (
          <div key={match.id} className={styles.fixtureItem}>
            <div className={styles.fixtureTeams}>
              <span>{teamFlag(home)}</span>
              <span className={styles.fixName}>{teamNameES(home)}</span>
              <span className={styles.fixVs}>vs</span>
              <span>{teamFlag(away)}</span>
              <span className={styles.fixName}>{teamNameES(away)}</span>
            </div>
            <div className={styles.fixtureMeta}>
              <div className={styles.fixtureDate}>{dateStr} · {timeStr}</div>
              {predicted
                ? <span className={styles.predictedTag}>✓ Predicho</span>
                : canStillPredict
                  ? <span className={styles.predictTag} onClick={() => onPredict(match)}>⚡ Predecir</span>
                  : <span style={{ fontSize: '.6rem', color: 'var(--muted)' }}>🔒 Cerrado</span>
              }
            </div>
          </div>
        )
      })}
      {upcoming.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>No hay partidos programados próximamente.</p>
      )}
    </div>
  )
}

function BracketPreviewCard({ onViewAll, upcoming, finished, live }) {
  const ROUND_ORDER = ['LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']
  const ROUND_LABELS = {
    'LAST_16': 'Octavos',
    'QUARTER_FINALS': 'Cuartos',
    'SEMI_FINALS': 'Semis',
    'FINAL': 'Final',
  }
  const ROUND_COUNT = { 'LAST_16': 3, 'QUARTER_FINALS': 2, 'SEMI_FINALS': 1, 'FINAL': 1 }

  const allMatches = [...(finished||[]), ...(live||[]), ...(upcoming||[])]
  const knockoutMatches = allMatches.filter(m => m.stage && ROUND_ORDER.includes(m.stage))

  const rounds = {}
  ROUND_ORDER.forEach(r => { rounds[r] = [] })
  knockoutMatches.forEach(m => { if (rounds[m.stage]) rounds[m.stage].push(m) })

  return (
    <div className="card">
      <div className="section-header">
        <div className="card-title">Cuadro / Llaves</div>
        <span className={styles.seeAll} onClick={onViewAll} style={{cursor:'pointer'}}>Ver completo</span>
      </div>
      {ROUND_ORDER.map(round => (
        <div key={round} className={styles.bracketStage}>
          <div className={styles.stageLabel}>{ROUND_LABELS[round]}</div>
          <div className={styles.bracketMatches}>
            {rounds[round].length > 0 ? (
              rounds[round].slice(0, ROUND_COUNT[round]).map(match => {
                const isFinished = match.status === 'FINISHED'
                const isLive = match.status === 'LIVE'
                return (
                  <div key={match.id} className={styles.bracketMatch}>
                    <div className={styles.bracketTeam}>
                      <span>{teamFlag(match.homeTeam.name)}</span>
                      <span>{teamNameES(match.homeTeam.name)}</span>
                      {(isFinished||isLive) && <span style={{marginLeft:'auto',fontWeight:700,color:'var(--blue)'}}>{match.score?.fullTime?.home ?? 0}</span>}
                    </div>
                    <div className={styles.bracketTeam}>
                      <span>{teamFlag(match.awayTeam.name)}</span>
                      <span>{teamNameES(match.awayTeam.name)}</span>
                      {(isFinished||isLive) && <span style={{marginLeft:'auto',fontWeight:700,color:'var(--blue)'}}>{match.score?.fullTime?.away ?? 0}</span>}
                    </div>
                  </div>
                )
              })
            ) : (
              Array.from({ length: ROUND_COUNT[round] }).map((_, i) => (
                <div key={i} className={styles.bracketMatch}>
                  <div className={styles.bracketTeam} style={{color:'var(--muted)',fontStyle:'italic'}}>Por definir</div>
                  <div className={styles.bracketTeam} style={{color:'var(--muted)',fontStyle:'italic'}}>Por definir</div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
