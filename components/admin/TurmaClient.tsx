'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function TurmaClient({ turma, sessoesTurma, inscricoes, convites: initialConvites }: any) {
  const supabase = createClient()
  const [sessoes, setSessoes] = useState(sessoesTurma)
  const [convites, setConvites] = useState(initialConvites)
  const [gerandoConvite, setGerandoConvite] = useState(false)

  async function toggleSessao(stId: string, atual: boolean) {
    await supabase.from('sessoes_turma').update({ ativa: !atual }).eq('id', stId)
    setSessoes(sessoes.map((s: any) => s.id === stId ? { ...s, ativa: !atual } : s))
  }

  async function gerarConvite() {
    setGerandoConvite(true)
    const { data } = await supabase
      .from('convites')
      .insert({ turma_id: turma.id })
      .select()
      .single()
    if (data) setConvites([data, ...convites])
    setGerandoConvite(false)
  }

  function copyLink(token: string) {
    const url = `${location.origin}/auth/registo?convite=${token}`
    navigator.clipboard.writeText(url)
  }

  const curso = turma.cursos as any

  return (
    <main className="p-6">
      <div className="mb-6">
        <p className="text-xs font-bold text-accent uppercase tracking-wider">{curso?.codigo}</p>
        <h2 className="font-display font-extrabold text-xl">{turma.nome}</h2>
        <p className="text-sm text-gray-400">{curso?.nome} · {formatDate(turma.data_inicio)} → {formatDate(turma.data_fim)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessões */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-sm mb-4">Sessões — activar/desactivar</h3>
          <div className="space-y-0.5">
            {sessoes.map((st: any) => (
              <div key={st.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${st.ativa ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {st.sessoes?.numero}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{st.sessoes?.titulo}</p>
                  <p className="text-xs text-gray-400">{formatDate(st.data_real)}</p>
                </div>
                <button onClick={() => toggleSessao(st.id, st.ativa)}
                  className={`relative w-10 h-5.5 rounded-full border-none cursor-pointer transition-colors flex-shrink-0 ${st.ativa ? 'bg-accent' : 'bg-gray-200'}`}
                  style={{ width: '40px', height: '22px' }}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${st.ativa ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                    style={{ transform: st.ativa ? 'translateX(20px)' : 'translateX(2px)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Alunos */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-3">Alunos inscritos ({inscricoes.length})</h3>
            {inscricoes.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">Nenhum aluno inscrito ainda.</p>
            ) : inscricoes.map((i: any) => (
              <div key={i.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  {(i.perfis?.nome ?? i.email ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{i.perfis?.nome ?? '—'}</p>
                  <p className="text-xs text-gray-400 truncate">{i.email}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Convites */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm">Convites</h3>
              <button onClick={gerarConvite} disabled={gerandoConvite}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
                {gerandoConvite ? '...' : '+ Gerar link'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Cada link é de uso único. O aluno clica, cria conta e fica automaticamente inscrito.
            </p>
            {convites.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Nenhum convite gerado.</p>
            ) : convites.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-accent truncate">{`${location.origin}/auth/registo?convite=${c.token}`}</p>
                  <p className="text-xs text-gray-400">{new Date(c.criado_em).toLocaleString('pt-PT')} · {c.usado ? <span className="text-teal">Utilizado</span> : 'Disponível'}</p>
                </div>
                {!c.usado && (
                  <button onClick={() => copyLink(c.token)}
                    className="text-xs text-gray-400 hover:text-ink border border-gray-200 px-2 py-1 rounded-md hover:border-gray-400 transition-colors flex-shrink-0">
                    Copiar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
