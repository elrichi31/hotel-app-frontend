import React, { useState } from 'react';
import { Button, Avatar, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import {
  X,
  Pencil,
  Printer,
  FileDown,
  FileText,
  IdCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Wallet,
  CreditCard,
  Landmark,
  User,
  Percent,
} from 'lucide-react';
import FacturaModal from './FacturaModal';
import FacturasService from '@/services/FacturasService';
import { notion, viz } from '@/lib/theme';
import { money, shortDate } from '@/lib/format';
import { facturaEstadoColor, facturaEstadoLabel, EstadoFactura } from '@/lib/estados';
import { toast } from '@/lib/toast';

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
  direccion: string;
  telefono?: string;
  correo: string;
  fecha_emision: string;
  subtotal: number;
  descuento: number;
  porcentaje_iva?: number;
  impuesto: number;
  total: number;
  forma_pago: string;
  observaciones?: string;
  estado: EstadoFactura;
  venta_id: number;
  productos?: ProductoFactura[];
}

interface CardFacturaProps {
  factura: Factura;
  onUpdate: (updatedFactura: Factura) => void;
  token: string;
}

const PAGO_ICON: Record<string, React.ReactNode> = {
  efectivo: <Wallet size={13} />,
  tarjeta: <CreditCard size={13} />,
  transferencia: <Landmark size={13} />,
};

/** Chip de estado con fondo tintado: más presencia que un punto suelto. */
const EstadoPill = ({ estado }: { estado: EstadoFactura }) => {
  const color = facturaEstadoColor[estado];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        background: `${color}1f`,
        color,
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
      {facturaEstadoLabel[estado]}
    </span>
  );
};

/** Título de sección con un ícono muted delante, mismo tratamiento en las tres. */
const SectionLabel = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: notion.inkMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
    <span style={{ fontSize: 13, display: 'inline-flex' }}>{icon}</span>
    {children}
  </div>
);

