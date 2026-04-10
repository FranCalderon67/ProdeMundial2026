import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { calcPoints } from '../lib/points'
import { useAuth } from './useAuth'

/**
 * Hook que corre en background y actualiza los puntos
 * de las predicciones de partidos terminados.
 * Se ejecuta al montar y cada 5 minutos.
 */
export function usePointsCalculator(finishedMatches) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !finishedMatches.length) return
    calculatePoints()
  }, [user, finishedMatches])

  async function calculatePoints() {
    // Traer todas las predicciones del usuario para partidos terminados
    const finishedIds = finishedMatches.map(m => m.id)

    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .in('match_id', finishedIds)
      .is('points', null) // Solo las que aún no tienen puntos calculados

    if (error || !predictions?.length) return

    // Calcular puntos para cada predicción
    const updates = predictions.map(prediction => {
      const match = finishedMatches.find(m => m.id === prediction.match_id)
      if (!match) return null

      const realHome = match.score.fullTime.home
      const realAway = match.score.fullTime.away

      // Si el partido no tiene resultado final aún, saltar
      if (realHome === null || realAway === null) return null

      const points = calcPoints(
        prediction.home_goals,
        prediction.away_goals,
        realHome,
        realAway
      )

      return { id: prediction.id, points }
    }).filter(Boolean)

    if (!updates.length) return

    // Actualizar en Supabase
    await Promise.all(
      updates.map(({ id, points }) =>
        supabase
          .from('predictions')
          .update({ points })
          .eq('id', id)
      )
    )

    console.log(`✅ Puntos calculados para ${updates.length} predicción/es`)
  }
}
