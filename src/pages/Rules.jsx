import styles from './Rules.module.css'

export default function Rules() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bases y Condiciones</h1>
        <p className={styles.sub}>Prode Mundial 2026 · Distrocuyo</p>
      </div>

      {/* Cómo participar */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👥</span>
          <h2 className={styles.sectionTitle}>¿Cómo participar?</h2>
        </div>
        <div className={styles.cardGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Registrate</div>
              <div className={styles.stepDesc}>Creá tu cuenta con tu email y contraseña. Solo pueden participar colaboradores de Distrocuyo.</div>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Predecí los partidos</div>
              <div className={styles.stepDesc}>Antes de cada partido, ingresá el resultado que creés que va a ocurrir. Podés predecir desde el fixture o el dashboard.</div>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>Acumulá puntos</div>
              <div className={styles.stepDesc}>Cada vez que acertás el resultado de un partido ganás puntos. ¡El que más puntos acumule al final del torneo gana!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema de puntos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏆</span>
          <h2 className={styles.sectionTitle}>Sistema de puntos</h2>
        </div>
        <div className={styles.pointsGrid}>
          <div className={`${styles.pointCard} ${styles.exactCard}`}>
            <div className={styles.pointsBig}>5</div>
            <div className={styles.pointsLabel}>puntos</div>
            <div className={styles.pointsDesc}>Resultado exacto</div>
            <div className={styles.pointsExample}>Predecís 2-1 y termina 2-1</div>
          </div>
          <div className={`${styles.pointCard} ${styles.winnerCard}`}>
            <div className={styles.pointsBig}>2</div>
            <div className={styles.pointsLabel}>puntos</div>
            <div className={styles.pointsDesc}>Ganador correcto</div>
            <div className={styles.pointsExample}>Predecís 2-1, termina 3-1 (mismo ganador)</div>
          </div>
          <div className={`${styles.pointCard} ${styles.noneCard}`}>
            <div className={styles.pointsBig}>0</div>
            <div className={styles.pointsLabel}>puntos</div>
            <div className={styles.pointsDesc}>Resultado incorrecto</div>
            <div className={styles.pointsExample}>Predecís 2-1 y termina 0-1</div>
          </div>
        </div>

        {/* Ejemplo interactivo */}
        <div className={styles.exampleBox}>
          <div className={styles.exampleTitle}>📊 Ejemplos de puntuación</div>
          <div className={styles.exampleTable}>
            <div className={styles.exampleRow}>
              <div className={styles.exampleMatch}>Argentina vs Francia</div>
              <div className={styles.examplePred}>Tu predicción: <strong>2 — 1</strong></div>
              <div className={styles.exampleResult}>Resultado: <strong>2 — 1</strong></div>
              <div className={`${styles.examplePts} ${styles.exact}`}>+5 pts ⭐</div>
            </div>
            <div className={styles.exampleRow}>
              <div className={styles.exampleMatch}>Brasil vs Alemania</div>
              <div className={styles.examplePred}>Tu predicción: <strong>1 — 0</strong></div>
              <div className={styles.exampleResult}>Resultado: <strong>3 — 0</strong></div>
              <div className={`${styles.examplePts} ${styles.winner}`}>+2 pts ✓</div>
            </div>
            <div className={styles.exampleRow}>
              <div className={styles.exampleMatch}>España vs Inglaterra</div>
              <div className={styles.examplePred}>Tu predicción: <strong>2 — 0</strong></div>
              <div className={styles.exampleResult}>Resultado: <strong>0 — 1</strong></div>
              <div className={`${styles.examplePts} ${styles.none}`}>0 pts ✗</div>
            </div>
            <div className={styles.exampleRow}>
              <div className={styles.exampleMatch}>México vs Canadá</div>
              <div className={styles.examplePred}>Tu predicción: <strong>1 — 1</strong></div>
              <div className={styles.exampleResult}>Resultado: <strong>1 — 1</strong></div>
              <div className={`${styles.examplePts} ${styles.exact}`}>+5 pts ⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Predicciones */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚡</span>
          <h2 className={styles.sectionTitle}>Predicciones</h2>
        </div>
        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>🕐</div>
            <div className={styles.ruleTitle}>Tiempo límite</div>
            <div className={styles.ruleDesc}>Las predicciones se cierran <strong>1 hora antes</strong> del inicio de cada partido. Una vez cerradas, no se pueden modificar.</div>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>✏️</div>
            <div className={styles.ruleTitle}>Modificaciones</div>
            <div className={styles.ruleDesc}>Podés editar tu predicción las veces que quieras hasta que se cierre el tiempo límite del partido.</div>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>📋</div>
            <div className={styles.ruleTitle}>Partidos a predecir</div>
            <div className={styles.ruleDesc}>Podés predecir todos los partidos del torneo, incluyendo fase de grupos y eliminatoria. No es obligatorio predecir todos.</div>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>🔒</div>
            <div className={styles.ruleTitle}>Predicciones no realizadas</div>
            <div className={styles.ruleDesc}>Si no predecís un partido antes del cierre, ese partido no suma ni resta puntos. Simplemente se omite.</div>
          </div>
        </div>
      </section>

      {/* Ranking */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📊</span>
          <h2 className={styles.sectionTitle}>Ranking y desempate</h2>
        </div>
        <div className={styles.rankingInfo}>
          <div className={styles.rankingMain}>
            <p>La clasificación general se ordena por <strong>puntos totales acumulados</strong> durante todo el torneo.</p>
            <p>En caso de empate en puntos, se aplican los siguientes criterios de desempate en orden:</p>
          </div>
          <div className={styles.tiebreakers}>
            <div className={styles.tieItem}>
              <span className={styles.tiePriority}>1°</span>
              <div>
                <div className={styles.tieTitle}>Mayor cantidad de resultados exactos (5 pts)</div>
                <div className={styles.tieDesc}>Quien acertó más marcadores exactos tiene prioridad.</div>
              </div>
            </div>
            <div className={styles.tieItem}>
              <span className={styles.tiePriority}>2°</span>
              <div>
                <div className={styles.tieTitle}>Mayor cantidad de ganadores correctos (2 pts)</div>
                <div className={styles.tieDesc}>Si persiste el empate, se considera quién acertó más veces el equipo ganador.</div>
              </div>
            </div>
            <div className={styles.tieItem}>
              <span className={styles.tiePriority}>3°</span>
              <div>
                <div className={styles.tieTitle}>Definición por la organización</div>
                <div className={styles.tieDesc}>En caso de empate total, la organización definirá el criterio final.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consideraciones generales */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitle}>Consideraciones generales</h2>
        </div>
        <div className={styles.generalList}>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>Este prode es de carácter interno y recreativo, organizado por Distrocuyo para sus colaboradores.</span>
          </div>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>Los resultados y marcadores se obtienen de fuentes oficiales a través de la API de football-data.org. En caso de discrepancia, prevalecerá el resultado oficial de FIFA/CONMEBOL.</span>
          </div>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>Los puntos se calculan automáticamente una vez finalizado cada partido. Puede haber una demora de algunos minutos.</span>
          </div>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>Si un partido es suspendido o anulado por la organización oficial, las predicciones de ese partido quedarán sin puntuación.</span>
          </div>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>La participación en este prode implica la aceptación de estas bases y condiciones.</span>
          </div>
          <div className={styles.generalItem}>
            <span className={styles.bullet} />
            <span>La organización se reserva el derecho de modificar estas bases con previo aviso a los participantes.</span>
          </div>
        </div>
      </section>
    </div>
  )
}
