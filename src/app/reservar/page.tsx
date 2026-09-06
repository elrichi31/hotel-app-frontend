"use client"
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, DatePicker, Select, Modal, message, Empty, Result } from 'antd';
import { User, Mail, Phone, Calendar, Users, Home, Search, ShieldCheck } from 'lucide-react';
import { RoomPicker } from '@/components/RoomPicker';
import RoomService from '@/services/RoomService';
import dayjs, { Dayjs } from 'dayjs';
import ReservaService from '@/services/ReservasService';
import { ReservaData, Room } from '@/types/types';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
const { RangePicker } = DatePicker;
const { Option } = Select;

interface SelectedCard {
  id: string;
  price: number;
  priceId: number;
}

export default function ReservasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false);

  useEffect(() => {
    const calculateTotal = () => {
      if (!startDate || !endDate || selectedCards.length === 0) {
        setSubtotal(0);
        setTotal(0);
        return;
      }

      const nights = endDate.startOf('day').diff(startDate.startOf('day'), 'day');

      const subtotalAmount = selectedCards.reduce((sum, card) => {
        return sum + card.price * nights;
      }, 0);

      const totalWithDiscount = subtotalAmount - discount;
      setSubtotal(subtotalAmount);
      setTotal(totalWithDiscount > 0 ? totalWithDiscount : 0);
    };

    calculateTotal();
  }, [selectedCards, startDate, endDate, discount]);

  const handleCardChange = (room: Room, price: number | null, priceId: number | null) => {
    const cardId = String(room.id);
    if (price === null && priceId === null) {
      setSelectedCards((prev) => prev.filter((card) => card.id !== cardId));
    } else {
      setSelectedCards((prev) => {
        const existingCard = prev.find((card) => card.id === cardId);
        if (existingCard) {
          return prev.map((card) => (card.id === cardId ? { ...card, price: price!, priceId: priceId! } : card));
        } else {
          return [...prev, { id: cardId, price: price!, priceId: priceId! }];
        }
      });
    }
  };

  const handlePriceChange = (roomId: string, price: number, priceId: number) => {
    setSelectedCards((prev) => {
      const existingCard = prev.find((card) => card.id === roomId);
      if (existingCard) {
        return prev.map((card) => (card.id === roomId ? { ...card, price, priceId } : card));
      }
      return [...prev, { id: roomId, price, priceId }];
    });
  };

  const nights = startDate && endDate ? endDate.startOf('day').diff(startDate.startOf('day'), 'day') : 0;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [fecha_inicio, fecha_fin] = values.fechas;
      const habitaciones = selectedCards.map((card) => card.id);
      const precios = selectedCards.reduce((acc, card) => {
        acc[card.id] = card.priceId;
        return acc;
      }, {} as Record<string, number>);

      const reservaData: ReservaData = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        telefono: values.telefono,
        fecha_inicio: fecha_inicio.format('YYYY-MM-DD'),
        fecha_fin: fecha_fin.format('YYYY-MM-DD'),
        habitaciones,
        numero_personas: values.numero_personas,
        precios,
        total,
        estado: "pendiente",
      };

      setSubmitting(true);
      await ReservaService.createReserva(reservaData);

      setReservationSuccess(true);
      form.resetFields();
      setSelectedCards([]);
      setRooms([]);
      setSearched(false);
    } catch (error) {
      console.error('Error creando la reserva:', error);
      message.error('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
    setSearched(false);
    setRooms([]);
    setSelectedCards([]);
  };

  const handleSearchRooms = async () => {
    try {
      if (!startDate || !endDate) {
        message.warning('Por favor ingresa un rango de fechas válido para buscar habitaciones disponibles.');
        return;
      }
      setLoading(true);
      const roomsData = await RoomService.getAvailableRooms(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
      setRooms(roomsData);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      message.error('Error al buscar habitaciones disponibles');
    } finally {
      setLoading(false);
    }
  };

  if (reservationSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: notion.pageBg }}>
        <Result
          status="success"
          title={<span style={{ color: notion.ink }}>¡Reserva realizada con éxito!</span>}
          subTitle={<span style={{ color: notion.inkMuted }}>Tu reserva ha sido realizada correctamente. Te enviaremos un correo con los detalles.</span>}
          extra={[
            <Button key="newReservation" type="primary" onClick={() => setReservationSuccess(false)}>
              Hacer otra reserva
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: notion.pageBg, padding: '48px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${viz.series1}1f`,
              color: viz.series1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            <Home size={20} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: notion.ink, margin: 0 }}>Reserva de habitación</h1>
          <p style={{ fontSize: 14, color: notion.inkMuted, marginTop: 6 }}>
            Completa tus datos, elige las fechas y selecciona una habitación disponible.
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Section title="Tus datos">
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true, message: 'Ingresa tu nombre' }]}
                style={{ flex: 1 }}
              >
                <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Nombre" />
              </Form.Item>
              <Form.Item
                name="apellido"
                label="Apellido"
                rules={[{ required: true, message: 'Ingresa tu apellido' }]}
                style={{ flex: 1 }}
              >
                <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Apellido" />
              </Form.Item>
            </div>
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido' }]}
            >
              <Input prefix={<Mail size={14} color={notion.inkFaint} />} placeholder="tucorreo@ejemplo.com" />
            </Form.Item>
            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[{ required: true, message: 'Ingresa tu número de teléfono' }]}
              style={{ marginBottom: 0 }}
            >
              <Input prefix={<Phone size={14} color={notion.inkFaint} />} placeholder="Ej. 0991234567" />
            </Form.Item>
          </Section>

          <Section title="Fechas y ocupación">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Form.Item
                name="fechas"
                label="Fechas de la estancia"
                rules={[{ required: true, message: 'Selecciona las fechas' }]}
                style={{ flex: 2, minWidth: 260 }}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  onChange={(dates) => handleDateChange(dates as [Dayjs | null, Dayjs | null] | null)}
                />
              </Form.Item>
              <Form.Item
                name="numero_personas"
                label="Personas"
                rules={[{ required: true, message: 'Selecciona el número de personas' }]}
                style={{ flex: 1, minWidth: 140 }}
              >
                <Select placeholder="Personas" suffixIcon={<Users size={14} color={notion.inkFaint} />}>
                  <Option value="1">1 persona</Option>
                  <Option value="2">2 personas</Option>
                  <Option value="3">3 personas</Option>
                  <Option value="4">4 personas</Option>
                </Select>
              </Form.Item>
            </div>
            {nights > 0 && (
              <div style={{ fontSize: 12.5, color: notion.inkMuted, marginTop: -8, marginBottom: 12 }}>
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </div>
            )}
            <Button icon={<Search size={14} />} onClick={handleSearchRooms} loading={loading} style={{ borderRadius: 8 }}>
              Buscar habitaciones disponibles
            </Button>
          </Section>

          {searched && (
            <Section title="Habitaciones disponibles">
              {rooms.length === 0 ? (
                <Empty description="No hay habitaciones disponibles para esas fechas" />
              ) : (
                <RoomPicker
                  rooms={rooms}
                  selected={selectedCards}
                  onToggle={handleCardChange}
                  onPriceChange={handlePriceChange}
                />
              )}
            </Section>
          )}

          <Section title="Resumen">
            <div
              style={{
                display: 'flex',
                gap: 32,
                padding: '4px 0 16px',
                borderBottom: `1px solid ${notion.divider}`,
                marginBottom: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Subtotal</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(subtotal, 2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Total</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(total, 2)}</div>
              </div>
            </div>

            <Button type="primary" htmlType="submit" size="large" block loading={submitting} disabled={selectedCards.length === 0}>
              Reservar
            </Button>
          </Section>
        </Form>

        <Button type="link" onClick={() => setIsModalOpen(true)} style={{ display: 'block', margin: '0 auto' }}>
          Ver política de cancelación
        </Button>
      </div>

      <Modal
        title={<ModalTitle icon={<ShieldCheck size={15} />}>Política de cancelación</ModalTitle>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <p style={{ color: notion.inkMuted }}>Las reservas pueden ser canceladas hasta 24 horas antes de la fecha de llegada sin costo adicional.</p>
      </Modal>
    </div>
  );
}
