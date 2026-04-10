import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Auth.module.css'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
      } else {
        if (!form.displayName.trim()) throw new Error('Ingresá tu nombre para continuar')
        await signUp(form.email, form.password, form.displayName)
        setSuccess('¡Cuenta creada! Iniciá sesión para continuar.')
        setMode('login')
        setForm(prev => ({ ...prev, password: '' }))
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Email o contraseña incorrectos.',
        'Email not confirmed': 'Confirmá tu email antes de ingresar.',
        'User already registered': 'Ya existe una cuenta con ese email.',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      }
      setError(msgs[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/logo-distrocuyo.png" alt="Distrocuyo" className={styles.logoImg} />
          <span className={styles.logoSub}>Prode Mundial 2026</span>
        </div>

        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              className={mode === 'login' ? styles.tabActive : styles.tab}
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
            >
              Ingresar
            </button>
            <button
              className={mode === 'register' ? styles.tabActive : styles.tab}
              onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'register' && (
              <div className={styles.field}>
                <label className={styles.label}>Nombre</label>
                <input name="displayName" type="text" placeholder="¿Cómo te llaman?" value={form.displayName} onChange={handleChange} className={styles.input} required />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input name="email" type="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} className={styles.input} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input name="password" type="password" placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'} value={form.password} onChange={handleChange} className={styles.input} required />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
        <p className={styles.footer}>Desarrollado por Cultura · Deploy en Azure Web App</p>
      </div>
    </div>
  )
}
