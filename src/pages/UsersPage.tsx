import { useState, type FormEvent, type ReactNode } from 'react'
import { Pencil, Power, Trash2, UserPlus, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth'
import { useDeleteUser, useRegisterUser, useUpdateUser, useUsers } from '@/hooks/use-health'
import type { User } from '@/lib/api'

const roleBadge = {
  astronaut: 'secondary' as const,
  medic: 'default' as const,
  admin: 'destructive' as const,
}
const roleLabel = { astronaut: 'Astronauta', medic: 'Médico', admin: 'Admin' }

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input {...props} /></div>
}

function RegisterDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', role: 'astronaut' })
  const [error, setError] = useState('')
  const register = useRegisterUser()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register.mutateAsync(form)
      setOpen(false)
      setForm({ nombre: '', apellido: '', email: '', password: '', role: 'astronaut' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="size-4" /> Nuevo usuario</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar usuario</DialogTitle>
          <DialogDescription>Crear cuenta para la misión (solo admin)</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={form.nombre} onChange={set('nombre')} required />
            <Field label="Apellido" value={form.apellido} onChange={set('apellido')} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Contraseña" type="password" value={form.password} onChange={set('password')} minLength={6} required />
          <div className="space-y-1.5"><Label>Rol</Label>
            <select value={form.role} onChange={set('role')} className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
              <option value="astronaut">Astronauta</option>
              <option value="medic">Médico (control de misión)</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creando…' : 'Crear usuario'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ user, trigger }: { user: User; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nombre: user.nombre, apellido: user.apellido, email: user.email,
    role: user.role, missionId: user.missionId, password: '',
    edad: user.perfil?.edad ?? '', sexo: user.perfil?.sexo ?? '',
    pesoKg: user.perfil?.pesoKg ?? '', alturaCm: user.perfil?.alturaCm ?? '',
    restingHeartRate: user.baseline?.restingHeartRate ?? '', spo2: user.baseline?.spo2 ?? '',
    systolicBP: user.baseline?.systolicBP ?? '', diastolicBP: user.baseline?.diastolicBP ?? '',
    bodyTemperature: user.baseline?.bodyTemperature ?? '',
  })
  const [error, setError] = useState('')
  const update = useUpdateUser()

  const num = (v: string | number) => (v === '' ? null : Number(v))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await update.mutateAsync({
        id: user._id,
        nombre: form.nombre, apellido: form.apellido, email: form.email,
        role: form.role, missionId: form.missionId,
        ...(form.password ? { password: form.password } : {}),
        perfil: { edad: num(form.edad), sexo: form.sexo || null, pesoKg: num(form.pesoKg), alturaCm: num(form.alturaCm) },
        baseline: { restingHeartRate: num(form.restingHeartRate), spo2: num(form.spo2), systolicBP: num(form.systolicBP), diastolicBP: num(form.diastolicBP), bodyTemperature: num(form.bodyTemperature) },
      })
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar {user.nombre} {user.apellido}</DialogTitle>
          <DialogDescription>Datos, rol, perfil fisiológico y línea base pre-vuelo</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={form.nombre} onChange={set('nombre')} required />
            <Field label="Apellido" value={form.apellido} onChange={set('apellido')} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Rol</Label>
              <select value={form.role} onChange={set('role')} className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
                <option value="astronaut">Astronauta</option>
                <option value="medic">Médico</option>
                <option value="admin">Admin</option>
              </select></div>
            <Field label="Misión" value={form.missionId} onChange={set('missionId')} />
          </div>
          <Field label="Nueva contraseña (vacío = sin cambio)" type="password" value={form.password} onChange={set('password')} minLength={6} placeholder="••••••" />

          {form.role === 'astronaut' && (
            <>
              <Separator />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perfil fisiológico</p>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Edad" type="number" value={form.edad} onChange={set('edad')} />
                <div className="space-y-1.5"><Label>Sexo</Label>
                  <select value={form.sexo} onChange={set('sexo')} className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
                    <option value="">—</option><option value="M">M</option><option value="F">F</option><option value="Otro">Otro</option>
                  </select></div>
                <Field label="Peso kg" type="number" step="0.1" value={form.pesoKg} onChange={set('pesoKg')} />
                <Field label="Altura cm" type="number" value={form.alturaCm} onChange={set('alturaCm')} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Línea base pre-vuelo</p>
              <div className="grid grid-cols-5 gap-3">
                <Field label="HR rep." type="number" value={form.restingHeartRate} onChange={set('restingHeartRate')} />
                <Field label="SpO2 %" type="number" value={form.spo2} onChange={set('spo2')} />
                <Field label="P. sist." type="number" value={form.systolicBP} onChange={set('systolicBP')} />
                <Field label="P. diast." type="number" value={form.diastolicBP} onChange={set('diastolicBP')} />
                <Field label="Temp °C" type="number" step="0.1" value={form.bodyTemperature} onChange={set('bodyTemperature')} />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ user, trigger }: { user: User; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const del = useDeleteUser()
  const isSelf = useAuth().user?._id === user._id

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {user.nombre} {user.apellido}</DialogTitle>
          <DialogDescription>
            Soft delete — sus datos de salud se conservan pero pierde acceso
          </DialogDescription>
        </DialogHeader>
        {isSelf ? (
          <p className="text-sm text-muted-foreground">No puedes eliminar tu propia cuenta.</p>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" disabled={del.isPending}
              onClick={async () => { await del.mutateAsync(user._id); setOpen(false) }}>
              {del.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const me = useAuth().user
  const toggle = useUpdateUser()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Users className="size-6" /> Usuarios
          </h1>
          <p className="text-sm text-muted-foreground">Cuentas de la misión</p>
        </div>
        <RegisterDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{users?.length ?? 0} usuario(s)</CardTitle>
          <CardDescription>Tripulación, equipo médico y administración</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>}
          {users?.map((u) => (
            <div key={u._id} className={`flex items-center gap-3 rounded-lg border p-3 ${u.isActive === false ? 'opacity-50' : ''}`}>
              <Avatar><AvatarFallback className="bg-primary/20 text-primary">
                {u.nombre[0]}{u.apellido[0]}
              </AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {u.nombre} {u.apellido}
                  {u._id === me?._id && <span className="ml-1.5 text-xs text-muted-foreground">(tú)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{u.email} · {u.missionId}</p>
              </div>
              <Badge variant={roleBadge[u.role]}>{roleLabel[u.role]}</Badge>
              <Badge variant={u.isActive !== false ? 'success' : 'outline'}>
                {u.isActive !== false ? 'activo' : 'inactivo'}
              </Badge>
              <div className="flex gap-0.5">
                <Button size="icon" variant="ghost" title={u.isActive !== false ? 'Desactivar' : 'Activar'}
                  disabled={u._id === me?._id}
                  onClick={() => toggle.mutate({ id: u._id, isActive: !(u.isActive !== false) })}>
                  <Power className={`size-4 ${u.isActive !== false ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                </Button>
                <EditDialog user={u}
                  trigger={<Button size="icon" variant="ghost" title="Editar"><Pencil className="size-4" /></Button>} />
                <DeleteDialog user={u}
                  trigger={<Button size="icon" variant="ghost" title="Eliminar"><Trash2 className="size-4 text-destructive" /></Button>} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
