"use client"
import React, { useState, useEffect } from 'react';
import { Button, Input, DateRangePicker, Avatar } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { ArrowLeft, ArrowRight, CheckCircle2, Receipt, Calendar, BedDouble, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import ClientForm from '@/components/ClientForm';
import { RoomPicker } from '@/components/RoomPicker';
import { Section } from '@/components/ui/Section';
import { ResultState } from '@/components/ui/ResultState';
import RoomService from '@/services/RoomService';
import VentasService from '@/services/VentasService';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import { toCalendarDateTime, fromCalendarDateTime } from '@/lib/dateField';
import type { Client, Room } from '@/types/types';
import { toast } from '@/lib/toast';

interface VentaWizardProps {
    token: string;
}

type SelectedCard = { id: string; price: number; priceId: number };
type Fechas = { start: string; end: string } | null;

const STEPS = [
    { key: 'cliente', title: 'Cliente' },
    { key: 'habitacion', title: 'Habitación y fechas' },
    { key: 'detalle', title: 'Detalle' },
    { key: 'realizada', title: 'Venta realizada' },
];

/** Reemplaza `Steps` de antd: HeroUI no tiene un componente de pasos equivalente. */
const WizardSteps = ({
    current,
    description,
    canGoTo,
    onGo,
}: {
    current: number;
    description: string;
    canGoTo: (step: number) => boolean;
    onGo: (step: number) => void;
}) => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {STEPS.map((step, i) => {
            const clickable = i !== 3 && (i < current || canGoTo(i));
            return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <button
                        onClick={() => clickable && onGo(i)}
                        disabled={!clickable}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: clickable ? 'pointer' : 'default',
                            textAlign: 'left',
                        }}
                    >
                        <span
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 600,
                                flexShrink: 0,
                                background: i <= current ? viz.series1 : notion.track,
                                color: i <= current ? '#fff' : notion.inkFaint,
                            }}
                        >
                            {i + 1}
                        </span>
                        <span>
                            <div style={{ fontSize: 13.5, color: i === current ? notion.ink : notion.inkFaint }}>{step.title}</div>
                            {i === 0 && <div style={{ fontSize: 11.5, color: notion.inkFaint }}>{description}</div>}
                        </span>
                    </button>
                    {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: notion.divider }} />}
                </div>
            );
        })}
    </div>
);

/**
 * Alta de venta en cuatro pasos horizontales: cliente, habitación y fechas,
 * detalle (revisión antes de confirmar) y venta realizada. La lista de
 * clientes y la selección de habitaciones viven aquí, en el padre común a
 * todos los pasos: el paso activo se decide con un switch que desmonta los
 * demás, así que si ese estado viviera en cada paso se perdía al navegar
 * entre ellos.
 */
