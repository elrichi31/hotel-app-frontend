'use client'
import React, { useEffect, useMemo, useState } from 'react';
import ReservasLibresService, { ReservaLibre, EstadoReservaLibre } from '@/services/ReservasLibresService';
import { Spinner, Input, Select, SelectItem } from '@heroui/react';
import dayjs from 'dayjs';
import { Trash2, User, Calendar, Users, Wallet, Tag, BedDouble, Check, X, Mail, Phone, Search } from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { money, shortDate } from '@/lib/format';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { StatusPill } from '@/components/ui/StatusPill';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { ActiveFilters, ActiveFilter } from '@/components/ui/ActiveFilters';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
import { toast } from '@/lib/toast';

interface ReservasLibresPageProps {
  token: string;
}

const ESTADO_COLOR: Record<EstadoReservaLibre, string> = {
  pendiente_revision: viz.neutral,
  validada: viz.positive,
  descartada: viz.negative,
};

const ESTADO_LABEL: Record<EstadoReservaLibre, string> = {
  pendiente_revision: 'Pendiente',
  validada: 'Validada',
  descartada: 'Descartada',
};

// Ícono de WhatsApp (no hay uno de marca en lucide-react, se usa un SVG inline)
const WhatsAppIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm5.8 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.55-1.17-2.97 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.17.01.41-.07.64.48.24.57.81 1.98.88 2.12.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
  </svg>
);

/** Convierte el teléfono libre de una reserva libre a un link `wa.me`. Asume Ecuador (+593)
 * cuando llega en formato local de 10 dígitos empezando en 0 (como '0999999999'); si ya viene
 * con otro formato/código de país, se usa tal cual (sin espacios ni símbolos). */
