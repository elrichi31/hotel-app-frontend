import React, { useState, useEffect } from 'react';
import { Form, Button, message, DatePicker, InputNumber } from 'antd';
import SelectRoomCard from '@/components/SelectRoomCard';
import RoomService from '@/services/RoomService';
import dayjs from 'dayjs';
import VentasService from '@/services/VentasService';
import type { DatePickerProps } from 'antd';
import { useRouter } from 'next/navigation';
const { RangePicker } = DatePicker;
const { Item } = Form;

const formatDate = (date: any) => {
    if (!date) return '';
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const day = date.date();
    const month = months[date.month()];
    const year = date.year();
    const hours = date.hour();
    const minutes = date.minute().toString().padStart(2, '0');
    return `${day} de ${month} ${year} ${hours}:${minutes}`;
};

const VentaForm = ({ personIds, initialVenta, idVenta, token }: any) => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [selectedCards, setSelectedCards] = useState<{ id: string, price: number, priceId: number }[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs | null] | null>(null);
    const [discount, setDiscount] = useState<number>(0); // Valor predeterminado de 0 para el descuento
    const [loading, setLoading] = useState<boolean>(false); // Estado para el botón de enviar

    useEffect(() => {
        if (initialVenta) {
            const { fecha_inicio, fecha_fin, descuento, subtotal, total, precios } = initialVenta;
            setDates([dayjs(fecha_inicio), dayjs(fecha_fin)]);
            setDiscount(parseFloat(descuento));
            setSubtotal(parseFloat(subtotal));
            setTotal(parseFloat(total));
            setSelectedCards(precios.map((precio: any) => ({
                id: precio.habitacion_id,
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
        const calculateTotal = () => {
            if (!dates || selectedCards.length === 0) {
                setSubtotal(0);
                setTotal(0);
                return;
            }

            const [startDate, endDate] = dates;
            const nights = endDate ? endDate.startOf('day').diff(startDate.startOf('day'), 'day') : 0;

            const subtotalAmount = selectedCards.reduce((sum, card) => {
                return sum + (card.price * nights);
            }, 0);

            const totalWithDiscount = subtotalAmount - discount;
            setSubtotal(subtotalAmount);
            setTotal(totalWithDiscount > 0 ? totalWithDiscount : 0);
        };

        calculateTotal();
    }, [selectedCards, dates, discount]);

    const handleCardChange = (cardId: string, price: number | null, priceId: number | null) => {
        if (price === null && priceId === null) {
            setSelectedCards((prev) => prev.filter((card) => card.id !== cardId)); // Deseleccionar la tarjeta
        } else {
            setSelectedCards((prev: any) => {
                const existingCard = prev.find((card: any) => card.id === cardId);
                if (existingCard) {
                    return prev.map((card: any) => card.id === cardId ? { ...card, price, priceId } : card);
                } else {
                    return [...prev, { id: cardId, price: price!, priceId: priceId! }];
                }
            });
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates) {
            setDates([dates[0], dates[1]]);
        } else {
            setDates(null);
        }
    };

    const disabledDate = (current: any) => {
        return current && current < dayjs().startOf('day');
    };

    const handleTodayClick = () => {
        const now = dayjs();
        setDates([now, dayjs().hour(15).minute(0)]);
        form.setFieldsValue({
            rangoFechas: [now, dayjs().hour(15).minute(0)]
        });
    };

    const handleSubmit = async (values: any) => {
        if (selectedCards.length === 0) {
            message.warning('Por favor selecciona al menos una habitación.');
            return;
        }
        
        if(personIds.length === 0) {
            message.warning('Por favor ingresa al menos un cliente');
            return;
        }
        const habitaciones = selectedCards.map(card => card.id);
        const precios = selectedCards.reduce((acc, card) => {
            acc[card.id] = card.priceId;
            return acc;
        }, {} as Record<string, number>);

        const fecha_inicio = dates ? dates[0].format('YYYY-MM-DD HH:mm') : null;
        const fecha_fin = dates && dates[1] ? dates[1].format('YYYY-MM-DD HH:mm') : null;

        const newValues = { habitaciones, precios, fecha_inicio, fecha_fin, subtotal, total, descuento: discount, personas: personIds };
        if (token) {
            setLoading(true);
            console.log('newValues:', newValues); 
            try {
                if(initialVenta){
                    await VentasService.updateVenta(token, idVenta , newValues);
                    message.success('Venta actualizada exitosamente 🎉');
                    router.push('/ventas');
                } else {
                    await VentasService.createVenta(token, newValues);
                    message.success('Venta creada exitosamente 🎉');
                    router.push('/ventas');
                }
            } catch (error) {
                console.error('Error creating venta:', error);
                message.error('Error al crear la venta');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Form layout="vertical" onFinish={handleSubmit} style={{ width: "95%", margin: 'auto' }} form={form}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                <h2 className="mt-4 mb-2 text-lg">Datos para el ingreso</h2>
                <Item name="rangoFechas" label="Rango de Fechas" rules={[{ required: true, message: 'Por favor ingrese el rango de fechas' }]} className='w-full'>
                    <RangePicker 
                        showTime={{ format: 'HH:mm' }} 
                        size={"middle"} 
                        className='w-full' 
                        format={formatDate as DatePickerProps['format']} 
                        onChange={handleDateChange} 
                        disabledDate={disabledDate}
                        renderExtraFooter={() => (
                            <Button type="link" onClick={handleTodayClick}>
                                Hoy
                            </Button>
                        )}
                    />
                </Item>

                <h2 className="mt-4 mb-2 text-lg">Seleccionar habitaciones</h2>
                <div className='flex flex-wrap gap-3 mb-8 justify-center'>
                    {rooms.map((room) => (
                        <div key={room.id} className='flex flex-col items-center'>
                            <SelectRoomCard
                                room={room}
                                onSelect={(price: number, priceId: number) => handleCardChange(room.id, price, priceId)}
                                isSelected={selectedCards.some(card => card.id === room.id)}
                                precios={initialVenta?.precios}
                            />
                        </div>
                    ))}
                </div>

                <Item name="discount" label="Descuento" layout='horizontal'>
                    <InputNumber min={0} onChange={(value) => setDiscount(value ?? 0)} />
                </Item>

                <div>
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Total: ${total.toFixed(2)}</p>
                </div>

                <Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Enviar
                    </Button>
                </Item>
            </div>
        </Form>
    );
};

export default VentaForm;
