// Lógica de puntos del Prode Mundial 2026
// 5 puntos: resultado exacto
// 2 puntos: ganador correcto (o empate correcto)
// 0 puntos: incorrecto

export const POINTS_EXACT = 5
export const POINTS_WINNER = 2
export const POINTS_NONE = 0

/**
 * Calcula los puntos de una predicción dado el resultado real
 * @param {number} predHome - Goles local predichos
 * @param {number} predAway - Goles visitante predichos
 * @param {number} realHome - Goles local reales
 * @param {number} realAway - Goles visitante reales
 * @returns {number} Puntos obtenidos
 */
export function calcPoints(predHome, predAway, realHome, realAway) {
  // Resultado exacto
  if (predHome === realHome && predAway === realAway) {
    return POINTS_EXACT
  }

  // Ganador correcto
  const predWinner = Math.sign(predHome - predAway) // -1, 0, 1
  const realWinner = Math.sign(realHome - realAway)
  if (predWinner === realWinner) {
    return POINTS_WINNER
  }

  return POINTS_NONE
}

/**
 * Devuelve un label descriptivo del resultado de la predicción
 */
export function pointsLabel(points) {
  if (points === POINTS_EXACT) return '¡Exacto!'
  if (points === POINTS_WINNER) return 'Ganador correcto'
  return 'Sin puntos'
}

/**
 * Verifica si un partido todavía se puede predecir
 * Regla: hasta 1 hora antes del inicio
 * @param {string} utcDate - Fecha UTC del partido (ISO string)
 */
export function canPredict(utcDate) {
  const matchTime = new Date(utcDate).getTime()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  return now < matchTime - oneHour
}

/**
 * Tiempo restante para predecir, en formato legible
 */
export function timeUntilClose(utcDate) {
  const matchTime = new Date(utcDate).getTime()
  const closeTime = matchTime - 60 * 60 * 1000
  const diff = closeTime - Date.now()

  if (diff <= 0) return 'Cerrado'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `Cierra en ${days}d ${hours}h`
  if (hours > 0) return `Cierra en ${hours}h ${minutes}m`
  return `Cierra en ${minutes}m`
}
