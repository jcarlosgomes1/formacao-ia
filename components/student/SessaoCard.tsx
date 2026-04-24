'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { stepTypeColor, stepTypeLabel, getFileIcon, formatBytes } from '@/lib/utils'
import type { Passo, Ficheiro } from '@/types'

interface SessaoTurmaWithData {
  id: string
  ativa: boolean
  data_real: string | null
  sessoes: {
    id: string
    numero: number
    titulo: string
    descricao: string | null
    passos: Passo[]
    ficheiros: Ficheiro[]
  }
}

export default function StudentSessaoCard({
  sessaoTurma, progresso, turmaId, userId
}: {
  sessaoTurma: SessaoTurmaWithData
  progresso: any[]
  turmaId: string
  userId: string
}) {
  const s = sessaoTurma.sessoes
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [localProg, setLocalProg] = useState(progresso)
  const [expandedPasso, setExpandedPasso] = useState<string | null>(null)

  const passosAluno = (s.passos ?? []).filter(p => p.para_aluno)
  const doneCount = passosAluno.filter(p => localProg.some(pr => pr.passo_id === p.id)).length
  const allDone = passosAluno.length > 0 && doneCount === passosAluno.length
  const st = !sessaoTurma.ativa ? 'locked' : allDone ? 'done' : 'open'

  async function checkPasso(passo: Passo) {
    const alreadyDone = localProg.some(p => p.passo_id === passo.id)
    if (alreadyDone) return

    setLocalProg([...localProg, { passo_id: passo.id, turma_id: turmaId }])
    await supabase.from('progresso').upsert({
      user_id: userId,
      turma_id: turmaId,
      passo_id: passo.id,
      concluido: true,
    }, { onConflict: 'user_id,turma_id,passo_id' })
  }

  function getConteudo(passo: Passo): string {
    if (!passo.conteudo) return ''
    try {
      const c = passo.conteudo as any
      return c?.content?.[0]?.content?.[0]?.text ?? ''
    } catch { return '' }
  }

  const badgeClass = {
    locked: 'bg-gray-100 text-gray-400',
    open: 'bg-accent text-white',
    done: 'bg-teal text-white',
  }[st]

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${sessaoTurma.ativa ? 'hover:bg-gray-50' : ''}`}
        onClick={() => sessaoTurma.ativa && setOpen(!open)}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${badgeClass}`}>
          {allDone ? '✓' : s.numero}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">{s.titulo}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {sessaoTurma.data_real ?? ''}
            {sessaoTurma.ativa && (
              <span className="text-teal font-semibold ml-1">
                {allDone ? ' · Concluído ✓' : ` · ${doneCount}/${passosAluno.length} passos`}
              </span>
            )}
          </p>
        </div>
        {!sessaoTurma.ativa
          ? <span className="text-sm">🔒</span>
          : <span className="text-xs text-gray-400 transition-transform duration-200" style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
        }
      </div>

      {open && sessaoTurma.ativa && (
        <div className="border-t border-gray-100">
          {/* Ficheiros da sessão */}
          {s.ficheiros?.length > 0 && (
            <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100/50">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">📎 Ficheiros da sessão</p>
              <div className="flex flex-wrap gap-2">
                {s.ficheiros.map(f => (
                  <a key={f.id} href={f.url_publica ?? '#'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-white border border-amber-200 px-2.5 py-1.5 rounded-lg hover:border-amber-400 transition-colors">
                    <span>{getFileIcon(f.tipo)}</span>
                    <span className="font-medium">{f.nome}</span>
                    <span className="text-gray-400">{formatBytes(f.tamanho_bytes)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Passos */}
          {passosAluno.map(passo => {
            const isDone = localProg.some(p => p.passo_id === passo.id)
            const isExpanded = expandedPasso === passo.id
            const conteudo = getConteudo(passo)

            return (
              <div key={passo.id} className="flex gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0">
                <button onClick={() => checkPasso(passo)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                    isDone ? 'bg-teal border-teal text-white text-xs font-bold' : 'border-gray-300 hover:border-teal'
                  }`}>
                  {isDone && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-ink">{passo.titulo}</p>
                    <span className={`badge border text-xs ${stepTypeColor(passo.tipo)}`}>
                      {stepTypeLabel(passo.tipo)}
                    </span>
                  </div>
                  {conteudo && (
                    <>
                      <button onClick={() => setExpandedPasso(isExpanded ? null : passo.id)}
                        className="text-xs text-accent hover:underline mt-1 block">
                        {isExpanded ? 'Ocultar instruções ↑' : 'Ver instruções ↓'}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                          {conteudo}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
