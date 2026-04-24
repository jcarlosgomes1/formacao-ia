import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: nCursos },
    { count: nTurmas },
    { count: nAlunos },
    { count: nPassos },
    { data: turmasActivas },
  ] = await Promise.all([
    supabase.from('cursos').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('turmas').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('inscricoes').select('*', { count: 'exact', head: true }),
    supabase.from('progresso').select('*', { count: 'exact', head: true }),
    supabase.from('turmas').select('*, cursos(nome,codigo)').eq('ativa', true).order('criado_em', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Cursos activos', value: nCursos ?? 0, color: 'bg-accent/10 text-accent' },
    { label: 'Turmas activas', value: nTurmas ?? 0, color: 'bg-teal/10 text-teal' },
    { label: 'Alunos inscritos', value: nAlunos ?? 0, color: 'bg-accent2/10 text-accent2' },
    { label: 'Passos concluídos', value: nPassos ?? 0, color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center">
        <h1 className="font-display font-bold text-base">Dashboard</h1>
      </div>
      <main className="p-6 flex-1">
        <div className="mb-6">
          <h2 className="font-display font-extrabold text-2xl mb-1">Visão geral</h2>
          <p className="text-gray-500 text-sm">Resumo da plataforma de formação</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className="font-display font-extrabold text-3xl mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-4">Turmas activas</h3>
            {turmasActivas?.length ? turmasActivas.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  {(t.cursos as any)?.codigo?.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.nome}</p>
                  <p className="text-xs text-gray-400">{(t.cursos as any)?.nome}</p>
                </div>
                <span className="badge bg-green-50 text-green-700">Activa</span>
              </div>
            )) : (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma turma activa.</p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-bold text-sm mb-4">Acesso rápido</h3>
            <div className="space-y-2">
              {[
                { href: '/admin/cursos/novo', label: 'Criar novo curso', icon: '◉', desc: 'Adicionar curso à plataforma' },
                { href: '/admin/turmas/nova', label: 'Criar nova turma', icon: '▦', desc: 'Iniciar uma acção de formação' },
                { href: '/admin/ficheiros', label: 'Gerir ficheiros', icon: '⊡', desc: 'Carregar materiais e exercícios' },
              ].map(a => (
                <a key={a.href} href={a.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surf transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm group-hover:bg-accent group-hover:text-white transition-colors">
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
