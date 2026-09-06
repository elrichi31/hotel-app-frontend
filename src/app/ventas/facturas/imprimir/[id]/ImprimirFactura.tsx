'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Button, Empty } from 'antd';
import { Printer, ArrowLeft } from 'lucide-react';
import FacturasService from '@/services/FacturasService';
import ConfiguracionService, { Configuracion } from '@/services/ConfiguracionService';
import { money, shortDate } from '@/lib/format';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

interface ProductoFactura {
  id: number;
  cantidad: number;
  descripcion: string;
  precio_unitario: number;
}

interface Factura {
  id: number;
  numero_factura: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  fecha_emision: string;
  subtotal: number;
  descuento: number;
  porcentaje_iva: number;
  impuesto: number;
  total: number;
  forma_pago: string;
  observaciones?: string;
  estado: string;
  productos?: ProductoFactura[];
}

const Fila = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
    <span style={{ color: '#666' }}>{label}</span>
    <span>{value}</span>
  </div>
);

export default function ImprimirFactura({ token, id }: { token: string; id: string }) {
  const router = useRouter();
  const [factura, setFactura] = useState<Factura | null>(null);
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No autorizado');
      setLoading(false);
      return;
    }
    FacturasService.getFactura(Number(id), token)
      .then(setFactura)
      .catch(() => setError('No se pudo cargar la factura'))
      .finally(() => setLoading(false));
    ConfiguracionService.getConfiguracion(token).then(setConfig).catch(() => {});
  }, [token, id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div style={{ padding: 40 }}>
        <Empty description={error ?? 'Factura no encontrada'} />
      </div>
    );
  }

  const productos = factura.productos ?? [];

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', padding: '32px 16px', color: '#111' }}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-imprimir { display: none !important; }
          .hoja-factura { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          @page { margin: 16mm; }
        }
      `}</style>

      <div
        className="no-imprimir"
        style={{ maxWidth: 720, margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between' }}
      >
        <Button icon={<ArrowLeft size={14} />} onClick={() => router.back()}>
          Volver
        </Button>
        <Button type="primary" icon={<Printer size={14} />} onClick={() => window.print()}>
          Imprimir / Guardar como PDF
        </Button>
      </div>

      <div
        className="hoja-factura"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          padding: 40,
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #111',
            paddingBottom: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {config?.logo_url && (
              <img
                src={`${backendUrl}${config.logo_url}`}
                alt={config.nombre_hotel}
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }}
              />
            )}
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{config?.nombre_hotel ?? 'HotelApp'}</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                {config?.direccion || 'Factura de alojamiento'}
              </div>
              {(config?.telefono || config?.correo) && (
                <div style={{ fontSize: 11, color: '#888' }}>
                  {[config?.telefono, config?.correo].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{factura.numero_factura ?? `#${factura.id}`}</div>
            <div style={{ fontSize: 12, color: '#555' }}>Emitida: {shortDate(factura.fecha_emision)}</div>
            <div style={{ fontSize: 12, color: '#555', textTransform: 'capitalize' }}>Estado: {factura.estado}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>
              Facturado a
            </div>
            <div style={{ fontWeight: 600 }}>
              {factura.nombre} {factura.apellido}
            </div>
            <div>{factura.identificacion || '—'}</div>
            <div>{factura.direccion || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>Contacto</div>
            <div>{factura.correo || '—'}</div>
            <div>{factura.telefono || '—'}</div>
            <div>Forma de pago: {factura.forma_pago || '—'}</div>
          </div>
        </div>

        {productos.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                <th style={{ padding: '6px 4px' }}>Cant.</th>
                <th style={{ padding: '6px 4px' }}>Descripción</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>P. unit.</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 4px' }}>{p.cantidad}</td>
                  <td style={{ padding: '6px 4px' }}>{p.descripcion}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>{money(p.precio_unitario, 2)}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>{money(p.cantidad * p.precio_unitario, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 260 }}>
            <Fila label="Subtotal" value={money(factura.subtotal, 2)} />
            {factura.descuento > 0 && <Fila label="Descuento" value={`-${money(factura.descuento, 2)}`} />}
            {factura.impuesto > 0 && (
              <Fila label={`IVA (${factura.porcentaje_iva}%)`} value={money(factura.impuesto, 2)} />
            )}
            <div
              style={{
                borderTop: '2px solid #111',
                marginTop: 6,
                paddingTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              <span>Total</span>
              <span>{money(factura.total, 2)}</span>
            </div>
          </div>
        </div>

        {factura.observaciones && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Observaciones</div>
            <div style={{ color: '#555' }}>{factura.observaciones}</div>
          </div>
        )}
      </div>
    </div>
  );
}