const VentaWizard: React.FC<VentaWizardProps> = ({ token }) => {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [clients, setClients] = useState<Client[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
    const [dates, setDates] = useState<Fechas>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [creating, setCreating] = useState(false);
    const [ventaCreada, setVentaCreada] = useState<any>(null);

    const clientIds = clients.map((c) => c.id);
    const nights = dates ? dayjs(dates.end).startOf('day').diff(dayjs(dates.start).startOf('day'), 'day') : 0;
    const subtotal = selectedCards.reduce((sum, card) => sum + card.price * nights, 0);
    const total = Math.max(0, subtotal - discount);

    const puedeIrAHabitacion = clientIds.length > 0;
    const puedeIrADetalle = puedeIrAHabitacion && !!dates && selectedCards.length > 0;

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (token) setRooms(await RoomService.getAllRooms(token));
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Error al obtener las habitaciones');
            }
        };
        fetchRooms();
    }, [token]);

    const handleCardChange = (room: Room, price: number | null, priceId: number | null) => {
        const cardId = String(room.id);
        if (price === null && priceId === null) {
            setSelectedCards((prev) => prev.filter((card) => card.id !== cardId));
        } else {
            setSelectedCards((prev) => {
                const existingCard = prev.find((card) => card.id === cardId);
                if (existingCard) {
                    return prev.map((card) => (card.id === cardId ? { ...card, price: price!, priceId: priceId! } : card));
                }
                return [...prev, { id: cardId, price: price!, priceId: priceId! }];
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

    const handleTodayClick = () => {
        const now = dayjs();
        const salida = dayjs().hour(15).minute(0);
        setDates({ start: now.format('YYYY-MM-DDTHH:mm'), end: salida.format('YYYY-MM-DDTHH:mm') });
    };

    const handleConfirmar = async () => {
        if (!token || !dates) return;
        const habitaciones = selectedCards.map((card) => Number(card.id));
        const precios = selectedCards.reduce((acc, card) => {
            acc[Number(card.id)] = card.priceId;
            return acc;
        }, {} as Record<number, number>);

        const fecha_inicio = dayjs(dates.start).format('YYYY-MM-DD HH:mm');
        const fecha_fin = dayjs(dates.end).format('YYYY-MM-DD HH:mm');

        setCreating(true);
        try {
            const creada = await VentasService.createVenta(token, {
                habitaciones,
                precios,
                fecha_inicio,
                fecha_fin,
                subtotal,
                total,
                descuento: discount,
                personas: clientIds,
            });
            setVentaCreada(creada);
            toast.success('Venta creada exitosamente 🎉');
            setStep(3);
        } catch (error) {
            console.error('Error creating venta:', error);
            toast.error('Error al guardar la venta');
        } finally {
            setCreating(false);
        }
    };

    const handleNuevaVenta = () => {
        setClients([]);
        setSelectedCards([]);
        setDates(null);
        setDiscount(0);
        setVentaCreada(null);
        setStep(0);
    };

    const roomsPorId = new Map(rooms.map((r) => [String(r.id), r]));

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: notion.ink, margin: 0 }}>Nueva venta</h1>
            <p style={{ color: notion.inkMuted, marginTop: 4, marginBottom: 24, fontSize: 14 }}>
                Registra el cliente, elige la habitación y confirma la venta
            </p>

            <WizardSteps
                current={step}
                description={`${clientIds.length} agregado${clientIds.length === 1 ? '' : 's'}`}
                canGoTo={(i) => (i === 1 ? puedeIrAHabitacion : i === 2 ? puedeIrADetalle : true)}
                onGo={setStep}
            />

            {step === 0 && (
                <>
                    <ClientForm clients={clients} onChange={setClients} token={token} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Button
                            color="primary"
                            isDisabled={!puedeIrAHabitacion}
                            onPress={() => setStep(1)}
                            endContent={<ArrowRight size={14} />}
                        >
                            Continuar
                        </Button>
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <Button variant="light" onPress={() => setStep(0)} startContent={<ArrowLeft size={14} />} className="mb-3 px-0">
                        Volver a cliente
                    </Button>

                    <Section title="Fechas de la estancia">
                        <DateRangePicker
                            aria-label="Fechas de la estancia"
                            granularity="minute"
                            minValue={today(getLocalTimeZone())}
                            value={dates ? { start: toCalendarDateTime(dates.start)!, end: toCalendarDateTime(dates.end)! } : null}
                            onChange={(range) =>
                                setDates(
                                    range?.start && range?.end
                                        ? { start: fromCalendarDateTime(range.start), end: fromCalendarDateTime(range.end) }
                                        : null
                                )
                            }
                        />
                        <Button variant="light" size="sm" onPress={handleTodayClick} className="mt-2">
                            Entrada hoy a las 15:00
                        </Button>
                        {nights > 0 && (
                            <div style={{ marginTop: 8, fontSize: 12.5, color: notion.inkMuted }}>
                                {nights} {nights === 1 ? 'noche' : 'noches'}
                            </div>
                        )}
                    </Section>

                    <Section title="Habitaciones">
                        <RoomPicker
                            rooms={rooms}
                            selected={selectedCards}
                            onToggle={handleCardChange}
                            onPriceChange={handlePriceChange}
                        />
                    </Section>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Button
                            color="primary"
                            isDisabled={!puedeIrADetalle}
                            onPress={() => setStep(2)}
                            endContent={<ArrowRight size={14} />}
                        >
                            Continuar
                        </Button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <Button variant="light" onPress={() => setStep(1)} startContent={<ArrowLeft size={14} />} className="mb-3 px-0">
                        Volver a habitación y fechas
                    </Button>

                    <div
                        className="dash-split"
                        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}
                    >
                        <div>
                            <Section title="Cliente">
                                {clients.map((c, i) => (
                                    <div
                                        key={c.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 0',
                                            borderTop: i === 0 ? 'none' : `1px solid ${notion.divider}`,
                                        }}
                                    >
                                        <Avatar
                                            radius="sm"
                                            style={{ width: 32, height: 32, background: viz.series1, fontSize: 13, flexShrink: 0 }}
                                            name={`${c.nombre?.[0] ?? ''}${c.apellido?.[0] ?? ''}`.toUpperCase() || undefined}
                                            icon={!c.nombre ? <User size={14} /> : undefined}
                                        />
                                        <div>
                                            <div style={{ fontSize: 13.5, fontWeight: 500, color: notion.ink }}>
                                                {c.nombre} {c.apellido}
                                            </div>
                                            <div style={{ fontSize: 12, color: notion.inkFaint }}>{c.numero_documento}</div>
                                        </div>
                                    </div>
                                ))}
                            </Section>

                            <Section title="Fechas y habitaciones">
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${notion.divider}`,
                                        marginBottom: 14,
                                        fontSize: 13,
                                    }}
                                >
                                    <Calendar size={15} color={notion.inkFaint} />
                                    <span style={{ color: notion.ink }}>
                                        {dates ? dayjs(dates.start).format('DD/MM/YYYY HH:mm') : ''} — {dates ? dayjs(dates.end).format('DD/MM/YYYY HH:mm') : ''}
                                    </span>
                                    <span style={{ marginLeft: 'auto', color: notion.inkMuted }}>
                                        {nights} {nights === 1 ? 'noche' : 'noches'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: 10 }}>
                                    {selectedCards.map((card) => {
                                        const room = roomsPorId.get(card.id);
                                        return (
                                            <div
                                                key={card.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '10px 12px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${notion.divider}`,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 8,
                                                        background: `${viz.series1}1f`,
                                                        color: viz.series1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <BedDouble size={15} />
                                                </span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13.5, fontWeight: 500, color: notion.ink }}>
                                                        Habitación {room?.numero ?? card.id}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: notion.inkFaint }}>{room?.tipo}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: notion.ink }}>
                                                        {money(card.price * nights, 2)}
                                                    </div>
                                                    <div style={{ fontSize: 11.5, color: notion.inkFaint }}>{money(card.price, 2)} / noche</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Section>
                        </div>

                        <Section title="Resumen">
                            <div
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${notion.divider}`,
                                    marginBottom: 16,
                                }}
                            >
                                <div style={{ fontSize: 11.5, color: notion.inkFaint, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                    Total a pagar
                                </div>
                                <div style={{ fontSize: 30, fontWeight: 700, color: notion.ink, marginTop: 4, lineHeight: 1.1 }}>
                                    {money(total, 2)}
                                </div>
                                {discount > 0 && (
                                    <div style={{ fontSize: 12, color: notion.inkMuted, marginTop: 4 }}>
                                        {money(subtotal, 2)} subtotal · <span style={{ color: viz.positive }}>-{money(discount, 2)} descuento</span>
                                    </div>
                                )}
                            </div>

                            <label style={{ fontSize: 13, color: notion.inkMuted, display: 'block', marginBottom: 6 }}>Descuento</label>
                            <Input
                                type="number"
                                min={0}
                                value={discount ? String(discount) : ''}
                                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                            />

                            <Button
                                color="primary"
                                fullWidth
                                isLoading={creating}
                                onPress={handleConfirmar}
                                startContent={<CheckCircle2 size={15} />}
                                className="mt-5"
                            >
                                Confirmar venta
                            </Button>
                        </Section>
                    </div>
                </>
            )}

            {step === 3 && (
                <ResultState
                    status="success"
                    icon={<CheckCircle2 size={64} color={notion.ink} style={{ margin: '0 auto' }} />}
                    title="¡Venta realizada!"
                    subTitle={`La venta ${ventaCreada?.id ? `#${ventaCreada.id}` : ''} se registró correctamente por ${money(total, 2)}.`}
                    extra={
                        <>
                            <Button variant="bordered" onPress={handleNuevaVenta}>
                                Registrar otra venta
                            </Button>
                            <Button color="primary" startContent={<Receipt size={14} />} onPress={() => router.push('/ventas')}>
                                Ver ventas
                            </Button>
                        </>
                    }
                />
            )}
        </div>
    );
};

export default VentaWizard;
