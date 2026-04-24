import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('perfis').select('*').eq('id', user.id).single()

  if (perfil?.role !== 'formador') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-surf">
      <AdminSidebar perfil={perfil} />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  )
}
