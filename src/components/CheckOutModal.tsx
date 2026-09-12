'use client';
import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, RadioGroup, Radio, Button, Input } from '@heroui/react';
import dayjs from 'dayjs';
import { Plus, Trash2 } from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import VentasService from '@/services/VentasService';
import { toast } from '@/lib/toast';

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

const STEPS = ['Resumen', 'Cargos adicionales'];

/** Reemplaza `Steps` de antd: HeroUI no tiene un componente de pasos equivalente. */
const StepHeader = ({ current }: { current: number }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
    {STEPS.map((label, i) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            background: i <= current ? viz.series1 : notion.track,
            color: i <= current ? '#fff' : notion.inkFaint,
          }}
        >
          {i + 1}
        </div>
        <span style={{ fontSize: 13, color: i === current ? notion.ink : notion.inkFaint }}>{label}</span>
        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: notion.divider }} />}
      </div>
    ))}
  </div>
);

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
      toast.success(`Check-out registrado: factura ${result.factura.numero_factura} generada`);
      onSuccess(result);
    } catch {
      toast.error('Error al registrar el check-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Registrar check-out</ModalHeader>
        <ModalBody className="pb-6">
          <StepHeader current={step} />

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

              <RadioGroup
                label="¿La tarifa ya incluye el IVA?"
                value={incluyeIva ? 'si' : 'no'}
                onValueChange={(v) => setIncluyeIva(v === 'si')}
                className="mb-5"
              >
                <Radio value="no">No, hay que sumarle el IVA</Radio>
                <Radio value="si">Sí, el precio ya lo incluye</Radio>
              </RadioGroup>

              <ResumenTotales preview={preview} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button color="primary" onPress={() => setStep(1)}>
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
                <div style={{ textAlign: 'center', color: notion.inkFaint, fontSize: 13, margin: '16px 0' }}>
                  Sin cargos adicionales
                </div>
              )}

              {extras.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <Input
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => updateExtra(idx, { descripcion: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={String(item.cantidad)}
                    onChange={(e) => updateExtra(idx, { cantidad: Number(e.target.value) || 1 })}
                    style={{ width: 72 }}
                  />
                  <Input
                    type="number"
                    min={0}
                    startContent="$"
                    value={String(item.precio_unitario)}
                    onChange={(e) => updateExtra(idx, { precio_unitario: Number(e.target.value) || 0 })}
                    style={{ width: 110 }}
                  />
                  <Button isIconOnly variant="light" color="danger" size="sm" onPress={() => removeExtra(idx)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}

              <Button variant="bordered" fullWidth startContent={<Plus size={14} />} onPress={addExtra} className="mb-5">
                Agregar cargo
              </Button>

              <ResumenTotales preview={preview} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <Button variant="bordered" onPress={() => setStep(0)}>
                  Atrás
                </Button>
                <Button color="primary" isLoading={loading} onPress={handleConfirm}>
                  Confirmar check-out
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
