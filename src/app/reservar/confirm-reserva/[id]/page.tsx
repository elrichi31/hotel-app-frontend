"use client"
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react'
import { Card, Spin, Typography, Button, Result, message } from 'antd'
import ReservasService from '@/services/ReservasService'
const { Title, Paragraph } = Typography

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
      message.error('No se pudo confirmar la reserva')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Cargando la confirmación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Result
        status="error"
        title="No se pudo confirmar la reserva"
        subTitle="Hubo un problema al confirmar tu reserva. Por favor, intenta nuevamente más tarde o contacta con soporte."
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Volver al Inicio
          </Button>
        }
      />
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <Card>
        <Result
          status="success"
          title="¡Reserva Confirmada!"
          subTitle={`Tu reserva con ID ${id} ha sido confirmada exitosamente.`}
          extra={
            <Button type="primary" onClick={() => router.push('/')}>
              Ir al Inicio
            </Button>
          }
        />
      </Card>
    </div>
  )
}

export default ConfirmReserva
