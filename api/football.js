// Vercel Serverless Function — proxy para football-data.org
// Evita CORS y mantiene la API key segura en el servidor

export default async function handler(req, res) {
  // Permitir solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Reconstruir el path de la API desde la query
  // Ej: /api/football?path=/v4/competitions/2001/matches&status=LIVE
  const { path, ...queryParams } = req.query

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  // Construir query string con los parámetros restantes
  const queryString = new URLSearchParams(queryParams).toString()
  const url = `https://api.football-data.org${path}${queryString ? '?' + queryString : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY,
      },
    })

    const data = await response.json()

    // Pasar el status code original de la API
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Football API proxy error:', error)
    res.status(500).json({ error: 'Proxy error', message: error.message })
  }
}
