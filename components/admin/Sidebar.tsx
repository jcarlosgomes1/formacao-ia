'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Perfil } from '@/types'

const NAV = [
  { href: '/admin/dashboard', icon: '◈', label: 'Dashboard' },
  { href: '/admin/cursos', icon: '◉', label: 'Cursos' },
  { href: '/admin/turmas', icon: '▦', label: 'Turmas' },
  { href: '/admin/ficheiros', icon: '⊡', label: 'Ficheiros' },
]

export default function AdminSidebar({ perfil }: { perfil: Perfil }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = perfil.nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto" style={{ background: '#1A1A2E' }}>
      <div className="px-4 py-5 border-b border-white/7 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-sm">
            Formação em <span className="text-accent2">IA</span>
          </span>
        </div>
        <span className="text-white/25 text-xs tracking-wide pl-10">Área de Gestão</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-white/22 text-xs font-bold tracking-widest uppercase px-3 py-2 mt-1">Principal</p>
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              path.startsWith(item.href)
                ? 'bg-accent/30 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/7'
            )}>
            <span className="text-sm w-4 text-center flex-shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/7">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{perfil.nome}</p>
            <p className="text-accent2 text-xs font-bold uppercase tracking-wider">Formador</p>
          </div>
          <button onClick={logout} className="text-white/25 hover:text-white/70 transition-colors text-sm" title="Sair">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}
