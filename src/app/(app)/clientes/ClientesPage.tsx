'use client';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import ClientService from '@/services/ClientService';
import ClientModal from '@/components/ClientModal';
import { Spin, Alert, Empty, Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Pencil, Trash2, User, IdCard, Globe, MapPin, Hash, Plus, Clock } from 'lucide-react';
import { Client } from '@/types/types';
import { notion } from '@/lib/theme';
import { dateTime } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { TableToolbar, Period } from '@/components/ui/TableToolbar';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';
import { toast } from '@/lib/toast';

dayjs.extend(isBetween);

interface ClientesPageProps {
  token: string;
}

type ClienteRow = Client & { created_at?: string };

const enPeriodo = (fecha: string | undefined, periodo: Period) => {
  if (!fecha) return true;
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

const ClientesPage: React.FC<ClientesPageProps> = ({ token }) => {
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Period>('todas');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState<Client | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchClientes = async () => {
      try {
        const data = await ClientService.getAllClients(token);
        setClientes(data);
      } catch {
        setError('Error al obtener los clientes');
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [token]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return clientes.filter((c) => {
      if (!enPeriodo(c.created_at, periodo)) return false;
      if (dateRange && c.created_at && !dayjs(c.created_at).isBetween(dateRange[0], dateRange[1], null, '[]')) return false;
      if (!q) return true;
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      return (
        nombreCompleto.includes(q) ||
        c.numero_documento.toLowerCase().includes(q) ||
        c.ciudadania.toLowerCase().includes(q) ||
        c.procedencia.toLowerCase().includes(q)
      );
    });
  }, [clientes, periodo, dateRange, busqueda]);

  const handleDelete = async (id: number) => {
    try {
      await ClientService.deleteClient(id, token);
      toast.success('Cliente eliminado');
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Error al eliminar el cliente');
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setIsModalOpen(true);
  };

  const abrirEditar = (cliente: Client) => {
    setEditando(cliente);
    setIsModalOpen(true);
  };

  const handleGuardado = (cliente: Client) => {
    setClientes((prev) => {
      const yaEsta = prev.some((c) => c.id === cliente.id);
      return yaEsta ? prev.map((c) => (c.id === cliente.id ? cliente : c)) : [cliente, ...prev];
    });
    setIsModalOpen(false);
    setEditando(null);
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const columns: ColumnsType<ClienteRow> = [
    {
      title: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 70,
      render: (id: number) => (
        <span style={{ color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>{id}</span>
      ),
    },
    {
      title: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      key: 'cliente',
      render: (_: any, c: Client) => `${c.nombre} ${c.apellido}`,
    },
    {
      title: <ColumnHeader icon={<IdCard size={13} />}>Documento</ColumnHeader>,
      key: 'documento',
      render: (_: any, c: Client) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
          {c.tipo_documento === 'pasaporte' ? 'Pasaporte' : 'Cédula'} · {c.numero_documento}
        </span>
      ),
    },
    {
      title: <ColumnHeader icon={<Globe size={13} />}>Ciudadanía</ColumnHeader>,
      dataIndex: 'ciudadania',
      key: 'ciudadania',
      render: (v: string) => <span style={{ color: notion.inkMuted }}>{v}</span>,
    },
    {
      title: <ColumnHeader icon={<MapPin size={13} />}>Procedencia</ColumnHeader>,
      dataIndex: 'procedencia',
      key: 'procedencia',
      render: (v: string) => <span style={{ color: notion.inkMuted }}>{v}</span>,
    },
    {
      title: <ColumnHeader icon={<Clock size={13} />}>Registrado</ColumnHeader>,
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
      defaultSortOrder: 'descend',
      render: (text: string | undefined) => <span style={{ color: notion.inkFaint }}>{text ? dateTime(text) : '—'}</span>,
    },
    {
      title: '',
      key: 'acciones',
      align: 'right',
      width: 60,
      render: (_, cliente) => (
        <RowActionsMenu
          actions={[
            { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => abrirEditar(cliente) },
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDelete(cliente.id),
              confirm: {
                title: '¿Eliminar este cliente?',
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
        title="Clientes"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{visibles.length}</strong> de {clientes.length} clientes
          </>
        }
        action={
          <Button type="primary" icon={<Plus size={16} />} onClick={abrirCrear}>
            Agregar cliente
          </Button>
        }
      />

      <TableToolbar
        search={busqueda}
        onSearch={setBusqueda}
        searchPlaceholder="Buscar por nombre, documento, ciudadanía o procedencia"
        period={periodo}
        onPeriodChange={setPeriodo}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {visibles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen clientes" />
        </div>
      ) : (
        <Table<ClienteRow>
          dataSource={visibles}
          columns={columns}
          rowKey="id"
          size="middle"
          sticky
          scroll={{ x: 900 }}
          loading={isPending}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                {total} clientes
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

      <ClientModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditando(null);
        }}
        onSubmit={handleGuardado}
        initial={editando}
        token={token}
      />
    </div>
  );
};

export default ClientesPage;
