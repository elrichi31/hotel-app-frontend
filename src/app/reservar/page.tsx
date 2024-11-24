"use client"
import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, DatePicker, Select, Modal, InputNumber, message, Empty, Result } from 'antd';
import SelectRoomCard from '@/components/SelectRoomCard';
import RoomService from '@/services/RoomService';
import dayjs, { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import ReservaService from '@/services/ReservasService';
import { ReservaData } from '@/types/types';
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Room {
  id: string;
  name: string;
  price: number;
}

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
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false); // Nuevo estado


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

  const handleCardChange = (cardId: string, price: number | null, priceId: number | null) => {
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
        fecha_inicio: fecha_inicio.format('YYYY-MM-DD'), // Formato YYYY-MM-DD
        fecha_fin: fecha_fin.format('YYYY-MM-DD'),       // Formato YYYY-MM-DD
        habitaciones,
        numero_personas: values.numero_personas,
        precios,
        total,
        estado: "pendiente",
      };
  
      const res = await ReservaService.createReserva(reservaData);
      console.log('Reserva creada:', res);
      
      setReservationSuccess(true); // Marca la reserva como exitosa
      form.resetFields();
      setSelectedCards([]);
    } catch (error) {
      console.error('Error creando la reserva:', error);
      message.error('Error al crear la reserva');
    }
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleSearchRooms = async () => {
    try {
      if (!startDate || !endDate) {
        message.warning('Por favor ingrese un rango de fechas válido para buscar habitaciones disponibles.');
        return;
      }
      setLoading(true); // Inicia el estado de carga
      console.log('Buscando habitaciones disponibles...');

      const roomsData = await RoomService.getAvailableRooms(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
      console.log('Available rooms:', roomsData);
      setRooms(roomsData);

    } catch (error) {
      console.error('Error fetching available rooms:', error);
      message.error('Error al buscar habitaciones disponibles');
    } finally {
      setLoading(false); // Termina el estado de carga
    }
  };

  if (reservationSuccess) {
    return (
      <Result
        status="success"
        title="¡Reserva realizada con éxito!"
        subTitle="Tu reserva ha sido realizada correctamente. Te enviaremos un correo con los detalles."
        extra={[
          <Button key="newReservation" onClick={() => setReservationSuccess(false)}>
            Hacer otra reserva
          </Button>,
        ]}
      />
    );
  }

  return (
    <div className="w-full max-w-[700px] mx-auto p-6">
      <Card title="Reserva de Habitación" bordered={false}>
        <p>Por favor, completa todos los campos para realizar tu reserva.</p>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input placeholder="Ingresa tu nombre" />
          </Form.Item>
          <Form.Item
            name="apellido"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
          >
            <Input placeholder="Ingresa tu apellido" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[{ required: true, message: 'Por favor ingrese el correo electrónico' }]}
          >
            <Input placeholder="Ingresa tu correo electrónico" />
          </Form.Item>
          <Form.Item
            name="fechas"
            label="Fechas"
            rules={[{ required: true, message: 'Por favor seleccione las fechas' }]}
          >
            <RangePicker style={{ width: '100%' }} onChange={(dates, dateStrings) => handleDateChange(dates, dateStrings)} />
          </Form.Item>
          <Form.Item
            name="numero_personas"
            label="Número de Personas"
            rules={[{ required: true, message: 'Por favor ingrese el número de personas' }]}
          >
            <Select placeholder="Selecciona el número de personas">
              <Option value="1">1 persona</Option>
              <Option value="2">2 personas</Option>
              <Option value="3">3 personas</Option>
              <Option value="4">4 personas</Option>
            </Select>
          </Form.Item>
          <Button type="default" onClick={handleSearchRooms} className="mb-4" loading={loading}>
            Buscar Habitaciones Disponibles
          </Button>

          <h2 className="mt-4 mb-2 text-lg">Seleccionar habitaciones</h2>
          {rooms.length === 0 ? (
            <Empty description="No hay habitaciones disponibles" />
          ) : (
            <div className='flex flex-wrap gap-3 mb-8 justify-center'>
              {rooms.map((room) => (
                <div key={room.id} className='flex items-center'>
                  <SelectRoomCard
                    room={room}
                    onSelect={(price: number | null, priceId: number | null) => handleCardChange(room.id, price, priceId)}
                    isSelected={selectedCards.some((card) => card.id === room.id)}
                    noTags
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Total: ${total.toFixed(2)}</p>
          </div>
          <Button type="primary" htmlType="submit" className="w-full">
            Reservar
          </Button>
        </Form>
      </Card>
      <Button type="link" onClick={() => setIsModalOpen(true)} className="mt-4 block mx-auto">
        Ver Política de Cancelación
      </Button>
      <Modal
        title="Política de Cancelación"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <p>Las reservas pueden ser canceladas hasta 24 horas antes de la fecha de llegada sin costo adicional.</p>
      </Modal>
    </div>
  );
}