/** Fila etiqueta/valor con un ícono muted a la izquierda del texto. */
const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '7px 0' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: notion.inkFaint, fontSize: 13 }}>
      <span style={{ fontSize: 13, display: 'inline-flex' }}>{icon}</span>
      {label}
    </span>
    <span style={{ color: notion.ink, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);

const CardFactura: React.FC<CardFacturaProps> = ({ factura, onUpdate, token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const color = facturaEstadoColor[factura.estado];
  const initials = `${factura.nombre?.[0] ?? ''}${factura.apellido?.[0] ?? ''}`.toUpperCase();

  const handleEmitir = async () => {
    try {
      const updated = await FacturasService.updateFactura(token, factura.id, { ...factura, estado: 'emitido' });
      onUpdate(updated);
      toast.success('Factura emitida');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al emitir la factura');
    }
  };

  const handleAnular = async () => {
    try {
      const updated = await FacturasService.updateFactura(token, factura.id, { ...factura, estado: 'anulado' });
      onUpdate(updated);
      toast.success('Factura anulada');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al anular la factura');
    }
  };

  const handleOk = async (values: any) => {
    try {
      const updated = await FacturasService.updateFactura(token, factura.id, values);
      toast.success('Factura actualizada');
      setIsModalOpen(false);
      onUpdate(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la factura');
    }
  };

  return (
    <div
      style={{
        width: 340,
        background: notion.cardBg,
        border: `1px solid ${notion.divider}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Acento de 4px arriba: el color del estado se ve antes de leer nada */}
      <div style={{ height: 4, background: color }} />

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${color}1f`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              <FileText size={16} />
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: notion.ink }}>
              Factura {factura.numero_factura ?? `#${factura.id}`}
            </span>
          </div>
          <EstadoPill estado={factura.estado} />
        </div>

        {/* El total como cifra hero, en su propio bloque tintado */}
        <div
          style={{
            marginTop: 16,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${notion.divider}`,
          }}
        >
          <div style={{ fontSize: 11.5, color: notion.inkFaint, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Total a pagar
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: notion.ink, marginTop: 4, lineHeight: 1.1 }}>
            {money(factura.total, 2)}
          </div>
          <div style={{ fontSize: 12, color: notion.inkMuted, marginTop: 4 }}>
            {money(factura.subtotal, 2)} subtotal
            {factura.descuento > 0 && (
              <> · <span style={{ color: viz.positive }}>-{money(factura.descuento, 2)} descuento</span></>
            )}
            {factura.impuesto > 0 && <> · +{money(factura.impuesto, 2)} IVA</>}
          </div>
        </div>

        <div style={{ marginTop: 18, marginBottom: 8 }}>
          <SectionLabel icon={<User size={13} />}>Cliente</SectionLabel>
        </div>

        {/* Perfil del cliente: mismo patrón de avatar que la tabla de Usuarios */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Avatar radius="sm" style={{ width: 30, height: 30, background: viz.series1, fontSize: 12, flexShrink: 0 }} name={initials || '?'} />
          <span style={{ fontSize: 14, fontWeight: 500, color: notion.ink }}>
            {factura.nombre} {factura.apellido}
          </span>
        </div>

        <div style={{ borderTop: `1px solid ${notion.divider}` }}>
          <Row icon={<IdCard size={13} />} label="Identificación" value={factura.identificacion} />
          <Row icon={<MapPin size={13} />} label="Dirección" value={factura.direccion} />
          <Row icon={<Phone size={13} />} label="Teléfono" value={factura.telefono || '—'} />
          <Row icon={<Mail size={13} />} label="Correo" value={factura.correo} />
        </div>

        <div style={{ marginTop: 14, marginBottom: 8 }}>
          <SectionLabel icon={<Calendar size={13} />}>Detalles</SectionLabel>
        </div>
        <div style={{ borderTop: `1px solid ${notion.divider}` }}>
          <Row icon={<Calendar size={13} />} label="Fecha de emisión" value={shortDate(factura.fecha_emision)} />
          <Row
            icon={PAGO_ICON[factura.forma_pago] ?? <CreditCard size={13} />}
            label="Forma de pago"
            value={factura.forma_pago}
          />
        </div>

        {factura.productos && factura.productos.length > 0 && (
          <>
            <div style={{ marginTop: 14, marginBottom: 8 }}>
              <SectionLabel icon={<FileText size={13} />}>Productos</SectionLabel>
            </div>
            <div style={{ borderTop: `1px solid ${notion.divider}` }}>
              {factura.productos.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
                  <span style={{ color: notion.ink }}>
                    {p.cantidad}× {p.descripcion}
                  </span>
                  <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                    {money(p.cantidad * p.precio_unitario, 2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {(factura.impuesto > 0 || (factura.porcentaje_iva ?? 0) > 0) && (
          <div style={{ marginTop: 14 }}>
            <Row icon={<Percent size={13} />} label={`IVA (${factura.porcentaje_iva}%)`} value={money(factura.impuesto, 2)} />
          </div>
        )}

        {factura.observaciones && (
          <>
            <div style={{ marginTop: 14, marginBottom: 6 }}>
              <SectionLabel icon={<FileText size={13} />}>Observaciones</SectionLabel>
            </div>
            <div style={{ fontSize: 13, color: notion.inkMuted, lineHeight: 1.5 }}>{factura.observaciones}</div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {factura.estado !== 'anulado' && factura.estado === 'guardado' && (
            <>
              <Button startContent={<Pencil size={14} />} onPress={() => setIsModalOpen(true)} className="flex-1">
                Editar
              </Button>
              <Button
                startContent={<Printer size={14} />}
                onPress={handleEmitir}
                className="flex-1"
                style={{ background: viz.positive, color: '#fff' }}
              >
                Emitir
              </Button>
            </>
          )}
          {factura.estado !== 'anulado' && factura.estado === 'emitido' && (
            <Popover placement="top">
              <PopoverTrigger>
                <Button color="danger" variant="flat" startContent={<X size={14} />} className="flex-1">
                  Anular
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-2">
                  <div className="text-sm font-medium mb-2">¿Anular esta factura?</div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" color="danger" onPress={handleAnular}>
                      Sí
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button
            startContent={<FileDown size={14} />}
            className="flex-1"
            onPress={() => window.open(`/ventas/facturas/imprimir/${factura.id}`, '_blank')}
          >
            Imprimir
          </Button>
        </div>
      </div>

      <FacturaModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleOk} factura={factura} edit={true} />
    </div>
  );
};

export default CardFactura;
