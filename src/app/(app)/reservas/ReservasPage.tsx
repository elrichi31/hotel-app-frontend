'use client'
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import ReservaService from '@/services/ReservasService';
import ReservaModal from '@/components/ReservaModal';
import ReservasLibresPage from './ReservasLibresPage';
import { Spinner, Tabs, Tab, Select, SelectItem } from '@heroui/react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  Trash2,
  Info,
  User,
  Calendar,
  Clock,
  Users,
  Wallet,
  Tag,
  Hash,
  Check,
  X,
} from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { money, dateTime } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { StatusPill } from '@/components/ui/StatusPill';
import { TableToolbar, Period } from '@/components/ui/TableToolbar';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
import { toast } from '@/lib/toast';

dayjs.extend(isBetween);

interface ReservasPageProps {
  token: string;
}

type Estado = 'pendiente' | 'confirmado' | 'aprobada' | 'cancelada';
type Reserva = {
  id: number;
  nombre: string;
  apellido: string;
  created_at: string;
  fecha_inicio: string;
  fecha_fin: string;
  numero_personas: number;
  total: number;
  estado: Estado;
};

const ESTADO_COLOR: Record<Estado, string> = {
  pendiente: viz.neutral,
  confirmado: viz.positive,
  aprobada: viz.positive,
  cancelada: viz.negative,
};

const enPeriodo = (fecha: string, periodo: Period) => {
  const d = dayjs(fecha);
  const hoy = dayjs().startOf('day');
  switch (periodo) {
    case 'hoy':
      return d.isSame(hoy, 'day');
    case 'ayer':
      return d.isSame(hoy.subtract(1, 'day'), 'day');
    case '7dias':
      return d.isAfter(hoy.subtract(7, 'day'));
    case 'mes':
      return d.isAfter(hoy.subtract(1, 'month'));
    default:
      return true;
  }
};

