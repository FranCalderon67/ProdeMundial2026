// football-data.org — Plan gratuito: 10 requests/minuto
// En desarrollo usa el proxy de Vite, en producción usa la Serverless Function de Vercel

const IS_DEV = import.meta.env.DEV
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY
const WC_ID = 2000

// Caché en memoria: 5 minutos para no superar el límite del plan gratuito
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

async function fetchFD(endpoint) {
  const cached = cache.get(endpoint)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // En desarrollo: proxy de Vite (/api-football/v4/...)
  // En producción: serverless function de Vercel (/api/football?path=/v4/...)
  let res
  if (IS_DEV) {
    res = await fetch(`/api-football/v4${endpoint}`, {
      headers: { 'X-Auth-Token': API_KEY },
    })
  } else {
    // Separar path y query params
    const [path, query] = endpoint.includes('?')
      ? endpoint.split('?')
      : [endpoint, '']
    const params = new URLSearchParams(query)
    params.set('path', '/v4' + path)
    res = await fetch(`/api/football?${params.toString()}`)
  }

  if (res.status === 429) {
    // Si hay caché viejo, devolverlo antes que nada
    if (cached) return cached.data
    throw new Error('Límite de requests alcanzado. Intentá en un minuto.')
  }

  if (res.status === 403) {
    throw new Error('Esta función requiere un plan superior en football-data.org')
  }

  if (!res.ok) {
    throw new Error(`Error API: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  cache.set(endpoint, { data, timestamp: Date.now() })
  return data
}

export async function getMatches(status = null) {
  const query = status ? `?status=${status}` : ''
  return fetchFD(`/competitions/${WC_ID}/matches${query}`)
}

export async function getUpcomingMatches(limit = 5) {
  const data = await getMatches('SCHEDULED')
  return (data.matches || []).slice(0, limit)
}

export async function getLiveMatches() {
  const data = await getMatches('LIVE')
  return data.matches || []
}

export async function getFinishedMatches() {
  const data = await getMatches('FINISHED')
  return data.matches || []
}

export async function getStandings() {
  return fetchFD(`/competitions/${WC_ID}/standings`)
}

export async function getTeams() {
  return fetchFD(`/competitions/${WC_ID}/teams`)
}

export const TEAM_NAMES_ES = {
  'Argentina': 'Argentina',
  'Brazil': 'Brasil',
  'France': 'Francia',
  'Germany': 'Alemania',
  'Spain': 'España',
  'England': 'Inglaterra',
  'Portugal': 'Portugal',
  'Netherlands': 'Países Bajos',
  'Belgium': 'Bélgica',
  'Uruguay': 'Uruguay',
  'Mexico': 'México',
  'United States': 'Estados Unidos',
  'Canada': 'Canadá',
  'Japan': 'Japón',
  'South Korea': 'Corea del Sur',
  'Morocco': 'Marruecos',
  'Senegal': 'Senegal',
  'Ghana': 'Ghana',
  'Cameroon': 'Camerún',
  'Australia': 'Australia',
  'Switzerland': 'Suiza',
  'Croatia': 'Croacia',
  'Denmark': 'Dinamarca',
  'Poland': 'Polonia',
  'Serbia': 'Serbia',
  'Ecuador': 'Ecuador',
  'Peru': 'Perú',
  'Colombia': 'Colombia',
  'Chile': 'Chile',
  'Costa Rica': 'Costa Rica',
  'Honduras': 'Honduras',
  'Panama': 'Panamá',
  'Saudi Arabia': 'Arabia Saudita',
  'Iran': 'Irán',
  'Qatar': 'Catar',
  'Tunisia': 'Túnez',
  'Wales': 'Gales',
  'Turkey': 'Turquía',
  'Ukraine': 'Ucrania',
  'Hungary': 'Hungría',
  'Slovakia': 'Eslovaquia',
  'Slovenia': 'Eslovenia',
  'Nigeria': 'Nigeria',
  'Egypt': 'Egipto',
  'Algeria': 'Argelia',
  'South Africa': 'Sudáfrica',
  'Ivory Coast': 'Costa de Marfil',
  'New Zealand': 'Nueva Zelanda',
  'Jamaica': 'Jamaica',
  'Venezuela': 'Venezuela',
  'Bolivia': 'Bolivia',
  'Paraguay': 'Paraguay',
  'Indonesia': 'Indonesia',
  'China': 'China',
  'Iraq': 'Irak',
  'UAE': 'Emiratos Árabes Unidos',
}

export function teamNameES(nameEN) {
  return TEAM_NAMES_ES[nameEN] || nameEN
}

export const TEAM_FLAGS = {
  'Argentina': '🇦🇷',
  'Brazil': '🇧🇷',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Uruguay': '🇺🇾',
  'Mexico': '🇲🇽',
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Morocco': '🇲🇦',
  'Senegal': '🇸🇳',
  'Switzerland': '🇨🇭',
  'Croatia': '🇭🇷',
  'Denmark': '🇩🇰',
  'Poland': '🇵🇱',
  'Serbia': '🇷🇸',
  'Ecuador': '🇪🇨',
  'Australia': '🇦🇺',
  'Saudi Arabia': '🇸🇦',
  'Iran': '🇮🇷',
  'Qatar': '🇶🇦',
  'Cameroon': '🇨🇲',
  'Ghana': '🇬🇭',
  'Tunisia': '🇹🇳',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Turkey': '🇹🇷',
  'Ukraine': '🇺🇦',
  'Costa Rica': '🇨🇷',
  'Peru': '🇵🇪',
  'Colombia': '🇨🇴',
  'Chile': '🇨🇱',
  'Paraguay': '🇵🇾',
  'Venezuela': '🇻🇪',
  'Bolivia': '🇧🇴',
  'Nigeria': '🇳🇬',
  'Egypt': '🇪🇬',
  'South Africa': '🇿🇦',
  'Ivory Coast': '🇨🇮',
  'Honduras': '🇭🇳',
  'Panama': '🇵🇦',
  'Jamaica': '🇯🇲',
  'New Zealand': '🇳🇿',
  'Indonesia': '🇮🇩',
  'China': '🇨🇳',
  'Iraq': '🇮🇶',
}

export function teamFlag(nameEN) {
  return TEAM_FLAGS[nameEN] || '🏳️'
}
