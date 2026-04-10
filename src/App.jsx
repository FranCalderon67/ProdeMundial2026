import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/AuthProvider'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout/Layout'
import AuthPage from './components/Auth/AuthPage'
import Dashboard from './components/Dashboard/Dashboard'
import Predictions from './pages/Predictions'
import Ranking from './pages/Ranking'
import Fixture from './pages/Fixture'
import Bracket from './pages/Bracket'
import Rules from './pages/Rules'

// Páginas placeholder (las construimos en las próximas sesiones)
function ComingSoon({ title }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--accent)', marginBottom: '.5rem' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--muted)' }}>Próximamente...</p>
    </div>
  )
}

// Ruta protegida — redirige al login si no hay sesión
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="predicciones" element={<Predictions />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="fixture" element={<Fixture />} />
        <Route path="llaves" element={<Bracket />} />
        
        <Route path="bases" element={<Rules />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
