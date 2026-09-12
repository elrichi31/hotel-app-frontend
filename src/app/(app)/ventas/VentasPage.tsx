// components/VentasPage.tsx
"use client"
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import CheckOutModal from '@/components/CheckOutModal';
import { Spinner, Select, SelectItem } from '@heroui/react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  Pencil,
  Trash2,
  FileText,
  User,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Wallet,
  Hash,
  Tag,
  LogIn,
  LogOut,
} from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { money, dateTime } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { StatusPill } from '@/components/ui/StatusPill';
import { TableToolbar, Period, useToolbarFilterChips } from '@/components/ui/TableToolbar';
import { ActiveFilters, ActiveFilter } from '@/components/ui/ActiveFilters';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
import { toast } from '@/lib/toast';

dayjs.extend(isBetween);

interface VentasPageProps {
  token: string;
}

type EstadoVenta = 'reservado' | 'check_in' | 'check_out' | 'cancelada';

type Venta = {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_checkin: string | null;
  created_at: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: EstadoVenta;
  personas: { nombre: string; apellido: string }[];
  facturas: unknown[];
  usuario: { first_name: string; last_name: string } | null;
  precios: { precio: number; habitacion: { numero: string } }[];
};

const ESTADO_LABEL: Record<EstadoVenta, string> = {
  reservado: 'Reservado',
  check_in: 'Check-in',
  check_out: 'Check-out',
  cancelada: 'Cancelada',
};

const ESTADO_COLOR: Record<EstadoVenta, string> = {
  reservado: viz.neutral,
  check_in: viz.positive,
  check_out: notion.inkFaint,
  cancelada: viz.negative,
};

/** true si `fecha` cae dentro del periodo rápido elegido. */
const enPeriodo = (fecha: string, periodo: Period) => {
  const d = dayjs(fecha);
  const hoy = dayjs().startOf('day');
  switch (periodo) {
    case 'hoy':
      return d.isSame(hoy, 'day');
    case 'ayer':
      return d.isSame(hoy.subtract(1, 'day'), 'day');
    case '7dias':
      return d.isBetween(hoy.subtract(7, 'day'), hoy, 'day', '[]');
    case 'mes':
      return d.isAfter(hoy.subtract(1, 'month'));
    default:
      return true;
  }
};

