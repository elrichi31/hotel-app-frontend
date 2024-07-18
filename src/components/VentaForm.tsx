import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, DatePicker, InputNumber } from 'antd';
import SelectableCard from '@/components/SelectedCard';
import RoomService from '@/services/RoomService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import VentasService from '@/services/VentasService';

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
  return `${day} de ${month} ${year}`;
};

const CardSelectionForm = ({ setVenta, sendInfo, personIds }: any) => {
  const [form] = Form.useForm();
  const [selectedCards, setSelectedCards] = useState<{ id: string, price: number, priceId: number }[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [discount, setDiscount] = useState<number>(0); // Valor predeterminado de 0 para el descuento
  const [loading, setLoading] = useState<boolean>(false); // Estado para el botón de enviar
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (session?.user?.token?.token) {
          const roomsData = await RoomService.getAllRooms(session.user.token.token);
          setRooms(roomsData);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        message.error('Error al obtener las habitaciones');
      }
    };
    fetchRooms();
  }, [session]);

  useEffect(() => {
    const calculateTotal = () => {
      if (!dates || selectedCards.length === 0) {
        setSubtotal(0);
        setTotal(0);
        return;
      }

      const [startDate, endDate] = dates;
      const nights = endDate.startOf('day').diff(startDate.startOf('day'), 'day');

      const subtotalAmount = selectedCards.reduce((sum, card) => {
        return sum + (card.price * nights);
      }, 0);

      const totalWithDiscount = subtotalAmount - discount;
      setSubtotal(subtotalAmount);
      setTotal(totalWithDiscount > 0 ? totalWithDiscount : 0);
    };

    calculateTotal();
  }, [selectedCards, dates, discount]);

  const handleCardChange = (cardId: string, price: number, priceId: number) => {
    setSelectedCards((prev) => {
      const existingCard = prev.find((card) => card.id === cardId);
      if (existingCard) {
        return prev.filter((card) => card.id !== cardId); // Deseleccionar la tarjeta si ya está seleccionada
      } else {
        return [...prev, { id: cardId, price, priceId }]; // Seleccionar la tarjeta si no está seleccionada
      }
    });
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

  const handleSubmit = async (values: any) => {
    if (selectedCards.length === 0) {
      message.warning('Please select at least one card.');
      return;
    }

    const habitaciones = selectedCards.map(card => card.id);
    const precios = selectedCards.reduce((acc, card) => {
      acc[card.id] = card.priceId;
      return acc;
    }, {} as Record<string, number>);

    const fecha_inicio = dates ? dates[0].format('YYYY-MM-DD') : null;
    const fecha_fin = dates ? dates[1].format('YYYY-MM-DD') : null;

    const newValues = { habitaciones, precios, fecha_inicio, fecha_fin, subtotal, total, descuento: discount, personas: personIds };
    setVenta(newValues);

    if (session?.user?.token?.token) {
      setLoading(true); // Activar el estado de carga
      try {
        await VentasService.createVenta(session.user.token.token, newValues);
        message.success('Cards and billing information submitted successfully');
      } catch (error) {
        console.error('Error creating venta:', error);
        message.error('Error al crear la venta');
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit} style={{ width: "95%", margin: 'auto' }} form={form}>
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
        <h2 className="mt-4 mb-2 text-lg">Datos para el ingreso</h2>
        <Item name="rangoFechas" label="Rango de Fechas" rules={[{ required: true, message: 'Por favor ingrese el rango de fechas' }]} className='w-full'>
          <RangePicker size={"middle"} className='w-full' format={formatDate} onChange={handleDateChange} disabledDate={disabledDate} />
        </Item>

        <h2 className="mt-4 mb-2 text-lg">Seleccionar habitaciones</h2>
        <div className='flex flex-wrap gap-3 mb-8 justify-center'>
          {rooms.map((room) => (
            <div key={room.id} className='flex flex-col items-center'>
              <SelectableCard
                room={room}
                onSelect={(price: number, priceId: number) => handleCardChange(room.id, price, priceId)}
                isSelected={selectedCards.some(card => card.id === room.id)}
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

export default CardSelectionForm;