const ReservasPage: React.FC<ReservasPageProps> = ({ token }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Period>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });
  const [isPending, startTransition] = useTransition();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchReservas = async () => {
      try {
        const data = await ReservaService.getAllReservas(token);
        setReservas(data as unknown as Reserva[]);
      } catch {
        setError('Error al obtener las reservas');
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, [token]);

  // Periodo, rango de fechas y búsqueda se combinan en un solo filtro.
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reservas.filter((r) => {
      if (filtroEstado !== 'todos' && r.estado !== filtroEstado) return false;
      if (!enPeriodo(r.fecha_inicio, periodo)) return false;
      if (dateRange && !dayjs(r.fecha_inicio).isBetween(dateRange[0], dateRange[1], null, '[]')) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        r.apellido.toLowerCase().includes(q) ||
        String(r.total).includes(q)
      );
    });
  }, [reservas, periodo, dateRange, busqueda, filtroEstado]);

  const handleDelete = async (reservaId: number) => {
    try {
      await ReservaService.deleteReserva(reservaId, token);
      toast.success('Reserva eliminada');
      setReservas((prev) => prev.filter((r) => r.id !== reservaId));
    } catch {
      toast.error('Error al eliminar la reserva');
    }
  };

  const handleAprobar = async (reservaId: number) => {
    try {
      await ReservaService.aprobarReserva(reservaId, token);
      toast.success('Reserva aprobada: se generó la venta y se ocupó la habitación');
      setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: 'aprobada' } : r)));
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al aprobar la reserva');
    }
  };

  const handleRechazar = async (reservaId: number) => {
    try {
      await ReservaService.rechazarReserva(reservaId, token);
      toast.success('Reserva rechazada');
      setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: 'cancelada' } : r)));
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al rechazar la reserva');
    }
  };

  const showModal = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<Reserva>(visibles, {
    id: (a, b) => a.id - b.id,
    fecha_creacion: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
    fecha_inicio: (a, b) => dayjs(a.fecha_inicio).diff(dayjs(b.fecha_inicio)),
    total: (a, b) => a.total - b.total,
  });
  const pageItems = paginate(sorted, pagination);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<Reserva>[] = [
    {
      key: 'id',
      header: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      allowsSorting: true,
      width: 80,
      render: (r) => r.id,
    },
    {
      key: 'cliente',
      header: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      render: (r) => `${r.nombre} ${r.apellido}`,
    },
    {
      key: 'fecha_creacion',
      header: <ColumnHeader icon={<Clock size={13} />}>Creada</ColumnHeader>,
      allowsSorting: true,
      render: (r) => <span style={{ color: notion.inkFaint }}>{dateTime(r.created_at)}</span>,
    },
    {
      key: 'fecha_inicio',
      header: <ColumnHeader icon={<Calendar size={13} />}>Entrada</ColumnHeader>,
      allowsSorting: true,
      render: (r) => <span style={{ color: notion.inkMuted }}>{dateTime(r.fecha_inicio)}</span>,
    },
    {
      key: 'fecha_fin',
      header: <ColumnHeader icon={<Calendar size={13} />}>Salida</ColumnHeader>,
      render: (r) => <span style={{ color: notion.inkMuted }}>{dateTime(r.fecha_fin)}</span>,
    },
    {
      key: 'numero_personas',
      header: <ColumnHeader icon={<Users size={13} />}>Huéspedes</ColumnHeader>,
      align: 'center',
      render: (r) => r.numero_personas,
    },
    {
      key: 'total',
      header: <ColumnHeader icon={<Wallet size={13} />}>Total</ColumnHeader>,
      allowsSorting: true,
      render: (r) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {money(r.total, 2)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: <ColumnHeader icon={<Tag size={13} />}>Estado</ColumnHeader>,
      render: (r) => <StatusPill color={ESTADO_COLOR[r.estado]} label={r.estado} />,
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (reserva) => (
        <RowActionsMenu
          actions={[
            ...(['pendiente', 'confirmado'].includes(reserva.estado)
              ? [
                  {
                    key: 'aprobar',
                    label: 'Aprobar',
                    icon: <Check size={14} />,
                    onClick: () => handleAprobar(reserva.id),
                    confirm: {
                      title: '¿Aprobar esta reserva?',
                      description: 'Se generará una venta y la habitación quedará ocupada.',
                      okText: 'Aprobar',
                    },
                  },
                  {
                    key: 'rechazar',
                    label: 'Rechazar',
                    icon: <X size={14} />,
                    danger: true,
                    onClick: () => handleRechazar(reserva.id),
                    confirm: { title: '¿Rechazar esta reserva?', okText: 'Rechazar' },
                  },
                ]
              : []),
            { key: 'detalle', label: 'Ver detalle', icon: <Info size={14} />, onClick: () => showModal(reserva) },
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDelete(reserva.id),
              confirm: { title: '¿Eliminar esta reserva?', okText: 'Sí' },
            },
          ]}
        />
      ),
    },
  ];

  const tabNativas = (
    <>
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
          <SelectItem key="pendiente">Pendiente</SelectItem>
          <SelectItem key="confirmado">Confirmado</SelectItem>
          <SelectItem key="aprobada">Aprobada</SelectItem>
          <SelectItem key="cancelada">Cancelada</SelectItem>
        </Select>
      </div>

      <DataTable<Reserva>
        ariaLabel="Reservas"
        columns={columns}
        rows={pageItems}
        isLoading={isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No existen reservas"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="reservas"
              pagination={pagination}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
      />

      {selectedReserva && (
        <ReservaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReserva(null);
          }}
          reserva={selectedReserva}
        />
      )}
    </>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Reservas"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{visibles.length}</strong> de {reservas.length} reservas
          </>
        }
      />

      <Tabs aria-label="Tipo de reserva">
        <Tab key="nativas" title="Nativas">
          {tabNativas}
        </Tab>
        <Tab key="libres" title="Libres (externas)">
          <ReservasLibresPage token={token} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ReservasPage;
