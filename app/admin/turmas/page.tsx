import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function TurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: turmas } = await supabase
    .from('turmas')
    .select('*, cursos(nome,codigo), inscricoes(count)')
    .eq('formador_id', user!.id)
    .order('criado_em', { ascending: false })

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <h1 className="font-display font-bold text-base flex-1">Turmas</h1>
        <Link href="/admin/turmas/nova" className="btn-primary">+ Nova turma</Link>
      </div>
      <main className="p-6">
        {!turmas?.length ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-3">▦</p>
            <p className="font-display font-bold text-lg mb-1">Nenhuma turma criada</p>
            <p className="text-sm text-gray-400 mb-5">Cria uma turma a partir de um curso existente.</p>
            <Link href="/admin/turmas/nova" className="btn-primary inline-flex">+ Nova turma</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {turmas.map((t: any) => (
              <div key={t.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 bg-teal" />
                <div className="p-5">
                  <div className="text-xs font-bold tracking-widest uppercase text-accent mb-1">
                    {(t.cursos as any)?.codigo}
                  </div>
                  <h3 className="font-display font-bold text-base leading-tight mb-1">{t.nome}</h3>
                  <p className="text-xs text-gray-400 mb-3">{(t.cursos as any)?.nome}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(t.data_inicio)} → {formatDate(t.data_fim)}</span>
                    <span>{t.inscricoes?.[0]?.count ?? 0} alunos</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/turmas/${t.id}`}
                      className="flex-1 text-center py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:border-accent hover:text-accent transition-colors">
                      Gerir
                    </Link>
                    <Link href={`/admin/turmas/${t.id}/progresso`}
                      className="flex-1 text-center py-1.5 text-xs font-semibold bg-teal/10 text-teal rounded-lg hover:bg-teal hover:text-white transition-colors">
                      Progresso
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
