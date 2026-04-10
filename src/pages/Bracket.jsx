import { useState, useMemo } from 'react'
import { useMatches } from '../hooks/useMatches'
import { teamNameES, teamFlag } from '../lib/footballApi'
import styles from './Bracket.module.css'

const ROUND_LABELS = {
  'LAST_16':       'Octavos de final',
  'QUARTER_FINALS':'Cuartos de final',
  'SEMI_FINALS':   'Semifinales',
  'FINAL':         'Final',
}

const ROUND_ORDER = ['LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']

export default function Bracket() {
  const { upcoming, finished, live, loading } = useMatches()
  const [activeRound, setActiveRound] = useState(null)

  const knockoutMatches = useMemo(() => {
    const all = [...finished, ...live, ...upcoming]
    return all.filter(m =>
      m.stage && ROUND_ORDER.includes(m.stage)
    )
  }, [finished, live, upcoming])

  const rounds = useMemo(() => {
    const grouped = {}
    ROUND_ORDER.forEach(r => { grouped[r] = [] })
    knockoutMatches.forEach(m => {
      if (grouped[m.stage]) grouped[m.stage].push(m)
    })
    return grouped
  }, [knockoutMatches])

  // Detectar la ronda activa (la primera con partidos)
  const firstActiveRound = ROUND_ORDER.find(r => rounds[r].length > 0) || 'LAST_16'
  const currentRound = activeRound || firstActiveRound

  if (loading) {
    return <div style={{ padding: '2rem' }}><div className="spinner" /></div>
  }

  const hasKnockout = knockoutMatches.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cuadro / Llaves</h1>
        <p className={styles.sub}>Fase eliminatoria · Champions League 2025/26</p>
      </div>

      {/* Tabs de ronda */}
      <div className={styles.roundTabs}>
        {ROUND_ORDER.map(round => {
          const count = rounds[round].length
          return (
            <button
              key={round}
              className={currentRound === round ? styles.roundTabActive : styles.roundTab}
              onClick={() => setActiveRound(round)}
            >
              {ROUND_LABELS[round]}
              {count > 0 && <span className={styles.matchCount}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {!hasKnockout ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏆</div>
          <div className={styles.emptyTitle}>Fase de grupos en curso</div>
          <div className={styles.emptySub}>
            Los cruces eliminatorios se mostrarán aquí una vez que finalice la fase de grupos.
          </div>
        </div>
      ) : (
        <RoundView matches={rounds[currentRound]} round={currentRound} />
      )}

      {/* Vista completa del bracket — solo cuando hay datos */}
      {hasKnockout && (
        <div className={styles.bracketFull}>
          <div className={styles.bracketTitle}>Vista completa</div>
          <div className={styles.bracketGrid}>
            {ROUND_ORDER.map(round => (
              <div key={round} className={styles.bracketColumn}>
                <div className={styles.bracketRoundLabel}>{ROUND_LABELS[round]}</div>
                <div className={styles.bracketMatchList}>
                  {rounds[round].length > 0 ? (
                    rounds[round].map(match => (
                      <MiniMatchCard key={match.id} match={match} />
                    ))
                  ) : (
                    Array.from({ length: round === 'LAST_16' ? 8 : round === 'QUARTER_FINALS' ? 4 : round === 'SEMI_FINALS' ? 2 : 1 }).map((_, i) => (
                      <TBDCard key={i} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RoundView({ matches, round }) {
  if (matches.length === 0) {
    const count = round === 'LAST_16' ? 8 : round === 'QUARTER_FINALS' ? 4 : round === 'SEMI_FINALS' ? 2 : 1
    return (
      <div className={styles.roundGrid}>
        {Array.from({ length: count }).map((_, i) => (
          <TBDFullCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.roundGrid}>
      {matches.map(match => (
        <FullMatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}

function FullMatchCard({ match }) {
  const isLive = match.status === 'LIVE'
  const isFinished = match.status === 'FINISHED'
  const homeName = teamNameES(match.homeTeam.name)
  const awayName = teamNameES(match.awayTeam.name)
  const homeFlag = teamFlag(match.homeTeam.name)
  const awayFlag = teamFlag(match.awayTeam.name)

  const date = new Date(match.utcDate)
  const dateStr = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const homeScore = match.score?.fullTime?.home
  const awayScore = match.score?.fullTime?.away
  const homeWins = isFinished && homeScore > awayScore
  const awayWins = isFinished && awayScore > homeScore

  return (
    <div className={`${styles.fullCard} ${isLive ? styles.liveCard : ''}`}>
      {isLive && (
        <div className={styles.liveHeader}>
          <span className="badge-live"><span className="live-dot" />EN VIVO · {match.minute ? `${match.minute}'` : ''}</span>
        </div>
      )}

      {!isLive && (
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>{dateStr} · {timeStr} hs</span>
          {isFinished && <span className={styles.finTag}>Finalizado</span>}
        </div>
      )}

      <div className={styles.matchRow}>
        <div className={`${styles.teamBlock} ${homeWins ? styles.winnerTeam : ''}`}>
          <span className={styles.teamFlag}>{homeFlag}</span>
          <span className={styles.teamName}>{homeName}</span>
          {homeWins && <span className={styles.winnerBadge}>✓</span>}
        </div>
        <div className={styles.scoreBlock}>
          {isLive || isFinished ? (
            <span className={styles.scoreText}>{homeScore ?? 0} — {awayScore ?? 0}</span>
          ) : (
            <span className={styles.vsText}>VS</span>
          )}
        </div>
        <div className={`${styles.teamBlock} ${styles.teamBlockRight} ${awayWins ? styles.winnerTeam : ''}`}>
          {awayWins && <span className={styles.winnerBadge}>✓</span>}
          <span className={styles.teamName}>{awayName}</span>
          <span className={styles.teamFlag}>{awayFlag}</span>
        </div>
      </div>

      {match.venue && (
        <div className={styles.venue}>{match.venue}</div>
      )}
    </div>
  )
}

function TBDFullCard() {
  return (
    <div className={`${styles.fullCard} ${styles.tbdCard}`}>
      <div className={styles.matchRow}>
        <div className={styles.teamBlock}>
          <span className={styles.tbdFlag}>🏳️</span>
          <span className={styles.tbdName}>Por definir</span>
        </div>
        <div className={styles.scoreBlock}>
          <span className={styles.vsText}>VS</span>
        </div>
        <div className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          <span className={styles.tbdName}>Por definir</span>
          <span className={styles.tbdFlag}>🏳️</span>
        </div>
      </div>
    </div>
  )
}

function MiniMatchCard({ match }) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE'
  const homeName = teamNameES(match.homeTeam.name)
  const awayName = teamNameES(match.awayTeam.name)
  const homeFlag = teamFlag(match.homeTeam.name)
  const awayFlag = teamFlag(match.awayTeam.name)
  const homeScore = match.score?.fullTime?.home
  const awayScore = match.score?.fullTime?.away

  return (
    <div className={`${styles.miniCard} ${isLive ? styles.miniLive : ''}`}>
      <div className={styles.miniTeam}>
        <span>{homeFlag}</span>
        <span className={styles.miniName}>{homeName}</span>
        {(isFinished || isLive) && <span className={styles.miniScore}>{homeScore ?? 0}</span>}
      </div>
      <div className={styles.miniTeam}>
        <span>{awayFlag}</span>
        <span className={styles.miniName}>{awayName}</span>
        {(isFinished || isLive) && <span className={styles.miniScore}>{awayScore ?? 0}</span>}
      </div>
    </div>
  )
}

function TBDCard() {
  return (
    <div className={`${styles.miniCard} ${styles.miniTbd}`}>
      <div className={styles.miniTeam}>
        <span style={{ fontSize: '.8rem' }}>🏳️</span>
        <span className={styles.tbdName}>Por definir</span>
      </div>
      <div className={styles.miniTeam}>
        <span style={{ fontSize: '.8rem' }}>🏳️</span>
        <span className={styles.tbdName}>Por definir</span>
      </div>
    </div>
  )
}
