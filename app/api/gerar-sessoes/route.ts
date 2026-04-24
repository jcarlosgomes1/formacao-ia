import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { nome, descricao, numSessoes, duracaoMin } = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

  const prompt = `Estás a ajudar a estruturar um curso de formação profissional.

Curso: "${nome}"
Descrição: "${descricao || 'Não fornecida'}"
Número de sessões: ${numSessoes}
Duração por sessão: ${duracaoMin} minutos

Gera exactamente ${numSessoes} sessões para este curso. Para cada sessão indica:
- numero (1 a ${numSessoes})
- titulo (conciso, descritivo, em português europeu)
- descricao (1 frase sobre o objectivo da sessão)

Responde APENAS com JSON válido neste formato, sem texto adicional:
{
  "sessoes": [
    { "numero": 1, "titulo": "...", "descricao": "..." },
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
      max_tokens: 2000,
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
