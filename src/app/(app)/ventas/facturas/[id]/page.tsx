"use client";
import React, { useEffect, useState } from 'react';
import FacturasService from '@/services/FacturasService';
import { useSession } from 'next-auth/react';

export default function Page({ params }: any) {
  const { data: session } = useSession();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Define una función para cargar las facturas
    const fetchFacturas = async () => {
      try {
        if (session?.user?.token.token) {
          const data = await FacturasService.getFacturasByVenta(params.id, session.user.token.token);
          setFacturas(data);
        }
      } catch (error: any) {
        setError(error.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    // Llama a la función de carga de facturas
    fetchFacturas();
  }, [params.id, session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Facturas para Venta {params.id}</h1>
      {facturas.length > 0 ? (
        <ul>
          {facturas.map((factura) => (
            <li key={factura.id}>
              <p><strong>Factura ID:</strong> {factura.id}</p>
              <p><strong>Tipo de Documento (Identificación):</strong> {factura.identificacion}</p>
              <p><strong>Nombre:</strong> {factura.nombre}</p>
              <p><strong>Apellido:</strong> {factura.apellido}</p>
              <p><strong>Dirección:</strong> {factura.direccion}</p>
              <p><strong>Teléfono:</strong> {factura.telefono || 'No proporcionado'}</p>
              <p><strong>Correo:</strong> {factura.correo}</p>
              <p><strong>Número de Factura:</strong> {factura.numero_factura}</p>
              <p><strong>Fecha de Emisión:</strong> {new Date(factura.fecha_emision).toLocaleString()}</p>
              <p><strong>Descripción:</strong> {factura.descripcion}</p>
              <p><strong>Cantidad:</strong> {factura.cantidad}</p>
              <p><strong>Precio Unitario:</strong> ${factura.precio_unitario}</p>
              <p><strong>Subtotal:</strong> ${factura.subtotal}</p>
              <p><strong>Descuento:</strong> ${factura.descuento}</p>
              <p><strong>IVA:</strong> ${factura.iva}</p>
              <p><strong>Otros Impuestos:</strong> ${factura.otros_impuestos}</p>
              <p><strong>Total:</strong> ${factura.total}</p>
              <p><strong>Forma de Pago:</strong> {factura.forma_pago}</p>
              <p><strong>Observaciones:</strong> {factura.observaciones || 'No hay observaciones'}</p>
              <p><strong>Venta ID:</strong> {factura.venta_id}</p>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay facturas para esta venta.</p>
      )}
    </div>
  );
}
