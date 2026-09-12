import React, { useState, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { Button, DateRangePicker, Input } from '@heroui/react';
import { today, getLocalTimeZone } from '@internationalized/date';
import { z } from 'zod';
import { RoomPicker } from '@/components/RoomPicker';
import RoomService from '@/services/RoomService';
import dayjs from 'dayjs';
import VentasService from '@/services/VentasService';
import { useRouter } from 'next/navigation';
import { notion } from '@/lib/theme';
import { money } from '@/lib/format';
import { Section } from '@/components/ui/Section';
import type { Room } from '@/types/types';
import { toast } from '@/lib/toast';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';
import { toCalendarDateTime, fromCalendarDateTime } from '@/lib/dateField';

const ventaSchema = z
    .object({
        rangoFechas: z.object({ start: z.string(), end: z.string() }),
        discount: z.coerce.number().min(0).optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.rangoFechas?.start || !data.rangoFechas?.end) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Por favor ingresa el rango de fechas',
                path: ['rangoFechas'],
            });
        }
    });

type VentaFormValues = z.infer<typeof ventaSchema>;

const emptyValues: VentaFormValues = { rangoFechas: { start: '', end: '' }, discount: 0 };

const VentaForm = ({ personIds, initialVenta, idVenta, token }: any) => {
    const router = useRouter();
    const { control, handleSubmit, reset, setValue } = useZodForm(ventaSchema, { defaultValues: emptyValues });
    const [selectedCards, setSelectedCards] = useState<{ id: string, price: number, priceId: number }[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const rangoFechas = useWatch({ control, name: 'rangoFechas' });
    const discount = useWatch({ control, name: 'discount' });

    useEffect(() => {
        if (initialVenta) {
            const { fecha_inicio, fecha_fin, descuento, precios } = initialVenta;
            reset({
                rangoFechas: {
                    start: dayjs(fecha_inicio).format('YYYY-MM-DDTHH:mm'),
                    end: dayjs(fecha_fin).format('YYYY-MM-DDTHH:mm'),
                },
                discount: parseFloat(descuento),
            });
            setSelectedCards(precios.map((precio: any) => ({
                // Los ids se comparan como texto en todo el formulario (ver handleCardChange);
                // sin este String() la venta precargada nunca se podía deseleccionar.
                id: String(precio.habitacion_id),
                price: parseFloat(precio.precio),
                priceId: precio.id
            })));
        }
    }, [initialVenta]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (token) {
                    const roomsData = await RoomService.getAllRooms(token);
                    setRooms(roomsData);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Error al obtener las habitaciones');
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!rangoFechas?.start || !rangoFechas?.end || selectedCards.length === 0) {
            setSubtotal(0);
            setTotal(0);
            return;
        }
        const startDate = dayjs(rangoFechas.start);
        const endDate = dayjs(rangoFechas.end);
        const nights = endDate.startOf('day').diff(startDate.startOf('day'), 'day');
        const subtotalAmount = selectedCards.reduce((sum, card) => sum + card.price * nights, 0);
        const totalWithDiscount = subtotalAmount - (discount ?? 0);
        setSubtotal(subtotalAmount);
        setTotal(totalWithDiscount > 0 ? totalWithDiscount : 0);
    }, [selectedCards, rangoFechas, discount]);

    /** Selecciona/deselecciona una habitación, o cambia su tarifa si ya está elegida. */
    const handleCardChange = (cardId: number, price: number | null, priceId: number | null) => {
        if (price === null && priceId === null) {
            setSelectedCards((prev) => prev.filter((card) => card.id !== String(cardId)));
        } else {
            setSelectedCards((prev) => {
                const existingCard = prev.find((card) => card.id === String(cardId));
                if (existingCard) {
                    return prev.map((card) => (card.id === String(cardId) ? { ...card, price: price!, priceId: priceId! } : card));
                }
                return [...prev, { id: String(cardId), price: price!, priceId: priceId! }];
            });
        }
    };

    const handleTodayClick = () => {
        const now = dayjs();
        const salida = dayjs().hour(15).minute(0);
        setValue('rangoFechas', { start: now.format('YYYY-MM-DDTHH:mm'), end: salida.format('YYYY-MM-DDTHH:mm') });
    };

    const onSubmit = handleSubmit(async (values) => {
        if (selectedCards.length === 0) {
            toast.warning('Por favor selecciona al menos una habitación.');
            return;
        }
        if (personIds.length === 0) {
            toast.warning('Por favor ingresa al menos un cliente');
            return;
        }

        // Los ids se manejan como texto dentro del formulario (ver handleCardChange);
        // el payload sale numérico, como espera el backend.
        const habitaciones = selectedCards.map((card) => Number(card.id));
        const precios = selectedCards.reduce((acc, card) => {
            acc[Number(card.id)] = card.priceId;
            return acc;
        }, {} as Record<number, number>);

        const fecha_inicio = dayjs(values.rangoFechas.start).format('YYYY-MM-DD HH:mm');
        const fecha_fin = dayjs(values.rangoFechas.end).format('YYYY-MM-DD HH:mm');

        const newValues = { habitaciones, precios, fecha_inicio, fecha_fin, subtotal, total, descuento: discount ?? 0, personas: personIds };
        if (!token) return;

        setLoading(true);
        try {
            if (initialVenta) {
                await VentasService.updateVenta(token, idVenta, newValues);
                toast.success('Venta actualizada exitosamente 🎉');
            } else {
                await VentasService.createVenta(token, newValues);
                toast.success('Venta creada exitosamente 🎉');
            }
            router.push('/ventas');
        } catch (error) {
            console.error('Error creating venta:', error);
            toast.error('Error al guardar la venta');
        } finally {
            setLoading(false);
        }
    });

    const nights =
        rangoFechas?.start && rangoFechas?.end
            ? dayjs(rangoFechas.end).startOf('day').diff(dayjs(rangoFechas.start).startOf('day'), 'day')
            : 0;

    return (
        <form onSubmit={onSubmit}>
            <Section title="Fechas de la estancia">
                <FormField
                    control={control}
                    name="rangoFechas"
                    render={({ value, onChange, isInvalid, errorMessage }) => (
                        <DateRangePicker
                            label="Rango de fechas"
                            granularity="minute"
                            minValue={today(getLocalTimeZone())}
                            value={
                                value?.start && value?.end
                                    ? { start: toCalendarDateTime(value.start)!, end: toCalendarDateTime(value.end)! }
                                    : null
                            }
                            onChange={(range) =>
                                onChange({
                                    start: fromCalendarDateTime(range?.start ?? null),
                                    end: fromCalendarDateTime(range?.end ?? null),
                                })
                            }
                            isInvalid={isInvalid}
                            errorMessage={errorMessage}
                        />
                    )}
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
                    onToggle={(room, price, priceId) => handleCardChange(room.id, price, priceId)}
                    onPriceChange={(roomId, price, priceId) => handleCardChange(Number(roomId), price, priceId)}
                />
            </Section>

            <Section title="Resumen">
                <FormField
                    control={control}
                    name="discount"
                    render={({ value, onChange, onBlur, name }) => (
                        <Input
                            name={name}
                            type="number"
                            min={0}
                            value={value ? String(value) : ''}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            label="Descuento"
                            style={{ maxWidth: 220 }}
                        />
                    )}
                />

                <div
                    style={{
                        display: 'flex',
                        gap: 32,
                        padding: '12px 0',
                        borderTop: `1px solid ${notion.divider}`,
                        marginTop: 4,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Subtotal</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>
                            {money(subtotal, 2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Total</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>
                            {money(total, 2)}
                        </div>
                    </div>
                </div>

                <Button type="submit" color="primary" fullWidth isLoading={loading} className="mt-4">
                    {initialVenta ? 'Guardar cambios' : 'Registrar venta'}
                </Button>
            </Section>
        </form>
    );
};

export default VentaForm;
