import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, Copy, Cpu, KeyRound, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteDevice, useDevices, useRegisterDevice, useRotateDeviceKey, useUpdateDevice, useUsers } from '@/hooks/use-health'
import type { Device } from '@/lib/api'

/** Bloque reutilizable para mostrar una API key una sola vez */
function ApiKeyReveal({ apiKey, deviceId }: { apiKey: string; deviceId: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3">
        <code className="flex-1 break-all font-mono text-xs text-primary">{apiKey}</code>
        <Button size="icon" variant="ghost" onClick={copy}>
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Headers del firmware: <code>x-device-id: {deviceId}</code> + <code>x-api-key: &lt;key&gt;</code>
      </p>
    </div>
  )
}

function RegisterDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ deviceId: '', kind: 'wearable', assignedTo: '' })
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const register = useRegisterDevice()
  const { data: astronauts } = useUsers('astronaut')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await register.mutateAsync({
        deviceId: form.deviceId, kind: form.kind,
        assignedTo: form.kind === 'wearable' ? form.assignedTo : undefined,
      })
      setApiKey(res.apiKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const close = (o: boolean) => { setOpen(o); if (!o) { setApiKey(''); setForm({ deviceId: '', kind: 'wearable', assignedTo: '' }) } }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4" /> Registrar dispositivo</Button>
      </DialogTrigger>
      <DialogContent>
        {apiKey ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><KeyRound className="size-5 text-primary" /> API Key generada</DialogTitle>
              <DialogDescription>Guárdala en el firmware del ESP32 — solo se muestra una vez</DialogDescription>
            </DialogHeader>
            <ApiKeyReveal apiKey={apiKey} deviceId={form.deviceId} />
            <Button className="w-full" onClick={() => close(false)}>Entendido</Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Registrar ESP32</DialogTitle>
              <DialogDescription>Genera una API key para el dispositivo</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label>Device ID</Label>
                <Input value={form.deviceId} onChange={(e) => setForm((f) => ({ ...f, deviceId: e.target.value }))} placeholder="esp32-wear-02" required /></div>
              <div className="space-y-1.5"><Label>Tipo</Label>
                <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
                  <option value="wearable">Wearable (vitales de astronauta)</option>
                  <option value="environment">Ambiente (cabina)</option>
                </select></div>
              {form.kind === 'wearable' && (
                <div className="space-y-1.5"><Label>Asignado a</Label>
                  <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm" required>
                    <option value="">Selecciona astronauta…</option>
                    {astronauts?.map((a) => <option key={a._id} value={a._id}>{a.nombre} {a.apellido}</option>)}
                  </select></div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={register.isPending}>
                {register.isPending ? 'Registrando…' : 'Registrar y generar key'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ device, trigger, astronauts }: { device: Device; trigger: ReactNode; astronauts?: { _id: string; nombre: string; apellido: string }[] }) {
  const assignedId = typeof device.assignedTo === 'object' && device.assignedTo ? device.assignedTo._id : (device.assignedTo || '')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: device.name || '',
    kind: device.kind,
    assignedTo: assignedId,
    sensors: (device.sensors || []).join(', '),
    isActive: device.isActive,
  })
  const [error, setError] = useState('')
  const update = useUpdateDevice()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await update.mutateAsync({
        id: device._id,
        name: form.name,
        kind: form.kind,
        assignedTo: form.kind === 'wearable' ? form.assignedTo : null,
        sensors: form.sensors.split(',').map((s) => s.trim()).filter(Boolean),
        isActive: form.isActive,
      })
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {device.deviceId}</DialogTitle>
          <DialogDescription>Nombre, tipo, asignación y estado</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5"><Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Tipo</Label>
            <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as Device['kind'] }))}
              className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
              <option value="wearable">Wearable</option>
              <option value="environment">Ambiente</option>
            </select></div>
          {form.kind === 'wearable' && (
            <div className="space-y-1.5"><Label>Asignado a</Label>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm" required>
                <option value="">Selecciona astronauta…</option>
                {astronauts?.map((a) => <option key={a._id} value={a._id}>{a.nombre} {a.apellido}</option>)}
              </select></div>
          )}
          <div className="space-y-1.5"><Label>Sensores (separados por coma)</Label>
            <Input value={form.sensors} onChange={(e) => setForm((f) => ({ ...f, sensors: e.target.value }))} placeholder="heart_rate, spo2" /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-primary" />
            Dispositivo activo
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RotateDialog({ device, trigger }: { device: Device; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const rotate = useRotateDeviceKey()

  const doRotate = async () => {
    const res = await rotate.mutateAsync(device._id)
    setApiKey(res.apiKey)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setApiKey('') }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Rotar API key — {device.deviceId}</DialogTitle>
          <DialogDescription>La key actual dejará de funcionar inmediatamente</DialogDescription>
        </DialogHeader>
        {apiKey ? (
          <ApiKeyReveal apiKey={apiKey} deviceId={device.deviceId} />
        ) : (
          <Button onClick={doRotate} disabled={rotate.isPending} variant="destructive">
            {rotate.isPending ? 'Rotando…' : 'Confirmar — revocar key actual'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ device, trigger }: { device: Device; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const del = useDeleteDevice()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {device.deviceId}</DialogTitle>
          <DialogDescription>Esta acción es permanente — el ESP32 perderá acceso al instante</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" className="flex-1" disabled={del.isPending}
            onClick={async () => { await del.mutateAsync(device._id); setOpen(false) }}>
            {del.isPending ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices()
  const { data: astronauts } = useUsers('astronaut')
  const toggle = useUpdateDevice()

  const astronautName = (d: Device) => {
    if (typeof d.assignedTo === 'object' && d.assignedTo) return `${d.assignedTo.nombre} ${d.assignedTo.apellido}`
    return astronauts?.find((a) => a._id === d.assignedTo)?.nombre || null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Cpu className="size-6" /> Dispositivos
          </h1>
          <p className="text-sm text-muted-foreground">Hardware ESP32 registrado en la misión</p>
        </div>
        <RegisterDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{devices?.length ?? 0} dispositivo(s)</CardTitle>
          <CardDescription>Wearables de tripulantes y sensores de cabina</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>}
          {devices?.map((d) => (
            <div key={d._id} className="flex items-center gap-3 rounded-lg border p-3">
              <Cpu className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name || d.deviceId}</p>
                <p className="truncate text-xs text-muted-foreground">
                  <code>{d.deviceId}</code>
                  {astronautName(d) && <> · {astronautName(d)}</>}
                  {d.lastSeen && <> · visto {new Date(d.lastSeen).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</>}
                </p>
              </div>
              <Badge variant={d.kind === 'wearable' ? 'default' : 'secondary'}>
                {d.kind === 'wearable' ? 'wearable' : 'ambiente'}
              </Badge>
              <Badge variant={d.isActive ? 'success' : 'outline'}>{d.isActive ? 'activo' : 'inactivo'}</Badge>
              <div className="flex gap-0.5">
                <Button size="icon" variant="ghost" title={d.isActive ? 'Desactivar' : 'Activar'}
                  onClick={() => toggle.mutate({ id: d._id, isActive: !d.isActive })}>
                  <Power className={`size-4 ${d.isActive ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                </Button>
                <EditDialog device={d} astronauts={astronauts}
                  trigger={<Button size="icon" variant="ghost" title="Editar"><Pencil className="size-4" /></Button>} />
                <RotateDialog device={d}
                  trigger={<Button size="icon" variant="ghost" title="Rotar API key"><KeyRound className="size-4" /></Button>} />
                <DeleteDialog device={d}
                  trigger={<Button size="icon" variant="ghost" title="Eliminar"><Trash2 className="size-4 text-destructive" /></Button>} />
              </div>
            </div>
          ))}
          {!isLoading && !devices?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin dispositivos registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
