'use client'
import React from 'react';
import { Card, message, Popconfirm } from 'antd';
import { EditOutlined, CloseOutlined, DiffOutlined } from '@ant-design/icons';
import Link from 'next/link';

const VentaDetails = ({ venta, onDelete }: any) => {
  const handleDelete = () => {
    onDelete(venta.id);
    message.success('Venta eliminada correctamente');
  };

  const popConfirm = () => {
    handleDelete();
  };

  const eliminar = (
    <Popconfirm title="¿Estás seguro de eliminar esta venta?" okText="Sí" cancelText="No" onConfirm={popConfirm}>
      <CloseOutlined />
    </Popconfirm>
  );

  const editar = (
    <Link href={`/ventas/${venta.id}`}>
      <EditOutlined />
    </Link>
  );

  const factura = (
    <Link href={`/ventas/facturas/${venta.id}`}>
      <DiffOutlined />
    </Link>
  );

  const renderPersonas = () => {
    const { personas } = venta;
    if (personas.length === 1) {
      return <p>{personas[0].nombre} {personas[0].apellido}</p>;
    } else {
      return (
        <p>
          {personas[0].nombre} {personas[0].apellido} {personas.length > 1 ? `+ ${personas.length - 1} persona${personas.length > 2 ? 's' : ''}` : ''}
        </p>
      );
    }
  };

  const renderHabitaciones = () => {
    const { precios } = venta;
    if (precios.length === 1) {
      return <p>Habitación {precios[0].habitacion.numero} ({precios[0].habitacion.tipo})</p>;
    } else {
      return (
        <p>
          Habitación {precios[0].habitacion.numero} ({precios[0].habitacion.tipo}) {precios.length > 1 ? `+ ${precios.length - 1} habitación${precios.length > 2 ? 'es' : ''}` : ''}
        </p>
      );
    }
  };

  return (
    <Card key={venta.id} title={`Venta #${venta.id}`} className="mb-5 shadow-md" actions={[editar, factura, eliminar]}>
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Información de la Venta</h2>
          <p><strong>Fecha Inicio:</strong> {new Date(venta.fecha_inicio).toLocaleString()}</p>
          <p><strong>Fecha Fin:</strong> {new Date(venta.fecha_fin).toLocaleString()}</p>
          <p><strong>Descuento:</strong> ${venta.descuento}</p>
          <p><strong>Subtotal:</strong> ${venta.subtotal}</p>
          <p><strong>Total:</strong> ${venta.total}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Personas</h2>
          {renderPersonas()}
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Habitaciones y Precios</h2>
          {renderHabitaciones()}
        </div>
      </div>
    </Card>
  );
};

export default VentaDetails;
