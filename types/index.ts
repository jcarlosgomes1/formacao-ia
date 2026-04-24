export type Role = 'formador' | 'aluno'
export type TipoPasso = 'instrucao' | 'demo' | 'exercicio' | 'nota' | 'aviso'
export type TipoFicheiro = 'excel' | 'pdf' | 'pptx' | 'csv' | 'outro'

export interface Perfil {
  id: string
  nome: string
  email: string
  role: Role
  criado_em: string
}

export interface Curso {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  imagem_url: string | null
  template: boolean
  ativo: boolean
  criado_em: string
  sessoes?: Sessao[]
  turmas?: Turma[]
}

export interface Sessao {
  id: string
  curso_id: string
  numero: number
  titulo: string
  descricao: string | null
  duracao_minutos: number
  criado_em: string
  passos?: Passo[]
  ficheiros?: Ficheiro[]
}

export interface Passo {
  id: string
  sessao_id: string
  titulo: string
  tipo: TipoPasso
  conteudo: object | null  // TipTap JSON
  ordem: number
  para_formador: boolean
  para_aluno: boolean
  ficheiros?: Ficheiro[]
}

export interface Ficheiro {
  id: string
  sessao_id: string
  passo_id: string | null
  nome: string
  descricao: string | null
  storage_path: string
  url_publica: string | null
  tipo: TipoFicheiro
  tamanho_bytes: number
  criado_em: string
}

export interface Turma {
  id: string
  curso_id: string
  codigo: string
  nome: string
  formador_id: string
  data_inicio: string | null
  data_fim: string | null
  ativa: boolean
  criado_em: string
  curso?: Curso
  inscricoes?: Inscricao[]
  sessoes_turma?: SessaoTurma[]
}

export interface SessaoTurma {
  id: string
  turma_id: string
  sessao_id: string
  ativa: boolean
  data_real: string | null
  sessao?: Sessao
}

export interface Inscricao {
  id: string
  turma_id: string
  user_id: string
  nome: string | null
  email: string
  inscrito_em: string
  perfil?: Perfil
}

export interface Convite {
  id: string
  turma_id: string
  email: string | null
  token: string
  usado: boolean
  criado_em: string
  turma?: Turma
}

export interface Progresso {
  id: string
  user_id: string
  turma_id: string
  passo_id: string
  concluido: boolean
  concluido_em: string
}
