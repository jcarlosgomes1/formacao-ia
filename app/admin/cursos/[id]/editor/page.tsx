'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { stepTypeLabel, stepTypeColor, formatBytes, getFileIcon } from '@/lib/utils'
import type { Curso, Sessao, Passo, Ficheiro } from '@/types'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [curso, setCurso] = useState<Curso | null>(null)
  const [sessaoAtiva, setSessaoAtiva] = useState<Sessao | null>(null)
  const [passos, setPassos] = useState<Passo[]>([])
  const [ficheiros, setFicheiros] = useState<Ficheiro[]>([])
  const [passoAtivo, setPassoAtivo] = useState<Passo | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [gerandoPassos, setGerandoPassos] = useState(false)

  useEffect(() => { loadCurso() }, [id])
  useEffect(() => { if (sessaoAtiva) { loadPassos(); loadFicheiros() } }, [sessaoAtiva])

  async function loadCurso() {
    const { data } = await supabase
      .from('cursos')
      .select('*, sessoes(*)')
      .eq('id', id)
      .single()
    if (data) {
      setCurso(data)
      if (data.sessoes?.length) {
        const sorted = [...data.sessoes].sort((a: Sessao, b: Sessao) => a.numero - b.numero)
        setSessaoAtiva(sorted[0])
      }
    }
    setLoading(false)
  }

  async function loadPassos() {
    if (!sessaoAtiva) return
    const { data } = await supabase
      .from('passos')
      .select('*')
      .eq('sessao_id', sessaoAtiva.id)
      .order('ordem')
    setPassos(data ?? [])
  }

  async function loadFicheiros() {
    if (!sessaoAtiva) return
    const { data } = await supabase
      .from('ficheiros')
      .select('*')
      .eq('sessao_id', sessaoAtiva.id)
    setFicheiros(data ?? [])
  }

  async function addPasso(tipo: Passo['tipo']) {
    if (!sessaoAtiva) return
    const { data } = await supabase.from('passos').insert({
      sessao_id: sessaoAtiva.id,
      titulo: 'Novo passo',
      tipo,
      ordem: passos.length,
      para_formador: true,
      para_aluno: tipo !== 'demo',
    }).select().single()
    if (data) { setPassos([...passos, data]); setPassoAtivo(data) }
  }

  async function updatePasso(id: string, updates: Partial<Passo>) {
    await supabase.from('passos').update(updates).eq('id', id)
    setPassos(passos.map(p => p.id === id ? { ...p, ...updates } : p))
    if (passoAtivo?.id === id) setPassoAtivo({ ...passoAtivo, ...updates })
  }

  async function deletePasso(passoId: string) {
    await supabase.from('passos').delete().eq('id', passoId)
    setPassos(passos.filter(p => p.id !== passoId))
    if (passoAtivo?.id === passoId) setPassoAtivo(null)
  }

  async function uploadFicheiro(file: File) {
    if (!sessaoAtiva) return
    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const tipo = ext === 'xlsx' || ext === 'xls' ? 'excel'
      : ext === 'pdf' ? 'pdf'
      : ext === 'pptx' ? 'pptx'
      : ext === 'csv' ? 'csv' : 'outro'
    const path = `${sessaoAtiva.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('curso-ficheiros').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('curso-ficheiros').getPublicUrl(path)
      await supabase.from('ficheiros').insert({
        sessao_id: sessaoAtiva.id,
        nome: file.name,
        storage_path: path,
        url_publica: urlData.publicUrl,
        tipo,
        tamanho_bytes: file.size,
        passo_id: passoAtivo?.id ?? null,
      })
      await loadFicheiros()
    }
    setUploading(false)
  }

  async function gerarPassosComIA() {
    if (!sessaoAtiva) return
    setGerandoPassos(true)
    try {
      const fics = ficheiros.map(f => f.nome).join(', ')
      const res = await fetch('/api/gerar-passos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessaoTitulo: sessaoAtiva.titulo,
          sessaoDescricao: sessaoAtiva.descricao,
          cursoNome: curso?.nome,
          ficheiros: fics,
        }),
      })
      const data = await res.json()
      if (data.passos) {
        for (const [i, p] of data.passos.entries()) {
          await supabase.from('passos').insert({
            sessao_id: sessaoAtiva.id,
            titulo: p.titulo,
            tipo: p.tipo ?? 'instrucao',
            conteudo: p.conteudo ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: p.conteudo }] }] } : null,
            ordem: passos.length + i,
            para_formador: true,
            para_aluno: p.tipo !== 'demo',
          })
        }
        await loadPassos()
      }
    } catch {}
    setGerandoPassos(false)
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">A carregar...</div>
  if (!curso) return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Curso não encontrado.</div>

  const sessoes = (curso.sessoes ?? []).sort((a, b) => a.numero - b.numero)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <a href="/admin/cursos" className="text-gray-400 hover:text-gray-700 text-sm">← Cursos</a>
        <h1 className="font-display font-bold text-base flex-1">{curso.nome}</h1>
        <a href={`/admin/cursos/${id}`} className="btn-secondary text-xs">Gerir turmas</a>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sessões sidebar */}
        <div className="w-52 border-r border-gray-100 bg-white flex-shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessões</p>
          </div>
          {sessoes.map(s => (
            <button key={s.id} onClick={() => { setSessaoAtiva(s); setPassoAtivo(null) }}
              className={`w-full text-left px-3 py-3 text-sm border-b border-gray-50 transition-colors ${sessaoAtiva?.id === s.id ? 'bg-accent/5 text-accent font-semibold' : 'hover:bg-gray-50 text-gray-600'}`}>
              <span className="text-xs text-gray-400 font-mono mr-1">{String(s.numero).padStart(2,'0')}</span>
              {s.titulo}
            </button>
          ))}
        </div>

        {/* Passos da sessão */}
        <div className="w-64 border-r border-gray-100 bg-surf flex-shrink-0 flex flex-col overflow-hidden">
          {sessaoAtiva && (
            <>
              <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Passos</p>
                <div className="flex gap-1">
                  <button onClick={() => gerarPassosComIA()} disabled={gerandoPassos}
                    className="text-xs bg-ink2 text-white px-2 py-1 rounded font-medium hover:bg-ink3 transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="Gerar passos com IA">
                    {gerandoPassos ? '⟳' : '✦'} IA
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {passos.map((p, i) => (
                  <button key={p.id} onClick={() => setPassoAtivo(p)}
                    className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors group ${passoAtivo?.id === p.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-white'}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-400 font-mono mt-0.5 flex-shrink-0">{String(i+1).padStart(2,'0')}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs leading-tight truncate">{p.titulo}</p>
                        <span className={`badge text-xs mt-1 border ${stepTypeColor(p.tipo)}`}>{stepTypeLabel(p.tipo)}</span>
                      </div>
                    </div>
                  </button>
                ))}

                <div className="pt-2 space-y-1">
                  {(['instrucao','demo','exercicio','nota','aviso'] as Passo['tipo'][]).map(tipo => (
                    <button key={tipo} onClick={() => addPasso(tipo)}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors">
                      + {stepTypeLabel(tipo)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload ficheiros */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ficheiros da sessão</p>
                <label className="block w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 text-center cursor-pointer hover:border-accent hover:text-accent transition-colors">
                  {uploading ? 'A carregar...' : '+ Adicionar ficheiro'}
                  <input type="file" className="hidden" multiple
                    onChange={e => Array.from(e.target.files ?? []).forEach(uploadFicheiro)} />
                </label>
                {ficheiros.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {ficheiros.map(f => (
                      <div key={f.id} className="flex items-center gap-1.5 text-xs text-gray-500 p-1 rounded hover:bg-gray-50">
                        <span>{getFileIcon(f.tipo)}</span>
                        <span className="flex-1 truncate">{f.nome}</span>
                        <span className="text-gray-300">{formatBytes(f.tamanho_bytes)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Editor do passo */}
        <div className="flex-1 bg-white overflow-y-auto">
          {!passoAtivo ? (
            <div className="flex items-center justify-center h-full text-gray-300">
              <div className="text-center">
                <p className="text-5xl mb-3">✏️</p>
                <p className="font-display font-bold text-lg text-gray-400">Selecciona ou cria um passo</p>
                <p className="text-sm text-gray-300 mt-1">Escolhe um passo à esquerda ou adiciona um novo</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={`badge border ${stepTypeColor(passoAtivo.tipo)}`}>{stepTypeLabel(passoAtivo.tipo)}</span>
                <button onClick={() => deletePasso(passoAtivo.id)}
                  className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors">
                  Eliminar passo
                </button>
              </div>

              <div className="mb-4">
                <label className="label">Título do passo</label>
                <input value={passoAtivo.titulo}
                  onChange={e => updatePasso(passoAtivo.id, { titulo: e.target.value })}
                  className="input text-base font-medium" placeholder="Título descritivo do passo" />
              </div>

              <div className="mb-4">
                <label className="label">Tipo</label>
                <select value={passoAtivo.tipo}
                  onChange={e => updatePasso(passoAtivo.id, { tipo: e.target.value as Passo['tipo'] })}
                  className="input">
                  <option value="instrucao">Instrução</option>
                  <option value="demo">Demonstração (formador)</option>
                  <option value="exercicio">Exercício (aluno)</option>
                  <option value="nota">Nota informativa</option>
                  <option value="aviso">Aviso importante</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="label">Conteúdo</label>
                <textarea
                  value={typeof passoAtivo.conteudo === 'object' && passoAtivo.conteudo !== null
                    ? (passoAtivo.conteudo as any)?.content?.[0]?.content?.[0]?.text ?? ''
                    : ''}
                  onChange={e => updatePasso(passoAtivo.id, {
                    conteudo: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: e.target.value }] }] }
                  })}
                  className="input resize-none" rows={8}
                  placeholder="Escreve o conteúdo detalhado deste passo. Podes usar a IA para gerar sugestões." />
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={passoAtivo.para_formador}
                    onChange={e => updatePasso(passoAtivo.id, { para_formador: e.target.checked })}
                    className="w-4 h-4 accent-accent" />
                  <span className="text-sm text-gray-600">Visível no guião do formador</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={passoAtivo.para_aluno}
                    onChange={e => updatePasso(passoAtivo.id, { para_aluno: e.target.checked })}
                    className="w-4 h-4 accent-accent" />
                  <span className="text-sm text-gray-600">Visível no guia do aluno</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
