'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FacturasService from '@/services/FacturasService';
import { Spin, Alert, message, Empty, Table, Button, Select, DatePicker, Tag, Input, Popconfirm } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { EditOutlined, PrinterOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import FacturaModal from '@/components/FacturaModal';
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface FacturasPageProps {
    token: string;
}

const FacturasPage: React.FC<FacturasPageProps> = ({ token }) => {
    const router = useRouter();
    const [facturas, setFacturas] = useState<any[]>([]);
    const [filteredFacturas, setFilteredFacturas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string>('todas');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<any>(null);
    const [searchText, setSearchText] = useState<string>(''); // Nueva variable de estado para la búsqueda

    useEffect(() => {
        if (token) {
            const fetchFacturas = async () => {
                try {
                    const facturasData = await FacturasService.getAllFacturas(token);
                    facturasData.sort((a: any, b: any) => dayjs(b.fecha_emision).diff(dayjs(a.fecha_emision)));
                    setFacturas(facturasData);
                    setFilteredFacturas(facturasData);
                    setLoading(false);
                } catch (error: any) {
                    setError('Error al obtener las facturas');
                    setLoading(false);
                }
            };
            fetchFacturas();
        }
    }, [token]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = facturas.filter((factura) =>
            factura.nombre.toLowerCase().includes(value) ||
            factura.apellido.toLowerCase().includes(value) ||
            factura.identificacion.toLowerCase().includes(value) ||
            factura.id.toString().includes(value) ||
            factura.subtotal.toString().includes(value) ||
            factura.total.toString().includes(value) ||
            factura.estado.toLowerCase().includes(value) ||
            factura.fecha_emision.toLowerCase().includes(value)
        );

        setFilteredFacturas(filtered);
    };

    const handleEdit = (factura: any) => {
        setSelectedFactura(factura);
        setIsModalOpen(true);
    };

    const handleEmitir = async (facturaId: number) => {
        try {
            if (token) {
                const factura = facturas.find(f => f.id === facturaId);
                if (!factura) {
                    message.error('Factura no encontrada');
                    return;
                }
                const updatedFactura = { ...factura, estado: 'emitido' };
                const response = await FacturasService.updateFactura(token, facturaId, updatedFactura);
                setFacturas(prev =>
                    prev.map(f => (f.id === facturaId ? response : f))
                );
                setFilteredFacturas(prev =>
                    prev.map(f => (f.id === facturaId ? response : f))
                );
                message.success('Factura emitida exitosamente');
            }
        } catch (error: any) {
            console.error('Error emitiendo factura:', error);
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Error al emitir la factura');
            }
        }
    };

    // Función para manejar la anulación de la factura
    const handleAnular = async (facturaId: number) => {
        try {
            if (token) {
                const factura = facturas.find(f => f.id === facturaId);
                if (!factura) {
                    message.error('Factura no encontrada');
                    return;
                }
                const updatedFactura = { ...factura, estado: 'anulado' };
                const response = await FacturasService.updateFactura(token, facturaId, updatedFactura);
                setFacturas(prev =>
                    prev.map(f => (f.id === facturaId ? response : f))
                );
                setFilteredFacturas(prev =>
                    prev.map(f => (f.id === facturaId ? response : f))
                );
                message.success('Factura anulada exitosamente');
            }
        } catch (error: any) {
            console.error('Error al anular factura:', error);
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Error al anular la factura');
            }
        }
    };

    const handleFilter = () => {
        let filtered: any[] = [];
        switch (selectedOption) {
            case 'hoy':
                filtered = facturas.filter((factura: any) => dayjs(factura.fecha_emision).isSame(dayjs(), 'day'));
                break;
            case 'ayer':
                filtered = facturas.filter((factura: any) => dayjs(factura.fecha_emision).isSame(dayjs().subtract(1, 'day'), 'day'));
                break;
            case '7dias':
                filtered = facturas.filter((factura: any) =>
                    dayjs(factura.fecha_emision).isBetween(dayjs().subtract(7, 'day'), dayjs(), null, '[]')
                );
                break;
            case 'mes':
                filtered = facturas.filter((factura: any) =>
                    dayjs(factura.fecha_emision).isAfter(dayjs().subtract(1, 'month'))
                );
                break;
            case 'todas':
            default:
                filtered = facturas;
        }

        if (dateRange) {
            const [startDate, endDate] = dateRange;
            filtered = filtered.filter((factura: any) =>
                dayjs(factura.fecha_emision).isBetween(startDate, endDate, null, '[]')
            );
        }

        setFilteredFacturas(filtered);
    };

    const handleDateRangeChange: any = (dates: [Dayjs, Dayjs] | null) => {
        setDateRange(dates);
    };

    const handleModalOk = async (updatedFactura: any) => {
        try {
            if (token) {
                const response = await FacturasService.updateFactura(token, selectedFactura.id, updatedFactura);
                setFacturas(prev =>
                    prev.map(factura => (factura.id === response.id ? response : factura))
                );
                setFilteredFacturas(prev =>
                    prev.map(factura => (factura.id === response.id ? response : factura))
                );
                message.success('Factura actualizada exitosamente');
                setIsModalOpen(false);
            }
        } catch (error: any) {
            console.error('Error actualizando factura:', error);
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Error al actualizar la factura');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    const columns = [
        {
            title: 'Fecha de Emisión',
            dataIndex: 'fecha_emision',
            key: 'fecha_emision',
            sorter: (a: any, b: any) => dayjs(a.fecha_emision).diff(dayjs(b.fecha_emision)),
            render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Nombres',
            dataIndex: 'nombre',
            key: 'nombre_cliente',
            render: (_: any, record: any) => `${record.nombre} ${record.apellido}`,
        },
        {
            title: 'Identificación',
            dataIndex: 'identificacion',
            key: 'identificacion',
        },
        {
            title: '# Factura',
            dataIndex: 'id',
            key: 'numero_factura',
            sorter: (a: any, b: any) => a.id - b.id,
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            sorter: (a: any, b: any) => a.subtotal - b.subtotal,
            render: (text: number) => `$${text.toFixed(2)}`,
        },
        {
            title: 'Descuento',
            dataIndex: 'descuento',
            key: 'descuento',
            render: (text: number) => `$${text.toFixed(2)}`,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (text: number) => `$${text.toFixed(2)}`,
            sorter: (a: any, b: any) => a.total - b.total,
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            sorter: (a: any, b: any) => a.estado.localeCompare(b.estado),
            render: (text: string) => (
                <Tag color={text === 'emitido' ? 'green' : text === 'anulado' ? 'red' : 'blue'}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (text: any, factura: any) => (
                <div className="flex space-x-2">
                    {factura.estado == 'guardado' && (
                        <div className='space-x-5'>
                            <EditOutlined className='text-blue-500 text-lg cursor-pointer' onClick={() => handleEdit(factura)} />
                            <Button type="link" onClick={() => handleEmitir(factura.id)} icon={<PrinterOutlined />} style={{ padding: 0, color: 'green' }}>
                                Emitir
                            </Button>
                        </div>
                    )}
                    {factura.estado === 'emitido' && (
                        <Popconfirm
                            title="¿Estás seguro de anular esta factura?"
                            okText="Sí"
                            cancelText="No"
                            onConfirm={() => handleAnular(factura.id)}
                        >
                            <Button type="link" icon={<CloseOutlined />} style={{ color: 'red' }}>
                                Anular
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Lista de Facturas</h1>
            <div className='mb-4 flex flex-col lg:flex-row w-full space-x-0 lg:space-x-10 space-y-5 lg:space-y-0'>
                <div className="flex flex-col sm:flex-row sm:items-center w-full space-x-0 sm:space-x-3 space-y-3 sm:space-y-0">
                    <Select
                        value={selectedOption}
                        onChange={setSelectedOption}
                    >
                        <Option value="hoy">Hoy</Option>
                        <Option value="ayer">Ayer</Option>
                        <Option value="7dias">Últimos 7 Días</Option>
                        <Option value="mes">Último Mes</Option>
                        <Option value="todas">Todas</Option>
                    </Select>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                    />
                    <Button onClick={handleFilter} type="primary">Aplicar Filtro</Button>
                </div>
                <div className='w-full'>
                    <Input
                        placeholder="Buscar..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* Tabla de Facturas */}
            {filteredFacturas.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen facturas" />
                </div>
            ) : (
                <Table
                    dataSource={filteredFacturas}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            )}

            {/* Modal para Editar Factura */}
            {selectedFactura && (
                <FacturaModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={handleModalOk}
                    factura={selectedFactura}
                    edit={true}
                />
            )}
        </div>
    );
};

export default FacturasPage;
