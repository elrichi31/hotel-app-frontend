"use client"
import React, { useState, useEffect } from 'react';
import { Button, Input, DateRangePicker, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { z } from 'zod';
import { User, Mail, Phone, Users, Home, Search, ShieldCheck } from 'lucide-react';
import { RoomPicker } from '@/components/RoomPicker';
import RoomService from '@/services/RoomService';
import dayjs, { Dayjs } from 'dayjs';
import ReservaService from '@/services/ReservasService';
import { ReservaData, Room } from '@/types/types';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { ResultState } from '@/components/ui/ResultState';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import { toast } from '@/lib/toast';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';
import { toCalendarDate, fromCalendarDate } from '@/lib/dateField';

interface SelectedCard {
  id: string;
  price: number;
  priceId: number;
}

const reservaSchema = z
  .object({
    nombre: z.string().min(1, 'Ingresa tu nombre'),
    apellido: z.string().min(1, 'Ingresa tu apellido'),
    email: z.string().min(1, 'Ingresa un correo válido').email('Ingresa un correo válido'),
    telefono: z.string().min(1, 'Ingresa tu número de teléfono'),
    fechas: z.object({ start: z.string(), end: z.string() }),
    numero_personas: z.string().min(1, 'Selecciona el número de personas'),
  })
  .superRefine((data, ctx) => {
    if (!data.fechas?.start || !data.fechas?.end) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona las fechas', path: ['fechas'] });
    }
  });

type ReservaFormValues = z.infer<typeof reservaSchema>;

const emptyValues: ReservaFormValues = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fechas: { start: '', end: '' },
  numero_personas: '',
};

export default function ReservasPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { control, handleSubmit, reset } = useZodForm(reservaSchema, { defaultValues: emptyValues });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [discount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false);
  const [fechas, setFechas] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const startDate: Dayjs | null = fechas.start ? dayjs(fechas.start) : null;
  const endDate: Dayjs | null = fechas.end ? dayjs(fechas.end) : null;

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
  }, [selectedCards, fechas, discount]);

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

  const onSubmit = handleSubmit(async (values) => {
    try {
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
        fecha_inicio: values.fechas.start,
        fecha_fin: values.fechas.end,
        habitaciones,
        numero_personas: Number(values.numero_personas),
        precios,
        total,
        estado: "pendiente",
      };

      setSubmitting(true);
      await ReservaService.createReserva(reservaData);

      setReservationSuccess(true);
      reset(emptyValues);
      setFechas({ start: '', end: '' });
      setSelectedCards([]);
      setRooms([]);
      setSearched(false);
    } catch (error) {
      console.error('Error creando la reserva:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  });

  const handleDateChange = (next: { start: string; end: string }) => {
    setFechas(next);
    setSearched(false);
    setRooms([]);
    setSelectedCards([]);
  };

  const handleSearchRooms = async () => {
    try {
      if (!startDate || !endDate) {
        toast.warning('Por favor ingresa un rango de fechas válido para buscar habitaciones disponibles.');
        return;
      }
      setLoading(true);
      const roomsData = await RoomService.getAvailableRooms(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
      setRooms(roomsData);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Error al buscar habitaciones disponibles');
    } finally {
      setLoading(false);
    }
  };

  if (reservationSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: notion.pageBg }}>
        <ResultState
          status="success"
          title="¡Reserva realizada con éxito!"
          subTitle="Tu reserva ha sido realizada correctamente. Te enviaremos un correo con los detalles."
          extra={
            <Button color="primary" onPress={() => setReservationSuccess(false)}>
              Hacer otra reserva
            </Button>
          }
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

        <form onSubmit={onSubmit}>
          <Section title="Tus datos">
            <div style={{ display: 'flex', gap: 12 }}>
              <FormField control={control} name="nombre" render={(field) => (
                <Input {...field} label="Nombre" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Nombre" className="flex-1" />
              )} />
              <FormField control={control} name="apellido" render={(field) => (
                <Input {...field} label="Apellido" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Apellido" className="flex-1" />
              )} />
            </div>
            <FormField control={control} name="email" render={(field) => (
              <Input {...field} type="email" label="Correo electrónico" startContent={<Mail size={14} color={notion.inkFaint} />} placeholder="tucorreo@ejemplo.com" className="mt-3" />
            )} />
            <FormField control={control} name="telefono" render={(field) => (
              <Input {...field} label="Teléfono" startContent={<Phone size={14} color={notion.inkFaint} />} placeholder="Ej. 0991234567" className="mt-3" />
            )} />
          </Section>

          <Section title="Fechas y ocupación">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <FormField
                control={control}
                name="fechas"
                render={({ value, onChange, isInvalid, errorMessage }) => (
                  <DateRangePicker
                    label="Fechas de la estancia"
                    minValue={today(getLocalTimeZone())}
                    value={value?.start && value?.end ? { start: toCalendarDate(value.start)!, end: toCalendarDate(value.end)! } : null}
                    onChange={(range) => {
                      const next = { start: fromCalendarDate(range?.start ?? null), end: fromCalendarDate(range?.end ?? null) };
                      onChange(next);
                      handleDateChange(next);
                    }}
                    isInvalid={isInvalid}
                    errorMessage={errorMessage}
                    style={{ flex: 2, minWidth: 260 }}
                  />
                )}
              />
              <FormField
                control={control}
                name="numero_personas"
                render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                  <Select
                    label="Personas"
                    placeholder="Personas"
                    selectedKeys={value ? [value] : []}
                    onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                    onBlur={onBlur}
                    isInvalid={isInvalid}
                    errorMessage={errorMessage}
                    startContent={<Users size={14} color={notion.inkFaint} />}
                    style={{ flex: 1, minWidth: 140 }}
                  >
                    <SelectItem key="1">1 persona</SelectItem>
                    <SelectItem key="2">2 personas</SelectItem>
                    <SelectItem key="3">3 personas</SelectItem>
                    <SelectItem key="4">4 personas</SelectItem>
                  </Select>
                )}
              />
            </div>
            {nights > 0 && (
              <div style={{ fontSize: 12.5, color: notion.inkMuted, marginTop: 8, marginBottom: 4 }}>
                {nights} {nights === 1 ? 'noche' : 'noches'}
              </div>
            )}
            <Button startContent={<Search size={14} />} onPress={handleSearchRooms} isLoading={loading} className="mt-3">
              Buscar habitaciones disponibles
            </Button>
          </Section>

          {searched && (
            <Section title="Habitaciones disponibles">
              {rooms.length === 0 ? (
                <div style={{ textAlign: 'center', color: notion.inkFaint, fontSize: 13, padding: '16px 0' }}>
                  No hay habitaciones disponibles para esas fechas
                </div>
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

            <Button type="submit" color="primary" size="lg" fullWidth isLoading={submitting} isDisabled={selectedCards.length === 0} className="mt-4">
              Reservar
            </Button>
          </Section>
        </form>

        <Button variant="light" onPress={() => setIsModalOpen(true)} className="mx-auto block">
          Ver política de cancelación
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle icon={<ShieldCheck size={15} />}>Política de cancelación</ModalTitle>
          </ModalHeader>
          <ModalBody className="pb-6">
            <p style={{ color: notion.inkMuted }}>Las reservas pueden ser canceladas hasta 24 horas antes de la fecha de llegada sin costo adicional.</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