function whatsappLink(reserva: ReservaLibre): string | null {
  if (!reserva.telefono) return null
  const digitos = reserva.telefono.replace(/\D/g, '')
  if (!digitos) return null
  const numero = digitos.length === 10 && digitos.startsWith('0') ? `593${digitos.slice(1)}` : digitos
  const cliente = `${reserva.nombre} ${reserva.apellido ?? ''}`.trim()
  const mensaje = `Hola ${cliente}, te contactamos del hotel por tu reserva de "${reserva.habitacion_descripcion}" (${reserva.origen}) del ${shortDate(reserva.fecha_inicio)} al ${shortDate(reserva.fecha_fin)}.`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

const ReservasLibresPage: React.FC<ReservasLibresPageProps> = ({ token }) => {
  const [reservas, setReservas] = useState<ReservaLibre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });

  useEffect(() => {
    if (!token) return;
    ReservasLibresService.getAll(token)
      .then(setReservas)
      .catch(() => setError('Error al obtener las reservas libres'))
      .finally(() => setLoading(false));
  }, [token]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reservas.filter((r) => {
      if (filtroEstado !== 'todos' && r.estado !== filtroEstado) return false;
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        (r.apellido ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q) ||
        (r.telefono ?? '').toLowerCase().includes(q) ||
        r.origen.toLowerCase().includes(q) ||
        r.habitacion_descripcion.toLowerCase().includes(q)
      );
    });
  }, [reservas, busqueda, filtroEstado]);

  const handleValidar = async (id: number) => {
    try {
      await ReservasLibresService.validar(id, token);
      toast.success('Reserva libre validada');
      setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado: 'validada' } : r)));
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al validar');
    }
  };

  const handleDescartar = async (id: number) => {
    try {
      await ReservasLibresService.descartar(id, token);
      toast.success('Reserva libre descartada');
      setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado: 'descartada' } : r)));
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al descartar');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ReservasLibresService.delete(id, token);
      toast.success('Reserva libre eliminada');
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Error al eliminar la reserva libre');
    }
  };

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<ReservaLibre>(visibles, {
    estadia: (a, b) => dayjs(a.fecha_inicio).diff(dayjs(b.fecha_inicio)),
  });
  const pageItems = paginate(sorted, pagination);
  const filterChips: ActiveFilter[] = [
    ...(busqueda.trim() ? [{ key: 'search', label: `“${busqueda.trim()}”`, onClear: () => setBusqueda('') }] : []),
    ...(filtroEstado !== 'todos'
      ? [{ key: 'estado', label: ESTADO_LABEL[filtroEstado as EstadoReservaLibre] ?? filtroEstado, onClear: () => setFiltroEstado('todos') }]
      : []),
  ];

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<ReservaLibre>[] = [
    {
      key: 'cliente',
      header: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
      width: 220,
      render: (r) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: notion.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {`${r.nombre} ${r.apellido ?? ''}`.trim()}
          </div>
          {r.email && (
            <div
              title={r.email}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: notion.inkFaint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <Mail size={11} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</span>
            </div>
          )}
          {r.telefono && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: notion.inkFaint, marginTop: 2 }}>
              <Phone size={11} style={{ flexShrink: 0 }} /> {r.telefono}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'origen',
      header: <ColumnHeader icon={<BedDouble size={13} />}>Origen / Habitación</ColumnHeader>,
      width: 200,
      render: (r) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ color: notion.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.origen}</div>
          <div
            title={r.habitacion_descripcion}
            style={{ fontSize: 12, color: notion.inkFaint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {r.habitacion_descripcion}
          </div>
        </div>
      ),
    },
    {
      key: 'estadia',
      header: <ColumnHeader icon={<Calendar size={13} />}>Estadía</ColumnHeader>,
      width: 190,
      allowsSorting: true,
      render: (r) => {
        const noches = dayjs(r.fecha_fin).diff(dayjs(r.fecha_inicio), 'day');
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ color: notion.inkMuted }}>
              {shortDate(r.fecha_inicio)} → {shortDate(r.fecha_fin)}
            </div>
            <div style={{ fontSize: 12, color: notion.inkFaint, marginTop: 2 }}>
              {noches} {noches === 1 ? 'noche' : 'noches'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'numero_personas',
      header: <ColumnHeader icon={<Users size={13} />}>Huéspedes</ColumnHeader>,
      align: 'center',
      width: 100,
      render: (r) => r.numero_personas,
    },
    {
      key: 'total',
      header: <ColumnHeader icon={<Wallet size={13} />}>Total</ColumnHeader>,
      width: 110,
      render: (r) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {r.total != null ? money(r.total, 2) : '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: <ColumnHeader icon={<Tag size={13} />}>Estado</ColumnHeader>,
      width: 150,
      render: (r) => <StatusPill color={ESTADO_COLOR[r.estado]} label={ESTADO_LABEL[r.estado]} />,
    },
    {
      key: 'whatsapp',
      header: <ColumnHeader icon={<WhatsAppIcon size={13} />}>WhatsApp</ColumnHeader>,
      align: 'center',
      width: 90,
      render: (r) => {
        const link = whatsappLink(r);
        if (!link) return <span style={{ color: notion.inkFaint }}>—</span>;
        return (
          <a href={link} target="_blank" rel="noopener noreferrer" title="Contactar por WhatsApp" style={{ display: 'inline-flex' }}>
            <WhatsAppIcon size={18} />
          </a>
        );
      },
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (reserva) => (
        <RowActionsMenu
          actions={[
            ...(reserva.estado === 'pendiente_revision'
              ? [
                  {
                    key: 'validar',
                    label: 'Validar',
                    icon: <Check size={14} />,
                    onClick: () => handleValidar(reserva.id),
                    confirm: {
                      title: '¿Validar esta reserva libre?',
                      description: 'Solo marca que ya la revisaste; no ocupa ninguna habitación ni genera una venta.',
                      okText: 'Validar',
                    },
                  },
                  {
                    key: 'descartar',
                    label: 'Descartar',
                    icon: <X size={14} />,
                    danger: true,
                    onClick: () => handleDescartar(reserva.id),
                    confirm: { title: '¿Descartar esta reserva libre?', okText: 'Descartar' },
                  },
                ]
              : []),
            {
              key: 'eliminar',
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDelete(reserva.id),
              confirm: { title: '¿Eliminar esta reserva libre?', okText: 'Sí' },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          isClearable
          startContent={<Search size={14} color={notion.inkFaint} />}
          placeholder="Buscar por cliente, correo, teléfono, origen o habitación"
          value={busqueda}
          onValueChange={setBusqueda}
          className="max-w-xs"
        />
        <Select
          aria-label="Estado"
          placeholder="Estado"
          selectedKeys={[filtroEstado]}
          onSelectionChange={(keys) => setFiltroEstado(String(Array.from(keys as Set<React.Key>)[0] ?? 'todos'))}
          className="w-48"
          disallowEmptySelection
        >
          <SelectItem key="todos">Todos los estados</SelectItem>
          <SelectItem key="pendiente_revision">Pendiente</SelectItem>
          <SelectItem key="validada">Validada</SelectItem>
          <SelectItem key="descartada">Descartada</SelectItem>
        </Select>
      </div>

      <ActiveFilters filters={filterChips} />

      <DataTable<ReservaLibre>
        ariaLabel="Reservas libres"
        columns={columns}
        rows={pageItems}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        emptyContent="No hay reservas libres registradas"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="reservas libres"
              pagination={pagination}
              onChange={setPagination}
            />
          ) : null
        }
      />
    </div>
  );
};

export default ReservasLibresPage;
