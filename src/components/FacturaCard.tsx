// components/CardFactura.tsx
import React from 'react';
import { Card, Typography } from 'antd';
const { Title, Text } = Typography;

interface Factura {
  id: number;
  nombre: string;
  identificacion: string;
  direccion: string;
  telefono?: string;
  correo: string;
  numero_factura: string;
  fecha_emision: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  iva: number;
  otros_impuestos: number;
  total: number;
  forma_pago: string;
  observaciones?: string;
  venta_id: number;
}

const CardFactura: React.FC<{ factura: Factura }> = ({ factura }) => {
  return (
    <Card
      title={`Factura ID: ${factura.id}`}
      style={{ width: '100%', marginBottom: '16px' }}
    >
      <Title level={4}>Detalles de la Factura</Title>
      <Text><strong>Tipo de Documento (Identificación):</strong> {factura.identificacion}</Text>
      <br />
      <Text><strong>Nombre:</strong> {factura.nombre}</Text>
      <br />
      <Text><strong>Dirección:</strong> {factura.direccion}</Text>
      <br />
      <Text><strong>Teléfono:</strong> {factura.telefono || 'No proporcionado'}</Text>
      <br />
      <Text><strong>Correo:</strong> {factura.correo}</Text>
      <br />
      <Text><strong>Número de Factura:</strong> {factura.numero_factura}</Text>
      <br />
      <Text><strong>Fecha de Emisión:</strong>{factura.fecha_emision}</Text>
      <br />
      <Text><strong>Descripción:</strong> {factura.descripcion}</Text>
      <br />
      <Text><strong>Cantidad:</strong> {factura.cantidad}</Text>
      <br />
      <Text><strong>Precio Unitario:</strong> ${factura.precio_unitario}</Text>
      <br />
      <Text><strong>Subtotal:</strong> ${factura.subtotal}</Text>
      <br />
      <Text><strong>Descuento:</strong> ${factura.descuento}</Text>
      <br />
      <Text><strong>IVA:</strong> ${factura.iva}</Text>
      <br />
      <Text><strong>Otros Impuestos:</strong> ${factura.otros_impuestos}</Text>
      <br />
      <Text><strong>Total:</strong> ${factura.total}</Text>
      <br />
      <Text><strong>Forma de Pago:</strong> {factura.forma_pago}</Text>
      <br />
      <Text><strong>Observaciones:</strong> {factura.observaciones || 'No hay observaciones'}</Text>
      <br />
      <Text><strong>Venta ID:</strong> {factura.venta_id}</Text>
    </Card>
  );
};

export default CardFactura;
