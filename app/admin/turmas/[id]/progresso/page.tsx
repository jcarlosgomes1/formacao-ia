import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProgressoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: turma } = await supabase
    .from('turmas').select('*, cursos(nome,codigo)').eq('id', params.id).single()
  if (!turma) notFound()

  const [{ data: inscricoes }, { data: sessoesTurma }, { data: progresso }] = await Promise.all([
    supabase.from('inscricoes').select('*, perfis(nome,email)').eq('turma_id', params.id),
    supabase.from('sessoes_turma').select('*, sessoes(numero,titulo,passos(id,para_aluno))').eq('turma_id', params.id).order('sessoes(numero)'),
    supabase.from('progresso').select('*').eq('turma_id', params.id),
  ])

  const curso = (turma as any).cursos as any
  const totalPassos = (sessoesTurma ?? []).reduce((a: number, st: any) =>
    a + (st.sessoes?.passos?.filter((p: any) => p.para_aluno).length ?? 0), 0)

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <a href={`/admin/turmas/${params.id}`} className="text-gray-400 hover:text-gray-700 text-sm">← Turma</a>
        <h1 className="font-display font-bold text-base flex-1">Progresso — {turma.nome}</h1>
      </div>
      <main className="p-6">
        {!inscricoes?.length ? (
          <div className="card p-16 text-center">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm text-gray-400">Nenhum aluno inscrito ainda.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[140px]">Aluno</th>
                  {(sessoesTurma ?? []).map((st: any) => (
                    <th key={st.id} className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap" title={st.sessoes?.titulo}>
                      S{st.sessoes?.numero}{!st.ativa ? ' 🔒' : ''}
                    </th>
                  ))}
                  <th className="p-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {(inscricoes ?? []).map((insc: any) => {
                  const userProg = (progresso ?? []).filter((p: any) => p.user_id === insc.user_id)
                  const pct = totalPassos > 0 ? Math.round((userProg.length / totalPassos) * 100) : 0
                  return (
                    <tr key={insc.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="p-3">
                        <p className="font-medium text-xs">{insc.perfis?.nome ?? '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[130px]">{insc.email}</p>
                      </td>
                      {(sessoesTurma ?? []).map((st: any) => {
                        const passosAluno = (st.sessoes?.passos ?? []).filter((p: any) => p.para_aluno)
                        const done = passosAluno.filter((p: any) => userProg.some((pr: any) => pr.passo_id === p.id)).length
                        return (
                          <td key={st.id} className="p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-0.5">
                              {passosAluno.map((p: any) => (
                                <span key={p.id} className={`inline-block w-2.5 h-2.5 rounded-full ${userProg.some((pr: any) => pr.passo_id === p.id) ? 'bg-teal' : 'bg-gray-200'}`} />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{done}/{passosAluno.length}</p>
                          </td>
                        )
                      })}
                      <td className="p-3 text-center">
                        <span className="font-bold text-sm">{pct}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
