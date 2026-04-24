import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single()
  if (perfil?.role === 'formador') redirect('/admin/dashboard')

  const { data: inscricoes } = await supabase
    .from('inscricoes')
    .select('*, turmas(*, cursos(*))')
    .eq('user_id', user.id)

  const { data: progresso } = await supabase
    .from('progresso')
    .select('id, turma_id')
    .eq('user_id', user.id)

  const initials = (perfil?.nome ?? user.email ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

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
        <div className="flex items-center gap-2">
          <span className="text-white/55 text-xs">{perfil?.nome}</span>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">{initials}</div>
          <form action="/auth/logout" method="post">
            <button className="text-white/28 text-xs hover:text-white transition-colors ml-1">Sair</button>
          </form>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {inscricoes?.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-display font-bold text-lg mb-1">Ainda não estás inscrito em nenhum curso</p>
            <p className="text-sm text-gray-400">Pede o link de convite ao teu formador para te inscreveres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-2xl mb-6">Os meus cursos</h1>
            {inscricoes?.map((insc: any) => {
              const turma = insc.turmas
              const curso = turma?.cursos
              const doneTurma = (progresso ?? []).filter((p: any) => p.turma_id === turma.id).length
              return (
                <Link key={insc.id} href={`/curso/${turma.id}`}
                  className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow block">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-accent text-xs">{curso?.codigo?.slice(-2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-accent uppercase tracking-wider">{curso?.codigo}</p>
                    <p className="font-display font-bold text-base">{curso?.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{turma?.nome} · {formatDate(turma?.data_inicio)} → {formatDate(turma?.data_fim)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{doneTurma} passos concluídos</p>
                    <span className="badge bg-green-50 text-green-700 mt-1">Activo</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
