"use client"
import React, { useState, useEffect } from 'react';
import { Steps, Button, DatePicker, InputNumber, Result, Avatar } from 'antd';
import { ArrowLeft, ArrowRight, CheckCircle2, Receipt, Calendar, BedDouble, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import ClientForm from '@/components/ClientForm';
import { RoomPicker } from '@/components/RoomPicker';
import { Section } from '@/components/ui/Section';
import RoomService from '@/services/RoomService';
import VentasService from '@/services/VentasService';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import type { Client, Room } from '@/types/types';
import { toast } from '@/lib/toast';

const { RangePicker } = DatePicker;

interface VentaWizardProps {
    token: string;
}

type SelectedCard = { id: string; price: number; priceId: number };
type Fechas = [dayjs.Dayjs, dayjs.Dayjs | null] | null;

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
    const nights = dates && dates[1] ? dates[1].startOf('day').diff(dates[0].startOf('day'), 'day') : 0;
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

    const disabledDate = (current: any) => current && current < dayjs().startOf('day');

    const handleTodayClick = () => {
        const now = dayjs();
        const salida = dayjs().hour(15).minute(0);
        setDates([now, salida]);
    };

    const handleConfirmar = async () => {
        if (!token) return;
        const habitaciones = selectedCards.map((card) => Number(card.id));
        const precios = selectedCards.reduce((acc, card) => {
            acc[Number(card.id)] = card.priceId;
            return acc;
        }, {} as Record<number, number>);

        const fecha_inicio = dates ? dates[0].format('YYYY-MM-DD HH:mm') : null;
        const fecha_fin = dates && dates[1] ? dates[1].format('YYYY-MM-DD HH:mm') : null;

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

            <Steps
                current={step}
                labelPlacement="vertical"
                onChange={(next) => {
                    if (next === 1 && !puedeIrAHabitacion) return;
                    if (next === 2 && !puedeIrADetalle) return;
                    if (next === 3) return;
                    setStep(next);
                }}
                items={[
                    { title: 'Cliente', description: `${clientIds.length} agregado${clientIds.length === 1 ? '' : 's'}` },
                    { title: 'Habitación y fechas', disabled: !puedeIrAHabitacion },
                    { title: 'Detalle', disabled: !puedeIrADetalle },
                    { title: 'Venta realizada', disabled: true },
                ]}
                style={{ marginBottom: 24 }}
            />

            {step === 0 && (
                <>
                    <ClientForm clients={clients} onChange={setClients} token={token} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Button
                            type="primary"
                            disabled={!puedeIrAHabitacion}
                            onClick={() => setStep(1)}
                            icon={<ArrowRight size={14} />}
                            iconPosition="end"
                        >
                            Continuar
                        </Button>
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <Button type="link" onClick={() => setStep(0)} icon={<ArrowLeft size={14} />} style={{ padding: 0, marginBottom: 12 }}>
                        Volver a cliente
                    </Button>

                    <Section title="Fechas de la estancia">
                        <RangePicker
                            showTime={{
                                format: 'HH:mm',
                                defaultValue: [dayjs().hour(14).minute(0).second(0), dayjs().hour(11).minute(0).second(0)],
                            }}
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            value={dates as any}
                            onChange={(d) => setDates(d ? [d[0] as any, d[1] as any] : null)}
                            disabledDate={disabledDate}
                            renderExtraFooter={() => (
                                <Button type="link" onClick={handleTodayClick} style={{ padding: 0 }}>
                                    Entrada hoy a las 15:00
                                </Button>
                            )}
                        />
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
                            type="primary"
                            disabled={!puedeIrADetalle}
                            onClick={() => setStep(2)}
                            icon={<ArrowRight size={14} />}
                            iconPosition="end"
                        >
                            Continuar
                        </Button>
                    </div>
                </>
            )}

            {step === 2 && (
                <>
                    <Button type="link" onClick={() => setStep(1)} icon={<ArrowLeft size={14} />} style={{ padding: 0, marginBottom: 12 }}>
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
                                        <Avatar shape="square" size={32} style={{ background: viz.series1, fontSize: 13, flexShrink: 0 }}>
                                            {`${c.nombre?.[0] ?? ''}${c.apellido?.[0] ?? ''}`.toUpperCase() || <User size={14} />}
                                        </Avatar>
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
                                        {dates?.[0]?.format('DD/MM/YYYY HH:mm')} — {dates?.[1]?.format('DD/MM/YYYY HH:mm')}
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
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                value={discount}
                                onChange={(value) => setDiscount(value ?? 0)}
                            />

                            <Button
                                type="primary"
                                block
                                loading={creating}
                                onClick={handleConfirmar}
                                icon={<CheckCircle2 size={15} />}
                                style={{ marginTop: 20 }}
                            >
                                Confirmar venta
                            </Button>
                        </Section>
                    </div>
                </>
            )}

            {step === 3 && (
                <Result
                    icon={<CheckCircle2 size={64} color={notion.ink} style={{ margin: '0 auto' }} />}
                    title={<span style={{ color: notion.ink }}>¡Venta realizada!</span>}
                    subTitle={
                        <span style={{ color: notion.inkMuted }}>
                            La venta {ventaCreada?.id ? `#${ventaCreada.id}` : ''} se registró correctamente por {money(total, 2)}.
                        </span>
                    }
                    extra={[
                        <Button key="nueva" onClick={handleNuevaVenta}>
                            Registrar otra venta
                        </Button>,
                        <Button key="ver" type="primary" icon={<Receipt size={14} />} onClick={() => router.push('/ventas')}>
                            Ver ventas
                        </Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default VentaWizard;
