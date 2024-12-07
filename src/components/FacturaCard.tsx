import React, { useState } from 'react';
import { Card, message, Popconfirm, Typography, Button, Badge, Divider } from 'antd';
import { CloseOutlined, EditOutlined, PrinterOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, FileTextOutlined, CalendarOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import FacturaModal from './FacturaModal';
import FacturasService from '@/services/FacturasService';
import dayjs from 'dayjs';
import { authOptions } from '@/lib/authOptions';

const { Title, Text } = Typography;

interface Factura {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  direccion: string;
  telefono?: string;
  correo: string;
  numero_factura: string;
  fecha_emision: string;
  subtotal: number;
  descuento: number;
  total: number;
  forma_pago: string;
  observaciones?: string;
  estado: string;
  venta_id: number;
}

interface CardFacturaProps {
  factura: Factura;
  onUpdate: (updatedFactura: Factura) => void;
  token: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'anulado':
      return 'red';
    case 'emitido':
      return 'green';
    case 'guardado':
      return 'blue';
    default:
      return 'gray';
  }
};

const CardFactura: React.FC<CardFacturaProps> = ({ factura, onUpdate, token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmitir = async () => {
    try {
      if (token) {
        const updatedFactura = { ...factura, estado: 'emitido' };
        const response = await FacturasService.updateFactura(token, factura.id, updatedFactura);
        onUpdate(response);
        message.success('Factura emitida exitosamente');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al emitir la factura');
    }
  };

  const handleAnular = async () => {
    try {
      if (token) {
        const updatedFactura = { ...factura, estado: 'anulado' };
        const response = await FacturasService.updateFactura(token, factura.id, updatedFactura);
        onUpdate(response);
        message.success('Factura anulada exitosamente');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al anular la factura');
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async (values: any) => {
    try {
      if (token) {
        const updatedFactura = await FacturasService.updateFactura(token, factura.id, values);
        message.success('Factura actualizada exitosamente');
        setIsModalOpen(false);
        onUpdate(updatedFactura);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al actualizar la factura');
    }
  };

  return (
    <Card className="w-[350px]" style={{ marginBottom: "20px", marginTop: "20px" }}>
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ marginBottom: 0 }}>Factura #{factura.id}</Title>
        <Badge color={getStatusColor(factura.estado)} text={factura.estado.toUpperCase()} />
      </div>

      <Divider />

      <section>
        <Title level={5}>Información del Cliente</Title>
        <div className="flex flex-col gap-1">
          <InfoItem icon={<UserOutlined />} label="Nombre" value={`${factura.nombre} ${factura.apellido}`} />
          <InfoItem icon={<FileTextOutlined />} label="Identificación" value={factura.identificacion} />
          <InfoItem icon={<EnvironmentOutlined />} label="Dirección" value={factura.direccion} />
          <InfoItem icon={<PhoneOutlined />} label="Teléfono" value={factura.telefono || 'No proporcionado'} />
          <InfoItem icon={<MailOutlined />} label="Correo" value={factura.correo} />
        </div>
      </section>

      <Divider />

      <section>
        <Title level={5}>Detalles de la Factura</Title>
        <div className="flex flex-col gap-1">
          <InfoItem icon={<CalendarOutlined />} label="Fecha de Emisión" value={dayjs(factura.fecha_emision).format('DD-MM-YYYY HH:mm')} />
          <InfoItem icon={<CreditCardOutlined />} label="Forma de Pago" value={factura.forma_pago} />
          <InfoItem icon={<DollarOutlined />} label="Subtotal" value={`$${factura.subtotal}`} />
          <InfoItem icon={<DollarOutlined />} label="Descuento" value={`$${factura.descuento}`} />
          <InfoItem icon={<DollarOutlined />} label="Total" value={`$${factura.total}`} />
        </div>
      </section>

      <Divider />

      <section>
        <Title level={5}>Observaciones</Title>
        <Text>{factura.observaciones || 'No hay observaciones'}</Text>
      </section>

      <Divider />

      <div className="flex space-x-3 mt-4">
        {factura.estado === 'guardado' && (
          <>
            <Button type="link" icon={<EditOutlined />} onClick={showModal} style={{ color: 'blue' }}>
              Editar
            </Button>
            <Button type="link" icon={<PrinterOutlined />} onClick={handleEmitir} style={{ color: 'green' }}>
              Emitir Factura
            </Button>
          </>
        )}
        {factura.estado === 'emitido' && (
          <Popconfirm title="¿Estás seguro de anular esta factura?" okText="Sí" cancelText="No" onConfirm={handleAnular}>
            <Button type="link" icon={<CloseOutlined />} style={{ color: 'orange' }}>
              Anular
            </Button>
          </Popconfirm>
        )}
      </div>

      <FacturaModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleOk} factura={factura} edit={true} />
    </Card>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <Text strong>{label}:</Text>
    <Text>{value}</Text>
  </div>
);

export default CardFactura;
