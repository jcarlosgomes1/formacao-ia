import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function CursosPage() {
  const supabase = await createClient()
  const { data: cursos } = await supabase
    .from('cursos')
    .select('*, sessoes(count), turmas(count)')
    .order('criado_em', { ascending: false })

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <h1 className="font-display font-bold text-base flex-1">Cursos</h1>
        <Link href="/admin/cursos/novo" className="btn-primary">+ Novo curso</Link>
      </div>
      <main className="p-6">
        <p className="text-sm text-gray-500 mb-6">{cursos?.length ?? 0} curso(s) na plataforma</p>

        {!cursos?.length ? (
          <div className="card p-16 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-display font-bold text-lg mb-1">Nenhum curso criado</p>
            <p className="text-sm text-gray-400 mb-5">Começa por criar o primeiro curso da plataforma.</p>
            <Link href="/admin/cursos/novo" className="btn-primary inline-flex">+ Criar curso</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cursos.map((c: any) => (
              <div key={c.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-1 bg-accent" />
                <div className="p-5">
                  <div className="text-xs font-bold tracking-widest uppercase text-accent mb-1">{c.codigo}</div>
                  <h3 className="font-display font-bold text-base leading-tight mb-1">{c.nome}</h3>
                  {c.descricao && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{c.descricao}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{c.sessoes?.[0]?.count ?? 0} sessões</span>
                      <span>{c.turmas?.[0]?.count ?? 0} turmas</span>
                    </div>
                    <span className={`badge ${c.ativo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.ativo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/admin/cursos/${c.id}`}
                      className="flex-1 text-center py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:border-accent hover:text-accent transition-colors">
                      Gerir
                    </Link>
                    <Link href={`/admin/cursos/${c.id}/editor`}
                      className="flex-1 text-center py-1.5 text-xs font-semibold bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-colors">
                      Editor
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/admin/cursos/novo"
              className="card border-dashed border-2 p-5 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-colors min-h-[160px]">
              <span className="text-2xl text-gray-300">+</span>
              <span className="text-sm text-gray-400">Novo curso</span>
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
