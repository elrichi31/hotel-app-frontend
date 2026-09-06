"use client";
import React, { useMemo, useState } from 'react';
import { Input, Select, Checkbox, Segmented, Tag } from 'antd';
import { Search } from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { StatusDot } from '@/components/ui/StatusDot';
import { money } from '@/lib/format';
import type { Room } from '@/types/types';

type SelectedCard = { id: string; price: number; priceId: number };

/**
 * Selector de habitaciones para el formulario de venta: buscador + lista
 * compacta y contenida en scroll (antes eran ~40 tarjetas de 240px cada una,
 * una pared imposible de escanear). Cada fila es una casilla + el precio
 * según huéspedes; lo elegido queda resumido arriba en chips.
 */
export function RoomPicker({
  rooms,
  selected,
  onToggle,
  onPriceChange,
}: {
  rooms: Room[];
  selected: SelectedCard[];
  onToggle: (room: Room, price: number | null, priceId: number | null) => void;
  onPriceChange: (roomId: string, price: number, priceId: number) => void;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'Todas' | 'Libre' | 'Ocupado'>('Todas');

  const seleccionadoPor = useMemo(() => {
    const m = new Map<string, SelectedCard>();
    for (const s of selected) m.set(String(s.id), s);
    return m;
  }, [selected]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return rooms.filter((r) => {
      if (filtro !== 'Todas' && r.estado !== filtro) return false;
      if (!q) return true;
      return String(r.numero).toLowerCase().includes(q) || r.tipo?.toLowerCase().includes(q);
    });
  }, [rooms, busqueda, filtro]);

  return (
    <div>
      {/* Lo elegido, siempre visible arriba: no hay que rastrearlo en la lista */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {selected.map((s) => {
            const room = rooms.find((r) => String(r.id) === String(s.id));
            return (
              <Tag
                key={s.id}
                closable
                onClose={() => room && onToggle(room, null, null)}
                style={{ margin: 0 }}
              >
                Hab. {room?.numero ?? s.id} · {money(s.price, 2)}
              </Tag>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <Input
          allowClear
          size="small"
          prefix={<Search size={13} color={notion.inkFaint} />}
          placeholder="Buscar por número o tipo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        <Segmented
          size="small"
          value={filtro}
          onChange={(v) => setFiltro(v as typeof filtro)}
          options={['Todas', 'Libre', 'Ocupado']}
        />
      </div>

      {/* Alto fijo con scroll interno: la sección deja de empujar el resto de la página */}
      <div
        style={{
          maxHeight: 340,
          overflowY: 'auto',
          border: `1px solid ${notion.divider}`,
          borderRadius: notion.radius,
        }}
      >
        {visibles.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: notion.inkFaint, fontSize: 13 }}>
            Ninguna habitación coincide con la búsqueda.
          </div>
        ) : (
          visibles.map((room, i) => {
            const marcado = seleccionadoPor.has(String(room.id));
            const actual = seleccionadoPor.get(String(room.id));
            return (
              <div
                key={room.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderTop: i === 0 ? 'none' : `1px solid ${notion.divider}`,
                  background: marcado ? viz.series1 + '14' : 'transparent',
                }}
              >
                <Checkbox
                  checked={marcado}
                  onChange={() => {
                    if (marcado) {
                      onToggle(room, null, null);
                    } else {
                      const primero = room.precios?.[0];
                      onToggle(room, primero ? Number(primero.precio) : null, primero?.id ?? null);
                    }
                  }}
                />
                <span style={{ width: 44, fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {room.numero}
                </span>
                <span style={{ width: 84, color: notion.inkMuted, fontSize: 13 }}>{room.tipo}</span>
                <span style={{ width: 92 }}>
                  <StatusDot color={room.estado === 'Libre' ? viz.positive : viz.series3} label={room.estado} />
                </span>
                <Select
                  size="small"
                  disabled={!marcado}
                  value={actual?.priceId}
                  placeholder="Tarifa"
                  style={{ width: 150, marginLeft: 'auto' }}
                  options={(room.precios ?? []).map((p) => ({
                    value: p.id,
                    label: `${p.numero_personas} pers. · ${money(Number(p.precio), 2)}`,
                  }))}
                  onChange={(priceId) => {
                    const precio = room.precios?.find((p) => p.id === priceId);
                    if (precio) onPriceChange(String(room.id), Number(precio.precio), precio.id);
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
