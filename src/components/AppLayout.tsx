import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, BookOpenText, Cpu, LogOut, Rocket, ShieldAlert, TrendingUp, Users, UserCog } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const roleLabel = { astronaut: 'Astronauta', medic: 'Control de Misión', admin: 'Administrador' }

export function AppLayout() {
  const { user, logout } = useAuth()
  const live = useRealtime()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }
  const initials = `${user?.nombre?.[0] || ''}${user?.apellido?.[0] || ''}`.toUpperCase()
  const isAdmin = user?.role === 'admin'
  const isCrew = user?.role !== 'astronaut'

  const links = [
    { to: '/app', label: 'Panel de Salud', icon: Activity, end: true, show: true },
    { to: '/app/metrics', label: 'Métricas', icon: TrendingUp, show: true },
    { to: '/app/records', label: 'Registros', icon: BookOpenText, show: true },
    { to: '/app/alerts', label: 'Alertas', icon: ShieldAlert, show: true },
    { to: '/app/crew', label: 'Tripulación', icon: Users, show: isCrew },
    { to: '/app/users', label: 'Usuarios', icon: UserCog, show: isAdmin },
    { to: '/app/devices', label: 'Dispositivos', icon: Cpu, show: isAdmin },
  ].filter((l) => l.show)

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-sidebar">
        <div className="flex items-center gap-2 px-4 py-5">
          <Rocket className="size-5 text-primary" />
          <span className="font-semibold tracking-tight">AstroHealth</span>
          <span
            title={live ? 'Telemetría en tiempo real conectada' : 'Sin conexión en tiempo real'}
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              live ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'
            )}>
            <span className={cn('size-1.5 rounded-full', live ? 'animate-pulse bg-emerald-400' : 'bg-muted-foreground')} />
            {live ? 'En vivo' : 'Offline'}
          </span>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}>
              <l.icon className="size-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar><AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.nombre} {user?.apellido}</p>
            <p className="truncate text-xs text-muted-foreground">{user ? roleLabel[user.role] : ''}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
