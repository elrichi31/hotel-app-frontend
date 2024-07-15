import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, DatePicker } from 'antd';
import SelectedCard from '@/components/SelectedCard';
import RoomService from '@/services/RoomService';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { Client } from '@/types/types';
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

const CardSelectionForm = ({client}: any) => {
  const [form] = Form.useForm();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (session?.user?.token?.token) {
          const roomsData = await RoomService.getAllRooms(session.user.token.token);
          console.log('Rooms:', roomsData);
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
        setTotal(0);
        return;
      }

      const [startDate, endDate] = dates;
      const nights = endDate.startOf('day').diff(startDate.startOf('day'), 'day');

      const totalAmount = selectedCards.reduce((sum, cardId) => {
        const room = rooms.find((room) => room.id === cardId);
        return sum + (room ? room.precio * nights : 0);
      }, 0);

      console.log('Total:', totalAmount);

      setTotal(totalAmount);
    };

    calculateTotal();
  }, [selectedCards, dates, rooms]);

  const handleCardChange = (cardId: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleDateChange = (dates: any) => {
    if (dates) {
      console.log('Selected Dates:', dates);
      setDates([dates[0], dates[1]]);
    } else {
      setDates(null);
    }
  };

  const disabledDate = (current: any) => {
    return current && current < dayjs().startOf('day');
  };

  const handleSubmit = (values: any) => {
    if (selectedCards.length === 0) {
      message.warning('Please select at least one card.');
      return;
    }

    console.log('Selected Cards:', selectedCards);
    console.log('Form Values:', values);
    const newValues = { ...values, selectedCards, total };
    console.log(newValues);
    message.success('Cards and billing information submitted successfully');
  };

  const handleCopyBillingData = () => {
    console.log('Client:', client);
    form.setFieldsValue({
      nombre: client.nombre,
      apellido: client.apellido,
      email: client.email,
      telefono: client.telefono,
      direccion: client.direccion,
      identificacion: client.identificacion,
    });

  }
  return (
    <Form layout="vertical" onFinish={handleSubmit} style={{ width: "95%", margin: 'auto' }} form={form}>

      <div className='flex items-center justify-between'>
        <h2 className="mt-4 mb-2 text-lg">Datos de Facturación</h2>
        <Button type="primary" onClick={handleCopyBillingData}>Copiar datos de facturación</Button>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: '¡Por favor ingresa el nombre!' }]}
            help={errors?.first_name}
            validateStatus={errors?.first_name ? 'error' : undefined}
            style={{ marginBottom: '16px', width: '50%' }}
          >
            <Input placeholder="Juan" />
          </Item>

          <Item
            label="Apellido"
            name="apellido"
            rules={[{ required: true, message: '¡Por favor ingresa el apellido!' }]}
            help={errors?.last_name}
            validateStatus={errors?.last_name ? 'error' : undefined}
            style={{ marginBottom: '16px', width: '48%' }}
          >
            <Input placeholder="Pérez" />
          </Item>
        </div>

        <Item
          label="Correo Electrónico"
          name="email"
          rules={[
            { required: true, message: '¡Por favor ingresa el correo electrónico!' },
            { type: 'email', message: '¡Por favor ingresa un correo válido!' },
          ]}
          help={errors?.email}
          validateStatus={errors?.email ? 'error' : undefined}
          style={{ marginBottom: '16px' }}
        >
          <Input placeholder="correo@example.com" />
        </Item>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Item
            label="Teléfono"
            name="telefono"
            rules={[{ required: true, message: '¡Por favor ingresa el teléfono!' }]}
            help={errors?.phone_number}
            validateStatus={errors?.phone_number ? 'error' : undefined}
            style={{ marginBottom: '16px', width: '50%' }}
          >
            <Input placeholder="1234567890" />
          </Item>
          <Item
            label="Cédula"
            name="identificacion"
            rules={[{ required: true, message: '¡Por favor ingresa la cédula!' }]}
            style={{ marginBottom: '16px', width: '48%' }}
          >
            <Input placeholder="1700000000" />
          </Item>
        </div>

        <Item
          label="Dirección"
          name="direccion"
          rules={[{ required: true, message: '¡Por favor ingresa la dirección!' }]}
          help={errors?.address}
          validateStatus={errors?.address ? 'error' : undefined}
          style={{ marginBottom: '16px' }}
        >
          <Input placeholder="Av. Principal 123" />
        </Item>

        <h2 className="mt-4 mb-2 text-lg">Datos para el ingreso</h2>
        <Item name="rangoFechas" label="Rango de Fechas" rules={[{ required: true, message: 'Por favor ingrese el rango de fechas' }]} className='w-full'>
          <RangePicker size={"middle"} className='w-full' format={formatDate} onChange={handleDateChange} disabledDate={disabledDate} />
        </Item>

        <h2 className="mt-4 mb-2 text-lg">Seleccionar habitaciones</h2>
        <div className='flex flex-wrap gap-3 mb-8 justify-center'>
          {rooms.map((room) => (
            <SelectedCard
              key={room.id}
              room={room}
              onSelect={() => handleCardChange(room.id)}
              isSelected={selectedCards.includes(room.id)}
            />
          ))}
        </div>
        <div>
          <p>Total: ${total}</p>
        </div>

        <Item>
          <Button type="primary" htmlType="submit" block>
            Enviar
          </Button>
        </Item>
      </div>
    </Form>
  );
};

export default CardSelectionForm;
