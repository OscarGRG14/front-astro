import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AstronautDashboard } from '@/components/dashboard/AstronautDashboard'

/** Vista de control de misión: detalle de un astronauta específico */
export default function AstronautDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/app/crew"><ArrowLeft className="size-4" /> Volver a tripulación</Link>
      </Button>
      <AstronautDashboard astronautId={id} showActions={false} />
    </div>
  )
}
