import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchPredictions()
  }, [user])

  async function fetchPredictions() {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setPredictions(data || [])
    setLoading(false)
  }

  async function savePrediction(matchId, homeGoals, awayGoals) {
    if (!user) throw new Error('Debés iniciar sesión para predecir')

    // Upsert: crea o actualiza si ya predijo este partido
    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        user_id: user.id,
        match_id: matchId,
        home_goals: homeGoals,
        away_goals: awayGoals,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,match_id' })
      .select()
      .single()

    if (error) throw error

    // Actualizar estado local
    setPredictions(prev => {
      const exists = prev.findIndex(p => p.match_id === matchId)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = data
        return updated
      }
      return [data, ...prev]
    })

    return data
  }

  function getPrediction(matchId) {
    return predictions.find(p => p.match_id === matchId) || null
  }

  return { predictions, loading, savePrediction, getPrediction, refetch: fetchPredictions }
}
