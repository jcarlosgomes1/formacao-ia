'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RegistoPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const convite = params.get('convite')
  const supabase = createClient()

  async function handleRegisto(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
        emailRedirectTo: `${location.origin}/auth/confirmar${convite ? `?convite=${convite}` : ''}`,
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este email já tem conta. Faz login.'
        : 'Erro ao criar conta. Verifica os dados.')
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-ink2 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '20px', padding: '2.5rem' }}>
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display font-bold text-white text-xl mb-2">Verifica o teu email</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Enviámos um link de confirmação para <strong className="text-white">{email}</strong>.<br />
          Clica no link para activar a tua conta.
        </p>
        <Link href="/auth/login" className="block mt-6 text-accent2 text-sm hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink2 flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 65% 20%, rgba(108,60,225,.35), transparent 65%)' }} />

      <form onSubmit={handleRegisto}
        className="relative z-10 w-full max-w-sm"
        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '20px', padding: '2.25rem' }}>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-sm">Formação em <span className="text-accent2">IA</span></span>
        </div>

        <h2 className="font-display font-bold text-white text-xl mb-1">Criar conta</h2>
        <p className="text-white/40 text-sm mb-6">
          {convite ? 'Cria a tua conta para aceitar o convite.' : 'Usa o email do convite que recebeste.'}
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider text-white/50 uppercase mb-1.5">Nome completo</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required placeholder="João Silva"
            className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider text-white/50 uppercase mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nome@email.com"
            className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider text-white/50 uppercase mb-1.5">Password (mín. 8 caracteres)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }} />
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-accent text-white font-bold rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-60 font-display tracking-wide">
          {loading ? 'A criar...' : 'Criar conta'}
        </button>

        <p className="text-center mt-3 text-white/35 text-xs">
          Já tens conta?{' '}
          <Link href="/auth/login" className="text-accent2 hover:underline">Entrar</Link>
        </p>
      </form>
    </div>
  )
}
