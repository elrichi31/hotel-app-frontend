import React, { useState } from 'react';
import { Card, message, Popconfirm, Typography, Button } from 'antd';
import { CloseOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import FacturaModal from './FacturaModal';
import FacturasService from '@/services/FacturasService';
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
  onDelete: (facturaId: number) => void;
}

const CardFactura: React.FC<CardFacturaProps> = ({ factura, onUpdate, onDelete }) => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para manejar la eliminación de la factura
  const handleDelete = async () => {
    try {
      if (session?.user?.token?.token) {
        await FacturasService.deleteFactura(session.user.token.token, factura.id);
        onDelete(factura.id); // Actualiza el estado en el componente padre
        message.success('Factura eliminada exitosamente');
      }
    } catch (error: any) {
      console.error('Error eliminando la factura:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al eliminar la factura');
      }
    }
  };

  // Función para manejar la emisión de la factura
  const handleEmitir = async () => {
    try {
      if (session?.user?.token?.token) {
        const updatedFactura = { ...factura, estado: 'emitido' };
        const response = await FacturasService.updateFactura(session.user.token.token, factura.id, updatedFactura);
        onUpdate(response); // Actualiza el estado en el componente padre
        message.success('Factura emitida exitosamente');
      }
    } catch (error: any) {
      console.error('Error emitiendo la factura:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al emitir la factura');
      }
    }
  };

  // Función para manejar la anulación de la factura
  const handleAnular = async () => {
    try {
      if (session?.user?.token?.token) {
        const updatedFactura = { ...factura, estado: 'anulado' };
        const response = await FacturasService.updateFactura(session.user.token.token, factura.id, updatedFactura);
        onUpdate(response); // Actualiza el estado en el componente padre
        message.success('Factura anulada exitosamente');
      }
    } catch (error: any) {
      console.error('Error al anular la factura:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al anular la factura');
      }
    }
  };

  // Función para manejar la apertura del modal de edición
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Función para manejar la confirmación de edición
  const handleOk = async (values: any) => {
    try {
      if (session?.user?.token?.token) {
        const updatedFactura = await FacturasService.updateFactura(session.user.token.token, factura.id, values);
        message.success('Factura actualizada exitosamente');
        setIsModalOpen(false);
        onUpdate(updatedFactura); // Actualiza el estado en el componente padre
      }
    } catch (error: any) {
      console.error('Error actualizando la factura:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al actualizar la factura');
      }
    }
  };

  // Condicionalmente incluir los botones de eliminar, emitir y anular

  const emitir = factura.estado == 'guardado' && (
    <Button
      type="link"
      icon={<PrinterOutlined />}
      onClick={handleEmitir}
      style={{ color: 'green', padding: 0 }}
    >
      Emitir Factura
    </Button>
  );

  const editar = factura.estado == 'guardado' && (
    <Button
      type='link'
      icon={<EditOutlined />}
      onClick={showModal}
      style={{ color: 'blue' }}>
      Editar
    </Button>
  );

  const anular = factura.estado === 'emitido' && (
    <Popconfirm
      title="¿Estás seguro de anular esta factura?"
      okText="Sí"
      cancelText="No"
      onConfirm={handleAnular}
    >
      <Button
        icon={<CloseOutlined />}
        type="link"
        style={{ color: 'orange' }}
      >
        Anular
      </Button>
    </Popconfirm>
  );

  // Definir el array de acciones condicionalmente
  const actions = [
    editar,
    emitir,
    anular,
  ].filter(Boolean); // Eliminar valores falsy

  return (
    <div>
      <Card
        title={`Factura ID: ${factura.id}`}
        style={{ width: '100%', marginBottom: '16px' }}
        actions={actions}
      >
        <Title level={4}>Detalles de la Factura</Title>
        <Text><strong>Tipo de Documento (Identificación):</strong> {factura.identificacion}</Text>
        <br />
        <Text><strong>Nombre:</strong> {factura.nombre} {factura.apellido}</Text>
        <br />
        <Text><strong>Dirección:</strong> {factura.direccion}</Text>
        <br />
        <Text><strong>Teléfono:</strong> {factura.telefono || 'No proporcionado'}</Text>
        <br />
        <Text><strong>Correo:</strong> {factura.correo}</Text>
        <br />
        <Text><strong>Número de Factura:</strong> {factura.numero_factura}</Text>
        <br />
        <Text><strong>Fecha de Emisión:</strong> {factura.fecha_emision}</Text>
        <br />
        <Text><strong>Subtotal:</strong> ${factura.subtotal}</Text>
        <br />
        <Text><strong>Descuento:</strong> ${factura.descuento}</Text>
        <br />
        <Text><strong>Total:</strong> ${factura.total}</Text>
        <br />
        <Text><strong>Forma de Pago:</strong> {factura.forma_pago}</Text>
        <br />
        <Text><strong>Estado:</strong> {factura.estado}</Text>
        <br />
        <Text><strong>Observaciones:</strong> {factura.observaciones || 'No hay observaciones'}</Text>
        <br />
      </Card>
      <FacturaModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        factura={factura}
        edit={true}
      />
    </div>
  );
};

export default CardFactura;
