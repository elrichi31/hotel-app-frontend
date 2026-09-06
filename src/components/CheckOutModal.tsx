'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Steps, Radio, Button, Input, InputNumber, Empty, message } from 'antd';
import dayjs from 'dayjs';
import { Plus, Trash2 } from 'lucide-react';
import { notion } from '@/lib/theme';
import { money } from '@/lib/format';
import VentasService from '@/services/VentasService';

/** Debe reflejar `PORCENTAJE_IVA` en hotel-app-backend/app/Helpers/Facturacion.ts. Solo para la vista previa: el monto real lo calcula el backend. */
const IVA_PORCENTAJE = 15;

interface PrecioHabitacion {
  precio: number | string;
  habitacion: { numero: string };
}

interface VentaCheckout {
  id: number;
  fecha_checkin: string | null;
  fecha_inicio: string;
  descuento: number | string;
  precios: PrecioHabitacion[];
}

interface ExtraItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

interface Preview {
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
}

interface CheckOutModalProps {
  open: boolean;
  venta: VentaCheckout | null;
  token: string;
  onClose: () => void;
  onSuccess: (result: { venta: any; factura: any }) => void;
}

const nochesReales = (venta: VentaCheckout | null) => {
  if (!venta) return 1;
  const inicio = dayjs(venta.fecha_checkin ?? venta.fecha_inicio);
  const dias = dayjs().diff(inicio, 'day', true);
  return Math.max(1, Math.ceil(dias));
};

/** Réplica en el cliente de `calcularFacturaEstadia` del backend, solo para mostrar una vista previa antes de confirmar. */
function calcularPreview(tarifaPorNoche: number, noches: number, extras: number, descuento: number, incluyeIva: boolean): Preview {
  const montoBruto = Math.round((tarifaPorNoche * noches + extras) * 100) / 100;
  const descuentoAplicado = Math.min(Math.max(descuento, 0), montoBruto);

  if (incluyeIva) {
    const montoConDescuento = montoBruto - descuentoAplicado;
    const base = Math.round((montoConDescuento / (1 + IVA_PORCENTAJE / 100)) * 100) / 100;
    const impuesto = Math.round((montoConDescuento - base) * 100) / 100;
    return {
      subtotal: Math.round((base + descuentoAplicado) * 100) / 100,
      descuento: descuentoAplicado,
      impuesto,
      total: montoConDescuento,
    };
  }

  const base = Math.max(Math.round((montoBruto - descuentoAplicado) * 100) / 100, 0);
  const impuesto = Math.round(base * (IVA_PORCENTAJE / 100) * 100) / 100;
  const total = Math.round((base + impuesto) * 100) / 100;
  return { subtotal: montoBruto, descuento: descuentoAplicado, impuesto, total };
}

const Fila = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: notion.inkMuted }}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const ResumenTotales = ({ preview }: { preview: Preview }) => (
  <div
    style={{
      padding: '12px 16px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${notion.divider}`,
      fontSize: 13,
    }}
  >
    <Fila label="Subtotal" value={money(preview.subtotal, 2)} />
    {preview.descuento > 0 && <Fila label="Descuento" value={`-${money(preview.descuento, 2)}`} />}
    <Fila label={`IVA (${IVA_PORCENTAJE}%)`} value={money(preview.impuesto, 2)} />
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: `1px solid ${notion.divider}`,
        marginTop: 6,
        paddingTop: 6,
        fontWeight: 700,
        fontSize: 15,
        color: notion.ink,
      }}
    >
      <span>Total</span>
      <span>{money(preview.total, 2)}</span>
    </div>
  </div>
);

