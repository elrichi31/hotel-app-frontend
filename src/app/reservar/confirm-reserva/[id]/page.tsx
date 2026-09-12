"use client"
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react'
import { Card, Spinner, Button } from '@heroui/react';
import { ResultState } from '@/components/ui/ResultState';
import ReservasService from '@/services/ReservasService'
import { toast } from '@/lib/toast';

const ConfirmReserva = () => {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (id) {
      confirmReserva()
    }
  }, [id])

  const confirmReserva = async () => {
    try {
      const response = await ReservasService.confirmReserva(id)
    } catch (error) {
      console.error(error)
      setError(true)
      toast.error('No se pudo confirmar la reserva')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spinner size="lg" />
        <p>Cargando la confirmación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ResultState
        status="error"
        title="No se pudo confirmar la reserva"
        subTitle="Hubo un problema al confirmar tu reserva. Por favor, intenta nuevamente más tarde o contacta con soporte."
        extra={
          <Button color="primary" onPress={() => router.push('/')}>
            Volver al Inicio
          </Button>
        }
      />
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <Card className="p-6">
        <ResultState
          status="success"
          title="¡Reserva Confirmada!"
          subTitle={`Tu reserva con ID ${id} ha sido confirmada exitosamente.`}
          extra={
            <Button color="primary" onPress={() => router.push('/')}>
              Ir al Inicio
            </Button>
          }
        />
      </Card>
    </div>
  )
}

export default ConfirmReserva
