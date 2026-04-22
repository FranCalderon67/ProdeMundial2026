// Endpoint que calcula los puntos de las predicciones
// Se ejecuta automáticamente vía Vercel Cron

const COMPETITION_ID = 2014 // La Liga (cambiar a 2000 para Mundial 2026)
const POINTS_EXACT = 5
const POINTS_WINNER = 2

function calcPoints(predHome, predAway, realHome, realAway) {
  if (predHome === realHome && predAway === realAway) return POINTS_EXACT
  const predWinner = Math.sign(predHome - predAway)
  const realWinner = Math.sign(realHome - realAway)
  if (predWinner === realWinner) return POINTS_WINNER
  return 0
}

export default async function handler(req, res) {
  // Seguridad: solo permitir llamadas con el token correcto
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // 1. Traer partidos terminados desde football-data.org
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/matches?status=FINISHED`,
      { headers: { 'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY } }
    )

    if (!apiRes.ok) {
      throw new Error(`API error: ${apiRes.status}`)
    }

    const apiData = await apiRes.json()
    const finishedMatches = apiData.matches || []

    if (finishedMatches.length === 0) {
      return res.json({ message: 'No hay partidos terminados', updated: 0 })
    }

    const finishedIds = finishedMatches.map(m => m.id)

    // 2. Traer predicciones de Supabase con points NULL para esos partidos
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const predictionsRes = await fetch(
      `${supabaseUrl}/rest/v1/predictions?points=is.null&match_id=in.(${finishedIds.join(',')})`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    if (!predictionsRes.ok) {
      throw new Error(`Supabase error: ${predictionsRes.status}`)
    }

    const predictions = await predictionsRes.json()

    if (predictions.length === 0) {
      return res.json({ message: 'No hay predicciones pendientes de cálculo', updated: 0 })
    }

    // 3. Calcular puntos de cada predicción
    const updates = []
    for (const prediction of predictions) {
      const match = finishedMatches.find(m => m.id === prediction.match_id)
      if (!match) continue

      const realHome = match.score.fullTime.home
      const realAway = match.score.fullTime.away
      if (realHome === null || realAway === null) continue

      const points = calcPoints(
        prediction.home_goals,
        prediction.away_goals,
        realHome,
        realAway
      )

      updates.push({ id: prediction.id, points })
    }

    // 4. Actualizar cada predicción en Supabase
    let updatedCount = 0
    for (const update of updates) {
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/predictions?id=eq.${update.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ points: update.points }),
        }
      )
      if (updateRes.ok) updatedCount++
    }

    return res.json({
      message: 'Puntos calculados',
      finishedMatches: finishedMatches.length,
      pendingPredictions: predictions.length,
      updated: updatedCount,
    })
  } catch (error) {
    console.error('Error calculando puntos:', error)
    return res.status(500).json({ error: error.message })
  }
}
