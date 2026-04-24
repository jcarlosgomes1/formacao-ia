import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { sessaoTitulo, sessaoDescricao, cursoNome, ficheiros } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

  const prompt = `Estás a criar um guia de formação profissional detalhado.

Curso: "${cursoNome}"
Sessão: "${sessaoTitulo}"
Descrição: "${sessaoDescricao || 'Não fornecida'}"
Ficheiros disponíveis: ${ficheiros || 'Nenhum'}

Cria os passos detalhados para esta sessão de formação. Cada passo deve ter:
- titulo: título conciso e claro
- tipo: um de ["instrucao", "demo", "exercicio", "nota", "aviso"]
  - "demo": o formador demonstra ao vivo
  - "exercicio": os alunos executam
  - "instrucao": explicação teórica ou contextual
  - "nota": informação complementar útil
  - "aviso": algo crítico a ter em atenção
- conteudo: descrição detalhada passo a passo, em português europeu, com instruções exactas de menus e cliques quando relevante

Responde APENAS com JSON válido, sem texto adicional:
{
  "passos": [
    { "titulo": "...", "tipo": "...", "conteudo": "..." },
    ...
  ]
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 })
  }
}
