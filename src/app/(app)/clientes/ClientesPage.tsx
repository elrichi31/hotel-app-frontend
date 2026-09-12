'use client';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import ClientService from '@/services/ClientService';
import ClientModal from '@/components/ClientModal';
import { Spinner, Button } from '@heroui/react';
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
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
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
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });
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

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<ClienteRow>(
    visibles,
    {
      id: (a, b) => a.id - b.id,
      created_at: (a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)),
    },
    { column: 'created_at', direction: 'descending' }
  );
  const pageItems = paginate(sorted, pagination);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<ClienteRow>[] = [
    {
      key: 'id',
      header: <ColumnHeader icon={<Hash size={13} />}>ID</ColumnHeader>,
      allowsSorting: true,
      width: 70,
      render: (c) => <span style={{ color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>{c.id}</span>,
    },
    {
      key: 'cliente',
      header: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      render: (c) => `${c.nombre} ${c.apellido}`,
    },
    {
      key: 'documento',
      header: <ColumnHeader icon={<IdCard size={13} />}>Documento</ColumnHeader>,
      render: (c) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
          {c.tipo_documento === 'pasaporte' ? 'Pasaporte' : 'Cédula'} · {c.numero_documento}
        </span>
      ),
    },
    {
      key: 'ciudadania',
      header: <ColumnHeader icon={<Globe size={13} />}>Ciudadanía</ColumnHeader>,
      render: (c) => <span style={{ color: notion.inkMuted }}>{c.ciudadania}</span>,
    },
    {
      key: 'procedencia',
      header: <ColumnHeader icon={<MapPin size={13} />}>Procedencia</ColumnHeader>,
      render: (c) => <span style={{ color: notion.inkMuted }}>{c.procedencia}</span>,
    },
    {
      key: 'created_at',
      header: <ColumnHeader icon={<Clock size={13} />}>Registrado</ColumnHeader>,
      allowsSorting: true,
      render: (c) => <span style={{ color: notion.inkFaint }}>{c.created_at ? dateTime(c.created_at) : '—'}</span>,
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (cliente) => (
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
          <Button color="primary" startContent={<Plus size={16} />} onPress={abrirCrear}>
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

      <DataTable<ClienteRow>
        ariaLabel="Clientes"
        columns={columns}
        rows={pageItems}
        isLoading={isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No existen clientes"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="clientes"
              pagination={pagination}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
      />

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
