import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import StudentSessaoCard from '@/components/student/SessaoCard'
import { formatDate, getFileIcon, formatBytes } from '@/lib/utils'

export default async function CursoPage({ params }: { params: { turmaId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: insc } = await supabase
    .from('inscricoes')
    .select('*, turmas(*, cursos(*))')
    .eq('turma_id', params.turmaId)
    .eq('user_id', user.id)
    .single()

  if (!insc) notFound()

  const turma = insc.turmas as any
  const curso = turma?.cursos as any

  const { data: sessoesTurma } = await supabase
    .from('sessoes_turma')
    .select('*, sessoes(*, passos(*), ficheiros(*))')
    .eq('turma_id', params.turmaId)
    .order('sessoes(numero)')

  const { data: progresso } = await supabase
    .from('progresso')
    .select('*')
    .eq('user_id', user.id)
    .eq('turma_id', params.turmaId)

  const todasSessoes = sessoesTurma ?? []
  const totalPassos = todasSessoes.reduce((a: number, st: any) =>
    a + (st.sessoes?.passos?.filter((p: any) => p.para_aluno).length ?? 0), 0)
  const donePassos = (progresso ?? []).length
  const pct = totalPassos > 0 ? Math.round((donePassos / totalPassos) * 100) : 0

  return (
    <div className="min-h-screen bg-surf">
      <nav className="bg-ink2 h-14 flex items-center px-6 gap-4 sticky top-0 z-50">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-display font-bold text-white text-sm">Formação em <span className="text-accent2">IA</span></span>
        <div className="flex-1" />
        <a href="/dashboard" className="text-white/55 text-xs hover:text-white transition-colors">← Os meus cursos</a>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Hero */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: '#1A1A2E' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 70% at 90% 40%, rgba(108,60,225,.35), transparent)' }} />
          <div className="relative">
            <p className="text-xs font-bold tracking-widest uppercase text-accent2 mb-1">{curso?.codigo} · {turma?.nome}</p>
            <h1 className="font-display font-extrabold text-xl text-white mb-1 leading-tight">{curso?.nome}</h1>
            <p className="text-xs text-white/45">Formador: {turma?.formador_nome} · {formatDate(turma?.data_inicio)} → {formatDate(turma?.data_fim)}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>Progresso total</span><span id="prog-pct">{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/12 rounded-full overflow-hidden">
                <div className="h-full bg-accent2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sessões */}
        <div className="space-y-3">
          {todasSessoes.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm text-gray-400">Ainda não há sessões disponíveis. O formador irá activar as sessões à medida que o curso avança.</p>
            </div>
          ) : todasSessoes.map((st: any) => (
            <StudentSessaoCard
              key={st.id}
              sessaoTurma={st}
              progresso={progresso ?? []}
              turmaId={params.turmaId}
              userId={user.id}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
