import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRanking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchRanking()
    const interval = setInterval(fetchRanking, 2 * 60_000)
    return () => clearInterval(interval)
  }, [])

  async function fetchRanking() {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')

    if (profilesError) { setLoading(false); return }

    const { data: predictions } = await supabase
      .from('predictions')
      .select('user_id, points')
      .not('points', 'is', null)

    const pointsMap = {}
    const exactMap = {}
    const winnerMap = {}

    ;(predictions || []).forEach(({ user_id, points }) => {
      if (!pointsMap[user_id]) { pointsMap[user_id] = 0; exactMap[user_id] = 0; winnerMap[user_id] = 0 }
      pointsMap[user_id] += points
      if (points === 5) exactMap[user_id]++
      if (points === 2) winnerMap[user_id]++
    })

    const ranked = profiles
      .map(p => ({
        ...p,
        points: pointsMap[p.id] || 0,
        exact: exactMap[p.id] || 0,
        winner: winnerMap[p.id] || 0,
      }))
      .sort((a, b) => b.points !== a.points ? b.points - a.points : b.exact - a.exact)

    setRanking(ranked)
    setLoading(false)
  }

  return { ranking, loading, lastUpdated, refetch: fetchRanking }
}
