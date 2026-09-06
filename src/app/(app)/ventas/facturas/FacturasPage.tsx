'use client';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import FacturasService from '@/services/FacturasService';
import { Spin, Alert, message, Empty, Table, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
import { TableToolbar, Period } from '@/components/ui/TableToolbar';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';

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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
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
  }, [facturas, periodo, dateRange, busqueda]);

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
      if (!factura) return message.error('Factura no encontrada');
      const actualizada = await FacturasService.updateFactura(token, facturaId, { ...factura, estado: 'emitido' });
      actualizarLocal(actualizada);
      message.success('Factura emitida');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? 'Error al emitir la factura');
    }
  };

  const handleAnular = async (facturaId: number) => {
    try {
      const factura = facturas.find((f) => f.id === facturaId);
      if (!factura) return message.error('Factura no encontrada');
      const actualizada = await FacturasService.updateFactura(token, facturaId, { ...factura, estado: 'anulado' });
      actualizarLocal(actualizada);
      message.success('Factura anulada');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? 'Error al anular la factura');
    }
  };

  const handleModalOk = async (updatedFactura: any) => {
    if (!selectedFactura) return;
    try {
      const actualizada = await FacturasService.updateFactura(token, selectedFactura.id, updatedFactura);
      actualizarLocal(actualizada);
      message.success('Factura actualizada');
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? 'Error al actualizar la factura');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  const columns: ColumnsType<Factura> = [
    {
      title: <ColumnHeader icon={<Calendar size={13} />}>Fecha de emisión</ColumnHeader>,
      dataIndex: 'fecha_emision',
      key: 'fecha_emision',
      sorter: (a, b) => dayjs(a.fecha_emision).diff(dayjs(b.fecha_emision)),
      defaultSortOrder: 'descend',
      render: (text: string) => <span style={{ color: notion.inkMuted }}>{shortDate(text)}</span>,
    },
    {
      title: <ColumnHeader icon={<User size={13} />}>Nombres</ColumnHeader>,
      key: 'nombre_cliente',
      render: (_: any, f: Factura) => `${f.nombre} ${f.apellido}`,
    },
    {
      title: <ColumnHeader icon={<IdCard size={13} />}>Identificación</ColumnHeader>,
      dataIndex: 'identificacion',
      key: 'identificacion',
      render: (id: string) => <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{id}</span>,
    },
    {
      title: <ColumnHeader icon={<Hash size={13} />}># Factura</ColumnHeader>,
      dataIndex: 'numero_factura',
      key: 'numero_factura',
      sorter: (a, b) => a.id - b.id,
      render: (numero: string, f: Factura) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{numero ?? `#${f.id}`}</span>
      ),
    },
    {
      title: <ColumnHeader icon={<DollarSign size={13} />}>Subtotal</ColumnHeader>,
      dataIndex: 'subtotal',
      key: 'subtotal',
      sorter: (a, b) => a.subtotal - b.subtotal,
      render: (n: number) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{money(n, 2)}</span>,
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
      title: <ColumnHeader icon={<Percent size={13} />}>IVA</ColumnHeader>,
      dataIndex: 'impuesto',
      key: 'impuesto',
      render: (n: number) => (
        <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>{money(n ?? 0, 2)}</span>
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
        { text: 'Guardado', value: 'guardado' },
        { text: 'Emitido', value: 'emitido' },
        { text: 'Anulado', value: 'anulado' },
      ],
      onFilter: (value, record) => record.estado === value,
      render: (estado: Estado) => <StatusDot color={facturaEstadoColor[estado]} label={facturaEstadoLabel[estado]} />,
    },
    {
      title: '',
      key: 'acciones',
      align: 'right',
      width: 60,
      render: (_, factura) => {
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

      {visibles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Empty description="No existen facturas" />
        </div>
      ) : (
        <Table<Factura>
          dataSource={visibles}
          columns={columns}
          rowKey="id"
          size="middle"
          sticky
          loading={isPending}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                {total} facturas
                <PageSizeSelect
                  value={pagination.pageSize}
                  onChange={(pageSize) => startTransition(() => setPagination({ current: 1, pageSize }))}
                />
              </span>
            ),
            onChange: (current, pageSize) => startTransition(() => setPagination({ current, pageSize })),
          }}
          scroll={{ x: 1000 }}
        />
      )}

      {selectedFactura && (
        <FacturaModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleModalOk}
          factura={selectedFactura}
          edit={true}
        />
      )}

      <Modal
        open={!!detalleFactura}
        onCancel={() => setDetalleFactura(null)}
        footer={null}
        width={380}
        destroyOnClose
        title={null}
      >
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
      </Modal>
    </div>
  );
};

export default FacturasPage;
