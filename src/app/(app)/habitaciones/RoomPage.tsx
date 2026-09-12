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
  Wifi,
  Tv,
  Users,
} from 'lucide-react';
import { Button, Input, Tabs, Tab, Tooltip, Popover, PopoverTrigger, PopoverContent, Select, SelectItem } from '@heroui/react';
import RoomModal from '@/components/RoomModal';
import { notion, viz } from '@/lib/theme';
import { money } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { StatusPill } from '@/components/ui/StatusPill';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { ActiveFilters, ActiveFilter } from '@/components/ui/ActiveFilters';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
import type { Room, RoomPrecio } from '@/types/types';
import { toast } from '@/lib/toast';

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
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 15 });
  const [isPending, startTransition] = useTransition();

  const fetchRooms = async () => {
    try {
      if (token) {
        const roomsData = await RoomService.getAllRooms(token);
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('No se pudieron cargar las habitaciones');
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
        toast.success('Habitación actualizada');
      } else {
        const nueva = await RoomService.createRoom(
          { ...values, fechaInicioOcupacion: null, fechaFinOcupacion: null },
          token
        );
        setRooms((prev) => [...prev, nueva]);
        toast.success('Habitación creada');
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (error: any) {
      console.error('Error guardando habitación:', error);
      toast.error(error?.response?.data?.message ?? 'Error al guardar la habitación');
    }
  };

  const eliminar = async (room: Room) => {
    try {
      if (!token) return;
      await RoomService.deleteRoom(room.id, token);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      toast.success(`Habitación ${room.numero} eliminada`);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Error al eliminar la habitación');
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
      if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false;
      if (!q) return true;
      return (
        String(r.numero).toLowerCase().includes(q) ||
        r.tipo?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q)
      );
    });
  }, [rooms, busqueda, filtroEstado, filtroTipo]);

  const libres = rooms.filter((r) => r.estado === 'Libre').length;

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<Room>(
    visibles,
    {
      numero: (a, b) => Number(a.numero) - Number(b.numero),
      tipo: (a, b) => a.tipo.localeCompare(b.tipo),
      numero_camas: (a, b) => a.numero_camas - b.numero_camas,
      capacidad: (a, b) => (a.capacidad ?? 0) - (b.capacidad ?? 0),
      tarifas: (a, b) => (rangoTarifas(a.precios)?.min ?? Infinity) - (rangoTarifas(b.precios)?.min ?? Infinity),
    },
    { column: 'numero', direction: 'ascending' }
  );
  const pageItems = paginate(sorted, pagination);
  const filterChips: ActiveFilter[] = [
    ...(busqueda.trim() ? [{ key: 'search', label: `“${busqueda.trim()}”`, onClear: () => setBusqueda('') }] : []),
    ...(filtroEstado !== 'Todas' ? [{ key: 'estado', label: filtroEstado, onClear: () => setFiltroEstado('Todas') }] : []),
    ...(filtroTipo !== 'todos' ? [{ key: 'tipo', label: filtroTipo, onClear: () => setFiltroTipo('todos') }] : []),
  ];

  const columns: DataTableColumn<Room>[] = [
    {
      key: 'numero',
      header: <ColumnHeader icon={<Home size={13} />}>Habitación</ColumnHeader>,
      allowsSorting: true,
      width: 120,
      render: (room) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {room.numero}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: <ColumnHeader icon={<Tag size={13} />}>Tipo</ColumnHeader>,
      allowsSorting: true,
      width: 130,
      render: (room) => <span style={{ color: notion.inkMuted }}>{room.tipo}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      width: 120,
      render: (room) => (
        <StatusPill color={room.estado === 'Libre' ? viz.positive : viz.negative} label={room.estado} />
      ),
    },
    {
      key: 'numero_camas',
      header: <ColumnHeader icon={<Hash size={13} />}>Camas</ColumnHeader>,
      align: 'center',
      allowsSorting: true,
      width: 90,
      render: (room) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{room.numero_camas}</span>
      ),
    },
    {
      key: 'capacidad',
      header: <ColumnHeader icon={<Users size={13} />}>Capacidad</ColumnHeader>,
      align: 'center',
      allowsSorting: true,
      width: 100,
      render: (room) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{room.capacidad ?? '-'}</span>
      ),
    },
    {
      key: 'comodidades',
      header: 'Comodidades',
      width: 110,
      render: (room) => (
        <div style={{ display: 'flex', gap: 10 }}>
          <Tooltip content={room.wifi ? 'Tiene wifi' : 'Sin wifi'}>
            <span style={{ display: 'inline-flex' }}>
              <Wifi size={15} color={room.wifi ? viz.positive : notion.divider} />
            </span>
          </Tooltip>
          <Tooltip content={room.tv_cable ? 'Tiene TV por cable' : 'Sin TV por cable'}>
            <span style={{ display: 'inline-flex' }}>
              <Tv size={15} color={room.tv_cable ? viz.positive : notion.divider} />
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'tarifas',
      header: <ColumnHeader icon={<Wallet size={13} />}>Tarifas</ColumnHeader>,
      allowsSorting: true,
      width: 160,
      render: (room) => {
        const rango = rangoTarifas(room.precios);
        if (!rango) return <span style={{ color: notion.inkFaint }}>Sin tarifas</span>;
        const texto = rango.min === rango.max ? money(rango.min) : `${money(rango.min)} – ${money(rango.max)}`;
        return (
          <Popover placement="bottom">
            <PopoverTrigger>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: notion.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {texto}
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <div style={{ padding: 8, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: notion.inkFaint, marginBottom: 8 }}>
                  Camas {room.tipo_cama ? `de ${room.tipo_cama.toLowerCase()}` : ''}
                  {room.amenidades && room.amenidades.length > 0 && <> · {room.amenidades.join(', ')}</>}
                </div>
                <div style={{ fontSize: 12, color: notion.inkFaint, marginBottom: 8 }}>Tarifa por número de huéspedes</div>
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
                      <div style={{ fontSize: 16, fontWeight: 600, color: notion.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                        {money(Number(p.precio))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      key: 'descripcion',
      header: <ColumnHeader icon={<UserSquare2 size={13} />}>Descripción</ColumnHeader>,
      render: (room) => (
        <span
          style={{
            color: notion.inkFaint,
            display: 'block',
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={room.descripcion}
        >
          {room.descripcion}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (room) => (
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
          <Button color="primary" startContent={<Plus size={16} />} onPress={abrirCrear}>
            Crear habitación
          </Button>
        }
      />

      {/* Filtros en una sola fila sobre la tabla */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          isClearable
          startContent={<Search size={14} color={notion.inkFaint} />}
          placeholder="Buscar por número, tipo o descripción"
          value={busqueda}
          onValueChange={setBusqueda}
          className="max-w-xs"
        />
        <Tabs
          selectedKey={filtroEstado}
          onSelectionChange={(key) => setFiltroEstado(key as typeof filtroEstado)}
          size="sm"
          variant="solid"
          color="primary"
        >
          <Tab key="Todas" title="Todas" />
          <Tab key="Libre" title="Libre" />
          <Tab key="Ocupado" title="Ocupado" />
        </Tabs>
        {tipos.length > 0 && (
          <Select
            aria-label="Tipo"
            placeholder="Tipo"
            selectedKeys={[filtroTipo]}
            onSelectionChange={(keys) => setFiltroTipo(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
            className="w-40"
            disallowEmptySelection
          >
            {[
              <SelectItem key="todos">Todos los tipos</SelectItem>,
              ...tipos.map((t) => <SelectItem key={t}>{t}</SelectItem>),
            ]}
          </Select>
        )}
      </div>

      <ActiveFilters filters={filterChips} />

      <DataTable<Room>
        ariaLabel="Habitaciones"
        columns={columns}
        rows={pageItems}
        isLoading={loading || isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No hay habitaciones registradas"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="habitaciones"
              pagination={pagination}
              pageSizeOptions={[15, 25, 50]}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
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