export default function CheckOutModal({ open, venta, token, onClose, onSuccess }: CheckOutModalProps) {
  const [step, setStep] = useState(0);
  const [incluyeIva, setIncluyeIva] = useState(false);
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setIncluyeIva(false);
      setExtras([]);
    }
  }, [open, venta?.id]);

  if (!venta) return null;

  const tarifaPorNoche = venta.precios.reduce((acc, p) => acc + Number(p.precio), 0);
  const noches = nochesReales(venta);
  const extrasTotal = extras.reduce((acc, e) => acc + (Number(e.cantidad) || 0) * (Number(e.precio_unitario) || 0), 0);
  const preview = calcularPreview(tarifaPorNoche, noches, extrasTotal, Number(venta.descuento) || 0, incluyeIva);

  const addExtra = () => setExtras((prev) => [...prev, { descripcion: '', cantidad: 1, precio_unitario: 0 }]);
  const updateExtra = (idx: number, patch: Partial<ExtraItem>) =>
    setExtras((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  const removeExtra = (idx: number) => setExtras((prev) => prev.filter((_, i) => i !== idx));

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const validos = extras.filter((e) => e.descripcion.trim() && e.cantidad > 0);
      const result = await VentasService.checkOutVenta(token, venta.id, incluyeIva, validos);
      message.success(`Check-out registrado: factura ${result.factura.numero_factura} generada`);
      onSuccess(result);
    } catch {
      message.error('Error al registrar el check-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} title="Registrar check-out" width={520} footer={null} destroyOnClose>
      <Steps
        size="small"
        current={step}
        items={[{ title: 'Resumen' }, { title: 'Cargos adicionales' }]}
        style={{ marginBottom: 20 }}
      />

      {step === 0 && (
        <div>
          <div
            style={{
              borderTop: `1px solid ${notion.divider}`,
              borderBottom: `1px solid ${notion.divider}`,
              padding: '8px 0',
              marginBottom: 16,
            }}
          >
            {venta.precios.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                <span>Habitación {p.habitacion.numero}</span>
                <span style={{ color: notion.inkMuted }}>{money(p.precio, 2)} / noche</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: notion.inkMuted }}>
              <span>Noches (check-in → hoy)</span>
              <span>{noches}</span>
            </div>
          </div>

          <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 13 }}>¿La tarifa ya incluye el IVA?</div>
          <Radio.Group value={incluyeIva} onChange={(e) => setIncluyeIva(e.target.value)} style={{ marginBottom: 20 }}>
            <Radio value={false}>No, hay que sumarle el IVA</Radio>
            <Radio value={true}>Sí, el precio ya lo incluye</Radio>
          </Radio.Group>

          <ResumenTotales preview={preview} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button type="primary" onClick={() => setStep(1)} style={{ borderRadius: 8 }}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize: 13, color: notion.inkMuted, marginBottom: 12 }}>
            Agrega cualquier consumo extra del huésped (minibar, lavandería, servicio a la habitación...).
          </div>

          {extras.length === 0 && (
            <Empty description="Sin cargos adicionales" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '16px 0' }} />
          )}

          {extras.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <Input
                placeholder="Descripción"
                value={item.descripcion}
                onChange={(e) => updateExtra(idx, { descripcion: e.target.value })}
                style={{ flex: 1 }}
              />
              <InputNumber
                min={1}
                value={item.cantidad}
                onChange={(v) => updateExtra(idx, { cantidad: Number(v) || 1 })}
                style={{ width: 64 }}
              />
              <InputNumber
                min={0}
                prefix="$"
                value={item.precio_unitario}
                onChange={(v) => updateExtra(idx, { precio_unitario: Number(v) || 0 })}
                style={{ width: 100 }}
              />
              <Button type="text" danger size="small" icon={<Trash2 size={14} />} onClick={() => removeExtra(idx)} />
            </div>
          ))}

          <Button type="dashed" block icon={<Plus size={14} />} onClick={addExtra} style={{ marginBottom: 20 }}>
            Agregar cargo
          </Button>

          <ResumenTotales preview={preview} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <Button onClick={() => setStep(0)} style={{ borderRadius: 8 }}>
              Atrás
            </Button>
            <Button type="primary" loading={loading} onClick={handleConfirm} style={{ borderRadius: 8 }}>
              Confirmar check-out
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
