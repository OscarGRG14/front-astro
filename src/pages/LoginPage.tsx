import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de acceso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="starfield flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/15">
            <Rocket className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">AstroHealth</CardTitle>
          <CardDescription>Consola de monitoreo de salud — Misión AURA-01</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="astro@astro.dev" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Conectando…' : 'Acceder'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">← Volver a la misión</Link>
            </p>
          </form>
          <div className="mt-5 rounded-lg border border-dashed border-cyan-400/30 bg-cyan-400/5 p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300">Acceso demo</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">test@astro.net · Teste12345</p>
            <Button
              size="sm" variant="ghost" className="mt-1.5 h-7 text-xs text-cyan-300 hover:text-cyan-200"
              onClick={() => { setEmail('test@astro.net'); setPassword('Teste12345') }}>
              Autocompletar credenciales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
