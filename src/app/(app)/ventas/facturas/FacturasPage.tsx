'use client';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import FacturasService from '@/services/FacturasService';
import { Spinner, Modal, ModalContent, ModalBody, Select, SelectItem } from '@heroui/react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  Pencil,
  Printer,
  FileDown,
  Info,
  X,
  User,
  IdCard,
  Calendar,
  DollarSign,
  Percent,
  Wallet,
  Tag,
  Hash,
} from 'lucide-react';
import FacturaModal from '@/components/FacturaModal';
import CardFactura from '@/components/FacturaCard';
import { notion, viz } from '@/lib/theme';
import { facturaEstadoColor, facturaEstadoLabel, EstadoFactura } from '@/lib/estados';
import { money, shortDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu, RowAction } from '@/components/ui/RowActionsMenu';
import { StatusDot } from '@/components/ui/StatusDot';
import { TableToolbar, Period, useToolbarFilterChips } from '@/components/ui/TableToolbar';
import { ActiveFilters, ActiveFilter } from '@/components/ui/ActiveFilters';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { TablePagination, paginate, PaginationState } from '@/components/ui/TablePagination';
import { useSortedRows } from '@/lib/useSortedRows';
import { toast } from '@/lib/toast';

dayjs.extend(isBetween);

interface FacturasPageProps {
  token: string;
}

type Estado = EstadoFactura;
type Factura = {
  id: number;
  numero_factura: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  fecha_emision: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  estado: Estado;
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
      return d.isBetween(hoy.subtract(7, 'day'), hoy, 'day', '[]');
    case 'mes':
      return d.isAfter(hoy.subtract(1, 'month'));
    default:
      return true;
  }
};

