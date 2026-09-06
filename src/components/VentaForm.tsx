import React, { useState, useEffect } from 'react';
import { Form, Button, message, DatePicker, InputNumber } from 'antd';
import { RoomPicker } from '@/components/RoomPicker';
import RoomService from '@/services/RoomService';
import dayjs from 'dayjs';
import VentasService from '@/services/VentasService';
import { useRouter } from 'next/navigation';
import { notion } from '@/lib/theme';
import { money } from '@/lib/format';
import { Section } from '@/components/ui/Section';
import type { Room } from '@/types/types';
const { RangePicker } = DatePicker;
const { Item } = Form;

const VentaForm = ({ personIds, initialVenta, idVenta, token }: any) => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [selectedCards, setSelectedCards] = useState<{ id: string, price: number, priceId: number }[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs | null] | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (initialVenta) {
            const { fecha_inicio, fecha_fin, descuento, precios } = initialVenta;
            setDates([dayjs(fecha_inicio), dayjs(fecha_fin)]);
            setDiscount(parseFloat(descuento));
            setSelectedCards(precios.map((precio: any) => ({
                // Los ids se comparan como texto en todo el formulario (ver handleCardChange);
                // sin este String() la venta precargada nunca se podía deseleccionar.
                id: String(precio.habitacion_id),
                price: parseFloat(precio.precio),
                priceId: precio.id
            })));
            form.setFieldsValue({
                rangoFechas: [dayjs(fecha_inicio), dayjs(fecha_fin)],
                discount: parseFloat(descuento)
            });
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
                message.error('Error al obtener las habitaciones');
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!dates || selectedCards.length === 0) {
            setSubtotal(0);
            setTotal(0);
            return;
        }
        const [startDate, endDate] = dates;
        const nights = endDate ? endDate.startOf('day').diff(startDate.startOf('day'), 'day') : 0;
        const subtotalAmount = selectedCards.reduce((sum, card) => sum + card.price * nights, 0);
        const totalWithDiscount = subtotalAmount - discount;
        setSubtotal(subtotalAmount);
        setTotal(totalWithDiscount > 0 ? totalWithDiscount : 0);
    }, [selectedCards, dates, discount]);

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

    const handleDateChange = (dates: any) => {
        setDates(dates ? [dates[0], dates[1]] : null);
    };

    const disabledDate = (current: any) => current && current < dayjs().startOf('day');

    const handleTodayClick = () => {
        const now = dayjs();
        const salida = dayjs().hour(15).minute(0);
        setDates([now, salida]);
        form.setFieldsValue({ rangoFechas: [now, salida] });
    };

    const handleSubmit = async () => {
        if (selectedCards.length === 0) {
            message.warning('Por favor selecciona al menos una habitación.');
            return;
        }
        if (personIds.length === 0) {
            message.warning('Por favor ingresa al menos un cliente');
            return;
        }

        // Los ids se manejan como texto dentro del formulario (ver handleCardChange);
        // el payload sale numérico, como espera el backend.
        const habitaciones = selectedCards.map((card) => Number(card.id));
        const precios = selectedCards.reduce((acc, card) => {
            acc[Number(card.id)] = card.priceId;
            return acc;
        }, {} as Record<number, number>);

        const fecha_inicio = dates ? dates[0].format('YYYY-MM-DD HH:mm') : null;
        const fecha_fin = dates && dates[1] ? dates[1].format('YYYY-MM-DD HH:mm') : null;

        const newValues = { habitaciones, precios, fecha_inicio, fecha_fin, subtotal, total, descuento: discount, personas: personIds };
        if (!token) return;

        setLoading(true);
        try {
            if (initialVenta) {
                await VentasService.updateVenta(token, idVenta, newValues);
                message.success('Venta actualizada exitosamente 🎉');
            } else {
                await VentasService.createVenta(token, newValues);
                message.success('Venta creada exitosamente 🎉');
            }
            router.push('/ventas');
        } catch (error) {
            console.error('Error creating venta:', error);
            message.error('Error al guardar la venta');
        } finally {
            setLoading(false);
        }
    };

    const nights =
        dates && dates[1] ? dates[1].startOf('day').diff(dates[0].startOf('day'), 'day') : 0;

    return (
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
            <Section title="Fechas de la estancia">
                <Item name="rangoFechas" rules={[{ required: true, message: 'Por favor ingresa el rango de fechas' }]} style={{ marginBottom: 0 }}>
                    <RangePicker
                        showTime={{
                            format: 'HH:mm',
                            // Check-in 2pm / check-out 11am por defecto: el usuario igual puede cambiarlas a mano.
                            defaultValue: [dayjs().hour(14).minute(0).second(0), dayjs().hour(11).minute(0).second(0)],
                        }}
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: '100%' }}
                        onChange={handleDateChange}
                        disabledDate={disabledDate}
                        renderExtraFooter={() => (
                            <Button type="link" onClick={handleTodayClick} style={{ padding: 0 }}>
                                Entrada hoy a las 15:00
                            </Button>
                        )}
                    />
                </Item>
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
                <Item name="discount" label="Descuento" style={{ maxWidth: 220 }}>
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        onChange={(value) => setDiscount(value ?? 0)}
                    />
                </Item>

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

                <Item style={{ marginTop: 16, marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        {initialVenta ? 'Guardar cambios' : 'Registrar venta'}
                    </Button>
                </Item>
            </Section>
        </Form>
    );
};

export default VentaForm;
