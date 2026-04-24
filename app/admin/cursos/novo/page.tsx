'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NovoCursoPage() {
  const [step, setStep] = useState<'form' | 'sessions'>('form')
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [template, setTemplate] = useState(false)
  const [numSessoes, setNumSessoes] = useState(10)
  const [duracaoMin, setDuracaoMin] = useState(180)
  const [sessoes, setSessoes] = useState<{ numero: number; titulo: string; descricao: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [gerandoIA, setGerandoIA] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function initSessoes(n: number) {
    setSessoes(Array.from({ length: n }, (_, i) => ({
      numero: i + 1, titulo: `Sessão ${i + 1}`, descricao: ''
    })))
    setStep('sessions')
  }

  async function gerarComIA() {
    setGerandoIA(true)
    try {
      const res = await fetch('/api/gerar-sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao, numSessoes, duracaoMin }),
      })
      const data = await res.json()
      if (data.sessoes) setSessoes(data.sessoes)
    } catch {}
    setGerandoIA(false)
    setStep('sessions')
  }

  async function handleSubmit() {
    setLoading(true)
    const { data: curso, error } = await supabase
      .from('cursos')
      .insert({ codigo, nome, descricao, template })
      .select()
      .single()

    if (error || !curso) { setLoading(false); return }

    await supabase.from('sessoes').insert(
      sessoes.map(s => ({
        curso_id: curso.id,
        numero: s.numero,
        titulo: s.titulo,
        descricao: s.descricao || null,
        duracao_minutos: duracaoMin,
      }))
    )

    router.push(`/admin/cursos/${curso.id}/editor`)
  }

  if (step === 'sessions') return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <button onClick={() => setStep('form')} className="text-gray-400 hover:text-gray-700 text-sm">← Voltar</button>
        <h1 className="font-display font-bold text-base flex-1">Definir sessões — {nome}</h1>
        <button onClick={handleSubmit} disabled={loading}
          className="btn-primary disabled:opacity-60">
          {loading ? 'A criar...' : 'Criar curso'}
        </button>
      </div>
      <main className="p-6 flex-1">
        <p className="text-sm text-gray-500 mb-4">Revê e edita o título de cada sessão. Podes adicionar mais detalhes no editor de conteúdo depois.</p>
        <div className="space-y-2 max-w-2xl">
          {sessoes.map((s, i) => (
            <div key={i} className="card p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.numero}
              </div>
              <div className="flex-1 space-y-2">
                <input value={s.titulo} onChange={e => {
                  const ns = [...sessoes]; ns[i].titulo = e.target.value; setSessoes(ns)
                }} className="input font-medium" placeholder={`Título da sessão ${s.numero}`} />
                <input value={s.descricao} onChange={e => {
                  const ns = [...sessoes]; ns[i].descricao = e.target.value; setSessoes(ns)
                }} className="input text-sm" placeholder="Descrição breve (opcional)" />
              </div>
            </div>
          ))}
          <button onClick={() => setSessoes([...sessoes, { numero: sessoes.length + 1, titulo: `Sessão ${sessoes.length + 1}`, descricao: '' }])}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-accent hover:text-accent transition-colors">
            + Adicionar sessão
          </button>
        </div>
      </main>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <a href="/admin/cursos" className="text-gray-400 hover:text-gray-700 text-sm">← Cursos</a>
        <h1 className="font-display font-bold text-base">Novo curso</h1>
      </div>
      <main className="p-6 flex-1">
        <div className="max-w-lg">
          <div className="card p-6 space-y-4">
            <div>
              <label className="label">Código do curso</label>
              <input value={codigo} onChange={e => setCodigo(e.target.value)} className="input" placeholder="ex: FB465" />
            </div>
            <div>
              <label className="label">Nome do curso</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="input" placeholder="ex: Power BI para Gestores" />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                className="input resize-none" rows={3} placeholder="Descrição do curso, objectivos e público-alvo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nº de sessões</label>
                <input type="number" value={numSessoes} onChange={e => setNumSessoes(+e.target.value)}
                  min={1} max={50} className="input" />
              </div>
              <div>
                <label className="label">Duração (minutos)</label>
                <input type="number" value={duracaoMin} onChange={e => setDuracaoMin(+e.target.value)}
                  min={30} step={30} className="input" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={template} onChange={e => setTemplate(e.target.checked)}
                className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-600">Guardar como template reutilizável</span>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            <button onClick={gerarComIA} disabled={!nome || gerandoIA}
              className="w-full py-3 bg-ink2 text-white rounded-xl text-sm font-semibold hover:bg-ink3 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {gerandoIA ? (
                <><span className="animate-spin">⟳</span> A gerar com IA...</>
              ) : (
                <><span>✦</span> Gerar sessões com IA</>
              )}
            </button>
            <button onClick={() => initSessoes(numSessoes)} disabled={!codigo || !nome}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-40">
              Definir sessões manualmente
            </button>
          </div>

          {gerandoIA && (
            <p className="text-xs text-gray-400 text-center mt-2">
              A IA está a analisar o nome e descrição do curso para sugerir os títulos das sessões...
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
