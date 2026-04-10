import { useState, useEffect } from 'react'
import { getUpcomingMatches, getLiveMatches, getFinishedMatches } from '../lib/footballApi'

export function useMatches() {
  const [upcoming, setUpcoming] = useState([])
  const [live, setLive] = useState([])
  const [finished, setFinished] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
    // Refrescar cada 5 minutos para no superar el límite del plan gratuito
    const interval = setInterval(fetchAll, 5 * 60_000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    try {
      setError(null)
      const [upcomingData, liveData, finishedData] = await Promise.allSettled([
        getUpcomingMatches(10),
        getLiveMatches(),
        getFinishedMatches(),
      ])

      if (upcomingData.status === 'fulfilled') setUpcoming(upcomingData.value)
      if (liveData.status === 'fulfilled') setLive(liveData.value)
      if (finishedData.status === 'fulfilled') setFinished(finishedData.value)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { upcoming, live, finished, loading, error, refetch: fetchAll }
}