const FacturasPage: React.FC<FacturasPageProps> = ({ token }) => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Period>('todas');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [detalleFactura, setDetalleFactura] = useState<any | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pagination, setPagination] = useState<PaginationState>({ current: 1, pageSize: 10 });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) return;
    const fetchFacturas = async () => {
      try {
        const data = await FacturasService.getAllFacturas(token);
        data.sort((a: Factura, b: Factura) => dayjs(b.fecha_emision).diff(dayjs(a.fecha_emision)));
        setFacturas(data);
      } catch {
        setError('Error al obtener las facturas');
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, [token]);

  // Periodo, rango de fechas y búsqueda se combinan en un solo filtro.
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return facturas.filter((f) => {
      if (filtroEstado !== 'todos' && f.estado !== filtroEstado) return false;
      if (!enPeriodo(f.fecha_emision, periodo)) return false;
      if (dateRange && !dayjs(f.fecha_emision).isBetween(dateRange[0], dateRange[1], null, '[]')) return false;
      if (!q) return true;
      return (
        f.nombre.toLowerCase().includes(q) ||
        f.apellido.toLowerCase().includes(q) ||
        f.identificacion.toLowerCase().includes(q) ||
        String(f.id).includes(q) ||
        String(f.total).includes(q) ||
        f.estado.toLowerCase().includes(q)
      );
    });
  }, [facturas, periodo, dateRange, busqueda, filtroEstado]);

  const actualizarLocal = (actualizada: Factura) => {
    setFacturas((prev) => prev.map((f) => (f.id === actualizada.id ? actualizada : f)));
  };

  const handleEdit = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsModalOpen(true);
  };

  const handleVerDetalle = (factura: Factura) => {
    setDetalleFactura(factura);
  };

  const handleEmitir = async (facturaId: number) => {
    try {
      const factura = facturas.find((f) => f.id === facturaId);
      if (!factura) return toast.error('Factura no encontrada');
      const actualizada = await FacturasService.updateFactura(token, facturaId, { ...factura, estado: 'emitido' });
      actualizarLocal(actualizada);
      toast.success('Factura emitida');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al emitir la factura');
    }
  };

  const handleAnular = async (facturaId: number) => {
    try {
      const factura = facturas.find((f) => f.id === facturaId);
      if (!factura) return toast.error('Factura no encontrada');
      const actualizada = await FacturasService.updateFactura(token, facturaId, { ...factura, estado: 'anulado' });
      actualizarLocal(actualizada);
      toast.success('Factura anulada');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al anular la factura');
    }
  };

  const handleModalOk = async (updatedFactura: any) => {
    if (!selectedFactura) return;
    try {
      const actualizada = await FacturasService.updateFactura(token, selectedFactura.id, updatedFactura);
      actualizarLocal(actualizada);
      toast.success('Factura actualizada');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al actualizar la factura');
    }
  };

  const { sorted, sortDescriptor, setSortDescriptor } = useSortedRows<Factura>(
    visibles,
    {
      fecha_emision: (a, b) => dayjs(a.fecha_emision).diff(dayjs(b.fecha_emision)),
      numero_factura: (a, b) => a.id - b.id,
      subtotal: (a, b) => a.subtotal - b.subtotal,
      total: (a, b) => a.total - b.total,
    },
    { column: 'fecha_emision', direction: 'descending' }
  );
  const pageItems = paginate(sorted, pagination);
  const filterChips: ActiveFilter[] = [
    ...useToolbarFilterChips({ search: busqueda, onSearch: setBusqueda, period: periodo, onPeriodChange: setPeriodo, dateRange, onDateRangeChange: setDateRange }),
    ...(filtroEstado !== 'todos'
      ? [{ key: 'estado', label: facturaEstadoLabel[filtroEstado as EstadoFactura] ?? filtroEstado, onClear: () => setFiltroEstado('todos') }]
      : []),
  ];

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  if (error) return <div style={{ color: notion.red }}>{error}</div>;

  const columns: DataTableColumn<Factura>[] = [
    {
      key: 'fecha_emision',
      header: <ColumnHeader icon={<Calendar size={13} />}>Fecha de emisión</ColumnHeader>,
      allowsSorting: true,
      render: (f) => <span style={{ color: notion.inkMuted }}>{shortDate(f.fecha_emision)}</span>,
    },
    {
      key: 'nombre_cliente',
      header: <ColumnHeader icon={<User size={13} />}>Nombres</ColumnHeader>,
      render: (f) => `${f.nombre} ${f.apellido}`,
    },
    {
      key: 'identificacion',
      header: <ColumnHeader icon={<IdCard size={13} />}>Identificación</ColumnHeader>,
      render: (f) => <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{f.identificacion}</span>,
    },
    {
      key: 'numero_factura',
      header: <ColumnHeader icon={<Hash size={13} />}># Factura</ColumnHeader>,
      allowsSorting: true,
      render: (f) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{f.numero_factura ?? `#${f.id}`}</span>,
    },
    {
      key: 'subtotal',
      header: <ColumnHeader icon={<DollarSign size={13} />}>Subtotal</ColumnHeader>,
      allowsSorting: true,
      render: (f) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(f.subtotal, 2)}</span>,
    },
    {
      key: 'descuento',
      header: <ColumnHeader icon={<Percent size={13} />}>Descuento</ColumnHeader>,
      render: (f) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{money(f.descuento, 2)}</span>
      ),
    },
    {
      key: 'impuesto',
      header: <ColumnHeader icon={<Percent size={13} />}>IVA</ColumnHeader>,
      render: (f) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{money(f.impuesto ?? 0, 2)}</span>
      ),
    },
    {
      key: 'total',
      header: <ColumnHeader icon={<Wallet size={13} />}>Total</ColumnHeader>,
      allowsSorting: true,
      render: (f) => (
        <span style={{ fontWeight: 500, color: notion.ink, fontVariantNumeric: 'tabular-nums' }}>
          {money(f.total, 2)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: <ColumnHeader icon={<Tag size={13} />}>Estado</ColumnHeader>,
      render: (f) => <StatusDot color={facturaEstadoColor[f.estado]} label={facturaEstadoLabel[f.estado]} />,
    },
    {
      key: 'acciones',
      header: '',
      align: 'end',
      width: 60,
      render: (factura) => {
        const acciones: RowAction[] = [
          { key: 'detalle', label: 'Ver detalle', icon: <Info size={14} />, onClick: () => handleVerDetalle(factura) },
        ];
        if (factura.estado === 'guardado') {
          acciones.push(
            { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => handleEdit(factura) },
            { key: 'emitir', label: 'Emitir', icon: <Printer size={14} />, onClick: () => handleEmitir(factura.id) }
          );
        }
        if (factura.estado === 'emitido') {
          acciones.push({
            key: 'anular',
            label: 'Anular',
            icon: <X size={14} />,
            danger: true,
            onClick: () => handleAnular(factura.id),
            confirm: { title: '¿Anular esta factura?', okText: 'Sí' },
          });
        }
        acciones.push({
          key: 'imprimir',
          label: 'Imprimir',
          icon: <FileDown size={14} />,
          onClick: () => window.open(`/ventas/facturas/imprimir/${factura.id}`, '_blank'),
        });
        return <RowActionsMenu actions={acciones} />;
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Facturas"
        subtitle={
          <>
            <strong style={{ color: notion.ink }}>{visibles.length}</strong> de {facturas.length} facturas
          </>
        }
      />

      <TableToolbar
        search={busqueda}
        onSearch={setBusqueda}
        searchPlaceholder="Buscar por cliente, identificación o estado"
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
          <SelectItem key="guardado">Guardado</SelectItem>
          <SelectItem key="emitido">Emitido</SelectItem>
          <SelectItem key="anulado">Anulado</SelectItem>
        </Select>
      </div>

      <ActiveFilters filters={filterChips} />

      <DataTable<Factura>
        ariaLabel="Facturas"
        columns={columns}
        rows={pageItems}
        isLoading={isPending}
        sortDescriptor={sortDescriptor}
        onSortChange={(d) => startTransition(() => setSortDescriptor(d))}
        emptyContent="No existen facturas"
        bottomContent={
          visibles.length > 0 ? (
            <TablePagination
              totalItems={visibles.length}
              itemLabel="facturas"
              pagination={pagination}
              onChange={(next) => startTransition(() => setPagination(next))}
            />
          ) : null
        }
      />

      {selectedFactura && (
        <FacturaModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleModalOk}
          factura={selectedFactura}
          edit={true}
        />
      )}

      <Modal isOpen={!!detalleFactura} onOpenChange={(open) => !open && setDetalleFactura(null)} size="sm">
        <ModalContent>
          <ModalBody className="py-6">
            {detalleFactura && (
              <CardFactura
                factura={detalleFactura}
                token={token}
                onUpdate={(actualizada) => {
                  actualizarLocal(actualizada);
                  setDetalleFactura(actualizada);
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FacturasPage;
