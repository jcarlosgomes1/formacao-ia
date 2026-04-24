import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(date))
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getFileIcon(tipo: string) {
  const icons: Record<string, string> = {
    excel: '📊', pdf: '📄', pptx: '📑', csv: '📋', outro: '📎'
  }
  return icons[tipo] || '📎'
}

export function stepTypeLabel(tipo: string) {
  const labels: Record<string, string> = {
    instrucao: 'Instrução',
    demo: 'Demonstração',
    exercicio: 'Exercício',
    nota: 'Nota',
    aviso: 'Aviso',
  }
  return labels[tipo] || tipo
}

export function stepTypeColor(tipo: string) {
  const colors: Record<string, string> = {
    instrucao: 'bg-blue-50 text-blue-800 border-blue-200',
    demo: 'bg-purple-50 text-purple-800 border-purple-200',
    exercicio: 'bg-green-50 text-green-800 border-green-200',
    nota: 'bg-amber-50 text-amber-800 border-amber-200',
    aviso: 'bg-red-50 text-red-800 border-red-200',
  }
  return colors[tipo] || 'bg-gray-50 text-gray-800 border-gray-200'
}