const VentasPage: React.FC<VentasPageProps> = ({ token }) => {
  const router = useRouter();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Period>('todas');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });
  const [isPending, startTransition] = useTransition();
  const [checkoutVenta, setCheckoutVenta] = useState<Venta | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchVentas = async () => {
      try {
        const data = await VentasService.getAllVentas(token);
        setVentas(data.sort((a: Venta, b: Venta) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
      } catch {
        setError('Error al obtener las ventas');
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [token]);

  // Periodo, rango de fechas y búsqueda se combinan: antes cada uno pisaba
  // a los demás (buscar borraba el filtro de periodo activo, y viceversa).
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ventas.filter((venta) => {
      if (filtroEstado !== 'todos' && venta.estado !== filtroEstado) return false;
      if (!enPeriodo(venta.fecha_inicio, periodo)) return false;
      if (dateRange && !dayjs(venta.fecha_inicio).isBetween(dateRange[0], dateRange[1], null, '[]')) return false;
      if (!q) return true;
      const cliente = venta.personas[0] ? `${venta.personas[0].nombre} ${venta.personas[0].apellido}` : '';
      return (
        String(venta.id).includes(q) ||
        cliente.toLowerCase().includes(q) ||
        String(venta.subtotal).includes(q) ||
        String(venta.total).includes(q)
      );
    });
  }, [ventas, periodo, dateRange, busqueda, filtroEstado]);

  const handleDelete = async (ventaId: number) => {
    try {
      await VentasService.deleteVenta(token, ventaId);
      toast.success('Venta eliminada');
      setVentas((prev) => prev.filter((v) => v.id !== ventaId));
    } catch {
      toast.error('Error al eliminar la venta');
    }
  };

  const handleCheckIn = async (ventaId: number) => {
    try {
      const updated = await VentasService.checkInVenta(token, ventaId);
      toast.success('Check-in registrado');
      setVentas((prev) => prev.map((v) => (v.id === ventaId ? { ...v, estado: updated.estado } : v)));
    } catch {
      toast.error('Error al registrar el check-in');
    }
  };

  const openCheckOut = (venta: Venta) => {
    setCheckoutVenta(venta);
  };

  const handleCheckOutSuccess = ({ venta, factura }: { venta: any; factura: any }) => {
    setVentas((prev) =>
      prev.map((v) => (v.id === venta.id ? { ...v, estado: venta.estado, facturas: [...v.facturas, factura] } : v))
    );
    setCheckoutVenta(null);
  };

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<Venta>(
    visibles,
    {
      id: (a, b) => a.id - b.id,
      fecha_inicio: (a, b) => dayjs(a.fecha_inicio).diff(dayjs(b.fecha_inicio)),
      created_at: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
      subtotal: (a, b) => a.subtotal - b.subtotal,
      total: (a, b) => a.total - b.total,
    },
    { column: 'created_at', direction: 'descending' }
  );
  const pageItems = paginate(sorted, pagination);
  const filterChips: ActiveFilter[] = [
    ...useToolbarFilterChips({ search: busqueda, onSearch: setBusqueda, period: periodo, onPeriodChange: setPeriodo, dateRange, onDateRangeChange: setDateRange }),
    ...(filtroEstado !== 'todos'
      ? [{ key: 'estado', label: ESTADO_LABEL[filtroEstado as EstadoVenta] ?? filtroEstado, onClear: () => setFiltroEstado('todos') }]
      : []),
  ];

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<Venta>[] = [
    {
      key: 'id',
      header: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      allowsSorting: true,
      width: 80,
      render: (v) => <span style={{ color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>{v.id}</span>,
    },
    {
      key: 'cliente',
      header: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      render: (v) => (v.personas[0] ? `${v.personas[0].nombre} ${v.personas[0].apellido}` : '—'),
    },
    {
      key: 'fecha_inicio',
      header: <ColumnHeader icon={<Calendar size={13} />}>Fecha de inicio</ColumnHeader>,
      allowsSorting: true,
      render: (v) => <span style={{ color: notion.inkMuted }}>{dateTime(v.fecha_inicio)}</span>,
    },
    {
      key: 'fecha_fin',
      header: <ColumnHeader icon={<Calendar size={13} />}>Fecha de fin</ColumnHeader>,
      render: (v) => <span style={{ color: notion.inkMuted }}>{dateTime(v.fecha_fin)}</span>,
    },
    {
      key: 'created_at',
      header: <ColumnHeader icon={<Clock size={13} />}>Creada</ColumnHeader>,
      allowsSorting: true,
      render: (v) => <span style={{ color: notion.inkFaint }}>{dateTime(v.created_at)}</span>,
    },
    {
      key: 'usuario',
      header: <ColumnHeader icon={<UserCheck size={13} />}>Registrada por</ColumnHeader>,
      render: (v) => (
        <span style={{ color: notion.inkMuted }}>
          {v.usuario ? `${v.usuario.first_name} ${v.usuario.last_name}` : '—'}
        </span>
      ),
    },
    {
      key: 'facturas',
      header: <ColumnHeader icon={<FileText size={13} />}># Facturas</ColumnHeader>,
      align: 'center',
      render: (v) => v.facturas.length,
    },
    {
      key: 'subtotal',
      header: <ColumnHeader icon={<DollarSign size={13} />}>Subtotal</ColumnHeader>,
      allowsSorting: true,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(v.subtotal, 2)}</span>,
    },
    {
      key: 'descuento',
      header: <ColumnHeader icon={<Percent size={13} />}>Descuento</ColumnHeader>,
      render: (v) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{money(v.descuento, 2)}</span>
      ),
    },
    {
      key: 'total',
      header: <ColumnHeader icon={<Wallet size={13} />}>Total</ColumnHeader>,
      allowsSorting: true,
      render: (v) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {money(v.total, 2)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: <ColumnHeader icon={<Tag size={13} />}>Estado</ColumnHeader>,
      render: (v) => <StatusPill color={ESTADO_COLOR[v.estado]} label={ESTADO_LABEL[v.estado]} />,
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (venta) => (
        <RowActionsMenu
          actions={[
            ...(venta.estado === 'reservado'
              ? [{ key: 'checkin', label: 'Check-in', icon: <LogIn size={14} />, onClick: () => handleCheckIn(venta.id) }]
              : []),
            ...(venta.estado === 'check_in'
              ? [{ key: 'checkout', label: 'Check-out', icon: <LogOut size={14} />, onClick: () => openCheckOut(venta) }]
              : []),
            { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => router.push(`ventas/${venta.id}`) },
            {
              key: 'facturas',
              label: 'Ver facturas',
              icon: <FileText size={14} />,
              onClick: () => router.push(`ventas/facturas/${venta.id}`),
            },
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDelete(venta.id),
              confirm: {
                title: '¿Eliminar esta venta?',
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
    <div style={{ maxWidth: 1500, margin: '0 auto' }}>
      <PageHeader
        title="Ventas"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{visibles.length}</strong> de {ventas.length} ventas
          </>
        }
      />

      <TableToolbar
        search={busqueda}
        onSearch={setBusqueda}
        searchPlaceholder="Buscar por cliente, ID o monto"
        period={periodo}
        onPeriodChange={setPeriodo}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div style={{ marginBottom: 14 }}>
        <Select
          aria-label="Estado"
          placeholder="Estado"
          selectedKeys={[filtroEstado]}
          onSelectionChange={(keys) => setFiltroEstado(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
          className="w-48"
          disallowEmptySelection
        >
          <SelectItem key="todos">Todos los estados</SelectItem>
          <SelectItem key="reservado">Reservado</SelectItem>
          <SelectItem key="check_in">Check-in</SelectItem>
          <SelectItem key="check_out">Check-out</SelectItem>
          <SelectItem key="cancelada">Cancelada</SelectItem>
        </Select>
      </div>

      <ActiveFilters filters={filterChips} />

      <DataTable<Venta>
        ariaLabel="Ventas"
        columns={columns}
        rows={pageItems}
        isLoading={isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No existen ventas"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="ventas"
              pagination={pagination}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
      />

      <CheckOutModal
        open={checkoutVenta !== null}
        venta={checkoutVenta}
        token={token}
        onClose={() => setCheckoutVenta(null)}
        onSuccess={handleCheckOutSuccess}
      />
    </div>
  );
};

export default VentasPage;
