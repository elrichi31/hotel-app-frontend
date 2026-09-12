// components/VentasPage.tsx
"use client"
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import CheckOutModal from '@/components/CheckOutModal';
import { Spin, Alert, Empty, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
import { TableToolbar, Period } from '@/components/ui/TableToolbar';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
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
  }, [ventas, periodo, dateRange, busqueda]);

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

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const columns: ColumnsType<Venta> = [
    {
      title: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 80,
      render: (id: number) => (
        <span style={{ color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>{id}</span>
      ),
    },
    {
      title: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      dataIndex: 'personas',
      key: 'cliente',
      render: (personas: Venta['personas']) =>
        personas[0] ? `${personas[0].nombre} ${personas[0].apellido}` : '—',
    },
    {
      title: <ColumnHeader icon={<Calendar size={13} />}>Fecha de inicio</ColumnHeader>,
      dataIndex: 'fecha_inicio',
      key: 'fecha_inicio',
      sorter: (a, b) => dayjs(a.fecha_inicio).diff(dayjs(b.fecha_inicio)),
      render: (text: string) => <span style={{ color: notion.inkMuted }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<Calendar size={13} />}>Fecha de fin</ColumnHeader>,
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
      render: (text: string) => <span style={{ color: notion.inkMuted }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<Clock size={13} />}>Creada</ColumnHeader>,
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
      defaultSortOrder: 'descend',
      render: (text: string) => <span style={{ color: notion.inkFaint }}>{dateTime(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<UserCheck size={13} />}>Registrada por</ColumnHeader>,
      dataIndex: 'usuario',
      key: 'usuario',
      render: (usuario: Venta['usuario']) => (
        <span style={{ color: notion.inkMuted }}>
          {usuario ? `${usuario.first_name} ${usuario.last_name}` : '—'}
        </span>
      ),
    },
    {
      title: <ColumnHeader icon={<FileText size={13} />}># Facturas</ColumnHeader>,
      dataIndex: 'facturas',
      key: 'facturas',
      align: 'center',
      render: (facturas: unknown[]) => facturas.length,
    },
    {
      title: <ColumnHeader icon={<DollarSign size={13} />}>Subtotal</ColumnHeader>,
      dataIndex: 'subtotal',
      key: 'subtotal',
      sorter: (a, b) => a.subtotal - b.subtotal,
      render: (n: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(n, 2)}</span>
      ),
    },
    {
      title: <ColumnHeader icon={<Percent size={13} />}>Descuento</ColumnHeader>,
      dataIndex: 'descuento',
      key: 'descuento',
      render: (n: number) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{money(n, 2)}</span>
      ),
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
        { text: 'Reservado', value: 'reservado' },
        { text: 'Check-in', value: 'check_in' },
        { text: 'Check-out', value: 'check_out' },
        { text: 'Cancelada', value: 'cancelada' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: EstadoVenta) => <StatusPill color={ESTADO_COLOR[estado]} label={ESTADO_LABEL[estado]} />,
    },
    {
      title: '',
      key: 'acciones',
      align: 'right',
      width: 60,
      render: (_, venta) => (
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

      {visibles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen ventas" />
        </div>
      ) : (
        <Table<Venta>
          dataSource={visibles}
          columns={columns}
          rowKey="id"
          size="middle"
          sticky
          scroll={{ x: 1300 }}
          loading={isPending}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                {total} ventas
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
