'use client'
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import ReservaService from '@/services/ReservasService';
import ReservaModal from '@/components/ReservaModal';
import { Spin, Alert, message, Empty, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';

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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
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
  }, [reservas, periodo, dateRange, busqueda]);

  const handleDelete = async (reservaId: number) => {
    try {
      await ReservaService.deleteReserva(reservaId, token);
      message.success('Reserva eliminada');
      setReservas((prev) => prev.filter((r) => r.id !== reservaId));
    } catch {
      message.error('Error al eliminar la reserva');
    }
  };

  const handleAprobar = async (reservaId: number) => {
    try {
      await ReservaService.aprobarReserva(reservaId, token);
      message.success('Reserva aprobada: se generó la venta y se ocupó la habitación');
      setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: 'aprobada' } : r)));
    } catch (err: any) {
      message.error(err?.message ?? 'Error al aprobar la reserva');
    }
  };

  const handleRechazar = async (reservaId: number) => {
    try {
      await ReservaService.rechazarReserva(reservaId, token);
      message.success('Reserva rechazada');
      setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: 'cancelada' } : r)));
    } catch (err: any) {
      message.error(err?.message ?? 'Error al rechazar la reserva');
    }
  };

  const showModal = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setIsModalOpen(true);
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const columns: ColumnsType<Reserva> = [
    {
      title: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 80,
    },
    {
      title: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      key: 'cliente',
      render: (_: any, r: Reserva) => `${r.nombre} ${r.apellido}`,
    },
    {
      title: <ColumnHeader icon={<Clock size={13} />}>Creada</ColumnHeader>,
      dataIndex: 'created_at',
      key: 'fecha_creacion',
      sorter: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
      render: (text: string) => <span style={{ color: notion.inkFaint }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<Calendar size={13} />}>Entrada</ColumnHeader>,
      dataIndex: 'fecha_inicio',
      key: 'fecha_inicio',
      sorter: (a, b) => dayjs(a.fecha_inicio).diff(dayjs(b.fecha_inicio)),
      render: (text: string) => <span style={{ color: notion.inkMuted }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<Calendar size={13} />}>Salida</ColumnHeader>,
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
      render: (text: string) => <span style={{ color: notion.inkMuted }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<Users size={13} />}>Huéspedes</ColumnHeader>,
      dataIndex: 'numero_personas',
      key: 'numero_personas',
      align: 'center',
    },
    {
      title: <ColumnHeader icon={<Wallet size={13} />}>Total</ColumnHeader>,
      dataIndex: 'total',
      key: 'total',
      sorter: (a, b) => a.total - b.total,
      render: (n: number) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {money(n, 2)}
        </span>
      ),
    },
    {
      title: <ColumnHeader icon={<Tag size={13} />}>Estado</ColumnHeader>,
      dataIndex: 'estado',
      key: 'estado',
      filters: [
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'Confirmado', value: 'confirmado' },
        { text: 'Aprobada', value: 'aprobada' },
        { text: 'Cancelada', value: 'cancelada' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: Estado) => <StatusPill color={ESTADO_COLOR[estado]} label={estado} />,
    },
    {
      title: '',
      key: 'acciones',
      align: 'right',
      width: 60,
      render: (_, reserva) => (
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

      <TableToolbar
        search={busqueda}
        onSearch={setBusqueda}
        searchPlaceholder="Buscar por cliente, ID o monto"
        period={periodo}
        onPeriodChange={setPeriodo}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {visibles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen reservas" />
        </div>
      ) : (
        <Table<Reserva>
          dataSource={visibles}
          columns={columns}
          rowKey="id"
          size="middle"
          sticky
          scroll={{ x: 1100 }}
          loading={isPending}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                {total} reservas
                <PageSizeSelect
                  value={pagination.pageSize}
                  onChange={(pageSize) => startTransition(() => setPagination({ current: 1, pageSize }))}
                />
              </span>
            ),
            onChange: (current, pageSize) => startTransition(() => setPagination({ current, pageSize })),
          }}
        />
      )}

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
    </div>
  );
};

export default ReservasPage;
