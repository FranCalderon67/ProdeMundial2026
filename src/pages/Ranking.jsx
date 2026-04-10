import { useAuth } from '../hooks/useAuth'
import { useRanking } from '../hooks/useRanking'
import styles from './Ranking.module.css'

export default function Ranking() {
  const { user } = useAuth()
  const { ranking, loading, lastUpdated } = useRanking()

  const myPosition = ranking.findIndex(r => r.id === user?.id) + 1

  if (loading) {
    return <div style={{ padding: '2rem' }}><div className="spinner" /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ranking</h1>
          <p className={styles.sub}>
            {lastUpdated
              ? `Actualizado a las ${lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Clasificación general'
            }
          </p>
        </div>
        {myPosition > 0 && (
          <div className={styles.myPosition}>
            <div className={styles.myPositionNum}>{myPosition}°</div>
            <div className={styles.myPositionLabel}>tu posición</div>
          </div>
        )}
      </div>

      {ranking.length >= 3 && (
        <div className={styles.podium}>
          <div className={styles.podiumItem}>
            <div className={`${styles.podiumAvatar} ${styles.silver}`}>
              {getInitials(ranking[1].display_name)}
            </div>
            <div className={styles.podiumName}>{firstName(ranking[1].display_name)}</div>
            <div className={`${styles.podiumBlock} ${styles.silverBlock}`}>
              <div className={styles.podiumPos}>2°</div>
              <div className={styles.podiumPts}>{ranking[1].points} pts</div>
            </div>
          </div>
          <div className={`${styles.podiumItem} ${styles.first}`}>
            <div className={styles.crownIcon}>👑</div>
            <div className={`${styles.podiumAvatar} ${styles.gold}`}>
              {getInitials(ranking[0].display_name)}
            </div>
            <div className={styles.podiumName}>{firstName(ranking[0].display_name)}</div>
            <div className={`${styles.podiumBlock} ${styles.goldBlock}`}>
              <div className={styles.podiumPos}>1°</div>
              <div className={styles.podiumPts}>{ranking[0].points} pts</div>
            </div>
          </div>
          <div className={styles.podiumItem}>
            <div className={`${styles.podiumAvatar} ${styles.bronze}`}>
              {getInitials(ranking[2].display_name)}
            </div>
            <div className={styles.podiumName}>{firstName(ranking[2].display_name)}</div>
            <div className={`${styles.podiumBlock} ${styles.bronzeBlock}`}>
              <div className={styles.podiumPos}>3°</div>
              <div className={styles.podiumPts}>{ranking[2].points} pts</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span className={styles.colPos}>#</span>
          <span className={styles.colName}>Jugador</span>
          <span className={styles.colStat}>Exactos</span>
          <span className={styles.colStat}>Ganador</span>
          <span className={styles.colPts}>Puntos</span>
        </div>

        {ranking.length === 0 && (
          <div className={styles.empty}>
            Aún no hay puntos registrados. ¡El torneo empieza pronto!
          </div>
        )}

        {ranking.map((player, index) => {
          const isMe = player.id === user?.id
          const pos = index + 1
          return (
            <div key={player.id} className={`${styles.tableRow} ${isMe ? styles.myRow : ''}`}>
              <span className={`${styles.colPos} ${pos === 1 ? styles.gold : pos === 2 ? styles.silver : pos === 3 ? styles.bronze : ''}`}>
                {pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos}
              </span>
              <div className={styles.colName}>
                <div className={`${styles.avatar} ${isMe ? styles.avatarMe : ''}`}>
                  {getInitials(player.display_name)}
                </div>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>
                    {player.display_name}
                    {isMe && <span className={styles.meBadge}>vos</span>}
                  </span>
                  <span className={styles.playerPreds}>
                    {player.exact + player.winner} aciertos
                  </span>
                </div>
              </div>
              <span className={styles.colStat}>
                <span className={styles.exactBadge}>{player.exact}</span>
              </span>
              <span className={styles.colStat}>
                <span className={styles.winnerBadge}>{player.winner}</span>
              </span>
              <span className={`${styles.colPts} ${player.points > 0 ? styles.ptsActive : styles.ptsZero}`}>
                {player.points} pts
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.exactBadge}>5</span>
          <span>Resultado exacto</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.winnerBadge}>2</span>
          <span>Ganador correcto</span>
        </div>
      </div>
    </div>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function firstName(name) {
  if (!name) return '?'
  return name.split(' ')[0]
}
