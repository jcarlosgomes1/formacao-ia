'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Curso, Sessao } from '@/types'

export default function NovaTurmaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cursoId, setCursoId] = useState('')
  const [sessoesCurso, setSessoesCurso] = useState<Sessao[]>([])
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('cursos').select('*').eq('ativo', true).then(({ data }) => setCursos(data ?? []))
  }, [])

  useEffect(() => {
    if (!cursoId) { setSessoesCurso([]); return }
    supabase.from('sessoes').select('*').eq('curso_id', cursoId).order('numero')
      .then(({ data }) => setSessoesCurso(data ?? []))
  }, [cursoId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: turma } = await supabase.from('turmas').insert({
      curso_id: cursoId,
      codigo,
      nome,
      formador_id: user!.id,
      data_inicio: inicio || null,
      data_fim: fim || null,
    }).select().single()

    if (turma && sessoesCurso.length) {
      await supabase.from('sessoes_turma').insert(
        sessoesCurso.map((s, i) => ({
          turma_id: turma.id,
          sessao_id: s.id,
          ativa: i === 0, // primeira sessão activa por defeito
        }))
      )
    }

    router.push(`/admin/turmas/${turma?.id}`)
  }

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <a href="/admin/turmas" className="text-gray-400 hover:text-gray-700 text-sm">← Turmas</a>
        <h1 className="font-display font-bold text-base">Nova turma</h1>
      </div>
      <main className="p-6">
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="card p-6 space-y-4">
            <div>
              <label className="label">Curso</label>
              <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="input" required>
                <option value="">Seleccionar curso...</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>
                ))}
              </select>
            </div>

            {sessoesCurso.length > 0 && (
              <div className="bg-surf rounded-lg p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {sessoesCurso.length} sessões incluídas
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {sessoesCurso.map(s => (
                    <p key={s.id} className="text-xs text-gray-500">
                      <span className="font-mono text-gray-400 mr-1">{String(s.numero).padStart(2,'0')}</span>
                      {s.titulo}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label">Código da turma</label>
              <input value={codigo} onChange={e => setCodigo(e.target.value)} className="input" placeholder="ex: FB464/002" required />
            </div>
            <div>
              <label className="label">Nome / Descrição</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="input" placeholder="ex: Turma 2 — Out 2026" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Data início</label>
                <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Data fim</label>
                <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || !cursoId || !codigo || !nome}
            className="btn-primary w-full py-3 disabled:opacity-40">
            {loading ? 'A criar...' : 'Criar turma'}
          </button>
        </form>
      </main>
    </>
  )
}
