import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TurmaClient from '@/components/admin/TurmaClient'

export default async function TurmaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: turma } = await supabase
    .from('turmas')
    .select('*, cursos(nome,codigo)')
    .eq('id', params.id)
    .single()

  if (!turma) notFound()

  const { data: sessoesTurma } = await supabase
    .from('sessoes_turma')
    .select('*, sessoes(*)')
    .eq('turma_id', params.id)
    .order('sessoes(numero)')

  const { data: inscricoes } = await supabase
    .from('inscricoes')
    .select('*, perfis(nome,email)')
    .eq('turma_id', params.id)

  const { data: convites } = await supabase
    .from('convites')
    .select('*')
    .eq('turma_id', params.id)
    .order('criado_em', { ascending: false })

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4">
        <a href="/admin/turmas" className="text-gray-400 hover:text-gray-700 text-sm">← Turmas</a>
        <h1 className="font-display font-bold text-base flex-1">{turma.nome}</h1>
        <a href={`/admin/turmas/${params.id}/progresso`} className="btn-primary">Ver progresso</a>
      </div>
      <TurmaClient
        turma={turma}
        sessoesTurma={sessoesTurma ?? []}
        inscricoes={inscricoes ?? []}
        convites={convites ?? []}
      />
    </>
  )
}
