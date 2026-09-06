// components/RoomsPage.tsx
'use client';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import RoomService from '@/services/RoomService';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Home,
  Tag,
  Hash,
  Wallet,
  UserSquare2,
} from 'lucide-react';
import { Button, message, Table, Input, Segmented, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RoomModal from '@/components/RoomModal';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';
import type { Room, RoomPrecio } from '@/types/types';

interface RoomsPageProps {
  token: string;
}

/** Menor y mayor tarifa de la habitación; null si aún no tiene tarifas cargadas. */
const rangoTarifas = (precios: RoomPrecio[] = []) => {
  const valores = precios.map((p) => Number(p.precio)).filter((n) => !Number.isNaN(n));
  if (valores.length === 0) return null;
  return { min: Math.min(...valores), max: Math.max(...valores) };
};

export default function RoomsPage({ token }: RoomsPageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todas' | 'Libre' | 'Ocupado'>('Todas');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });
  const [isPending, startTransition] = useTransition();

  const fetchRooms = async () => {
    try {
      if (token) {
        const roomsData = await RoomService.getAllRooms(token);
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error('No se pudieron cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const abrirCrear = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const abrirEditar = (room: Room) => {
    setEditing(room);
    setIsModalOpen(true);
  };

  const handleOk = async (values: any) => {
    try {
      if (!token) return;
      if (editing) {
        const actualizada = await RoomService.updateRoom(editing.id, { ...editing, ...values }, token);
        setRooms((prev) => prev.map((r) => (r.id === editing.id ? actualizada : r)));
        message.success('Habitación actualizada');
      } else {
        const nueva = await RoomService.createRoom(
          { ...values, fechaInicioOcupacion: null, fechaFinOcupacion: null },
          token
        );
        setRooms((prev) => [...prev, nueva]);
        message.success('Habitación creada');
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (error: any) {
      console.error('Error guardando habitación:', error);
      message.error(error?.response?.data?.message ?? 'Error al guardar la habitación');
    }
  };

  const eliminar = async (room: Room) => {
    try {
      if (!token) return;
      await RoomService.deleteRoom(room.id, token);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      message.success(`Habitación ${room.numero} eliminada`);
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Error al eliminar la habitación');
    }
  };

  const tipos = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.tipo))).sort(),
    [rooms]
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return rooms.filter((r) => {
      if (filtroEstado !== 'Todas' && r.estado !== filtroEstado) return false;
      if (!q) return true;
      return (
        String(r.numero).toLowerCase().includes(q) ||
        r.tipo?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q)
      );
    });
  }, [rooms, busqueda, filtroEstado]);

  const libres = rooms.filter((r) => r.estado === 'Libre').length;

  const columns: ColumnsType<Room> = [
    {
      title: <ColumnHeader icon={<Home size={13} />}>Habitación</ColumnHeader>,
      dataIndex: 'numero',
      key: 'numero',
      // Orden numérico: el número viene como texto y "10" iría antes que "9"
      sorter: (a, b) => Number(a.numero) - Number(b.numero),
      defaultSortOrder: 'ascend',
      render: (numero: string) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {numero}
        </span>
      ),
      width: 120,
    },
    {
      title: <ColumnHeader icon={<Tag size={13} />}>Tipo</ColumnHeader>,
      dataIndex: 'tipo',
      key: 'tipo',
      filters: tipos.map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.tipo === value,
      sorter: (a, b) => a.tipo.localeCompare(b.tipo),
      render: (tipo: string) => <span style={{ color: notion.inkMuted }}>{tipo}</span>,
      width: 130,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: Room['estado']) => (
        <StatusPill color={estado === 'Libre' ? viz.positive : viz.negative} label={estado} />
      ),
      width: 120,
    },
    {
      title: <ColumnHeader icon={<Hash size={13} />}>Camas</ColumnHeader>,
      dataIndex: 'numero_camas',
      key: 'numero_camas',
      align: 'center',
      sorter: (a, b) => a.numero_camas - b.numero_camas,
      render: (n: number) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
      ),
      width: 90,
    },
    {
      title: <ColumnHeader icon={<Wallet size={13} />}>Tarifas</ColumnHeader>,
      key: 'tarifas',
      // Ordena por la tarifa más baja; sin tarifas va al final
      sorter: (a, b) => (rangoTarifas(a.precios)?.min ?? Infinity) - (rangoTarifas(b.precios)?.min ?? Infinity),
      render: (_, room) => {
        const rango = rangoTarifas(room.precios);
        if (!rango) return <span style={{ color: notion.inkFaint }}>Sin tarifas</span>;
        const texto = rango.min === rango.max ? money(rango.min) : `${money(rango.min)} – ${money(rango.max)}`;
        return (
          <Tooltip title="Despliega la fila para ver el detalle por número de huéspedes">
            <span style={{ color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>{texto}</span>
          </Tooltip>
        );
      },
      width: 160,
    },
    {
      title: <ColumnHeader icon={<UserSquare2 size={13} />}>Descripción</ColumnHeader>,
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: true,
      render: (d: string) => <span style={{ color: notion.inkFaint }}>{d}</span>,
    },
    {
      title: '',
      key: 'acciones',
      align: 'right',
      width: 60,
      render: (_, room) => (
        <RowActionsMenu
          actions={[
            { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => abrirEditar(room) },
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => eliminar(room),
              confirm: {
                title: `¿Eliminar la habitación ${room.numero}?`,
                description: 'Esta acción no se puede deshacer.',
                okText: 'Eliminar',
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Habitaciones"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{libres}</strong> libres de {rooms.length}
          </>
        }
        action={
          <Button type="primary" icon={<Plus size={16} />} onClick={abrirCrear}>
            Crear habitación
          </Button>
        }
      />

      {/* Filtros en una sola fila sobre la tabla */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Input
          allowClear
          prefix={<Search size={14} color={notion.inkFaint} />}
          placeholder="Buscar por número, tipo o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 340 }}
        />
        <Segmented
          value={filtroEstado}
          onChange={(v) => setFiltroEstado(v as typeof filtroEstado)}
          options={['Todas', 'Libre', 'Ocupado']}
        />
      </div>

      <Table<Room>
        rowKey="id"
        columns={columns}
        dataSource={visibles}
        loading={loading || isPending}
        size="middle"
        sticky
        scroll={{ x: 900 }}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showTotal: (total) => (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              {total} habitaciones
              <PageSizeSelect
                value={pagination.pageSize}
                options={[15, 25, 50]}
                onChange={(pageSize) => startTransition(() => setPagination({ current: 1, pageSize }))}
              />
            </span>
          ),
          onChange: (current, pageSize) => startTransition(() => setPagination({ current, pageSize })),
        }}
        expandable={{
          // Las tarifas son una lista de 1..N: no caben en una celda, van aquí
          expandedRowRender: (room) => (
            <div style={{ padding: '4px 8px 10px' }}>
              <div style={{ fontSize: 12, color: notion.inkFaint, marginBottom: 8 }}>
                Tarifa por número de huéspedes
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(room.precios ?? []).map((p) => (
                  <div
                    key={`${room.id}-${p.numero_personas}`}
                    style={{
                      border: `1px solid ${notion.divider}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      minWidth: 104,
                      background: notion.cardBg,
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: notion.inkFaint }}>
                      {p.numero_personas} {p.numero_personas === 1 ? 'huésped' : 'huéspedes'}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: notion.ink,
                        marginTop: 2,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {money(Number(p.precio))}
                    </div>
                  </div>
                ))}
                {(room.precios ?? []).length === 0 && (
                  <span style={{ color: notion.inkFaint, fontSize: 13 }}>
                    Esta habitación todavía no tiene tarifas cargadas.
                  </span>
                )}
              </div>
            </div>
          ),
        }}
      />

      <RoomModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onOk={handleOk}
        room={editing}
        edit={!!editing}
      />
    </div>
  );
}
