'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou password incorrectos.'); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ink2 flex flex-col">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 65% 20%, rgba(108,60,225,.4), transparent 65%), radial-gradient(ellipse 50% 40% at 5% 85%, rgba(225,168,60,.25), transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <header className="relative z-10 p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-display font-bold text-white text-sm">
          Formação em <span className="text-accent2">IA</span>
        </span>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6 gap-16 flex-wrap">
        <div className="max-w-sm text-white hidden md:block">
          <p className="text-xs font-bold tracking-widest uppercase text-accent2 mb-3">Plataforma de Formação</p>
          <h1 className="font-display font-extrabold text-4xl leading-tight mb-4">
            Aprende a automatizar com <span className="text-accent2">Inteligência Artificial</span>
          </h1>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            Power Query, Power Automate e IA Generativa.
          </p>
          {['Guias passo a passo por sessão', 'Progresso individual guardado', 'Sessões controladas pelo formador', 'Acesso por convite seguro', 'Gestão completa multi-curso'].map(f => (
            <div key={f} className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent2 flex-shrink-0" />
              <span className="text-sm text-white/60">{f}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleLogin}
          className="w-full max-w-sm bg-white/7 backdrop-blur-xl border border-white/10 rounded-2xl p-9"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <h2 className="font-display font-bold text-white text-xl mb-1">Entrar na plataforma</h2>
          <p className="text-white/40 text-sm mb-6">Alunos e formadores usam o mesmo login.</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-wider text-white/50 uppercase mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="nome@email.com"
              className="w-full px-3 py-2.5 rounded-lg border border-white/13 bg-white/7 text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent focus:bg-white/11 transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.13)' }} />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-wider text-white/50 uppercase mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.13)' }} />
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-accent text-white font-bold rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-60 font-display tracking-wide mt-1">
            {loading ? 'A entrar...' : 'Entrar'}
          </button>

          <p className="text-center mt-3">
            <Link href="/auth/recuperar" className="text-accent2 text-xs hover:underline">
              Esqueci a password
            </Link>
          </p>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/22 text-xs">ou</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <Link href="/auth/registo"
            className="block w-full py-2.5 text-center border text-white/60 text-sm rounded-lg hover:text-white hover:border-white/40 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.17)' }}>
            Criar conta
          </Link>
        </form>
      </div>
    </div>
  )
}
