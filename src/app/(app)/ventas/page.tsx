'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import { Spin, Alert, message, Empty, Table, Button, Select, DatePicker, Input, Popconfirm } from 'antd';
import { useSession } from 'next-auth/react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { EditOutlined, CloseOutlined, DiffOutlined, SearchOutlined } from '@ant-design/icons';
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

const Page = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [ventasHoy, setVentasHoy] = useState<any[]>([]);
    const [ventasAyer, setVentasAyer] = useState<any[]>([]);
    const [ventasUltimos7Dias, setVentasUltimos7Dias] = useState<any[]>([]);
    const [ventasUltimoMes, setVentasUltimoMes] = useState<any[]>([]);
    const [ventasTotales, setVentasTotales] = useState<any[]>([]);
    const [filteredVentas, setFilteredVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string>('todas');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [searchText, setSearchText] = useState<string>(''); // Nuevo estado para el texto de búsqueda

    useEffect(() => {
        if (session?.user?.token?.token) {
            const fetchVentas = async () => {
                try {
                    const ventasData = await VentasService.getAllVentas(session.user.token.token);
                    const hoy = dayjs().startOf('day');
                    const ayer = hoy.subtract(1, 'day');
                    const hace7Dias = hoy.subtract(7, 'day');
                    const hace1Mes = hoy.subtract(1, 'month');

                    const ventasHoy = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(hoy, 'day'));
                    const ventasAyer = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(ayer, 'day'));
                    const ventasUltimos7Dias = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isAfter(hace7Dias) && dayjs(venta.fecha_inicio).isBefore(ayer));
                    const ventasUltimoMes = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isAfter(hace1Mes));

                    ventasHoy.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasAyer.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasUltimos7Dias.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasUltimoMes.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasData.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));

                    setVentasHoy(ventasHoy);
                    setVentasAyer(ventasAyer);
                    setVentasUltimos7Dias(ventasUltimos7Dias);
                    setVentasUltimoMes(ventasUltimoMes);
                    setVentasTotales(ventasData);
                    setFilteredVentas(ventasData); // Inicialmente muestra todas las ventas
                    setLoading(false);
                } catch (error) {
                    setError('Error al obtener las ventas');
                    setLoading(false);
                }
            };
            fetchVentas();
        }
    }, [session]);

    // Función para manejar la búsqueda global
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = ventasTotales.filter((venta) =>
            venta.id.toString().includes(value) ||
            venta.personas[0]?.nombre.toLowerCase().includes(value) ||
            venta.personas[0]?.apellido.toLowerCase().includes(value) ||
            venta.subtotal.toString().includes(value) ||
            venta.total.toString().includes(value)
        );

        setFilteredVentas(filtered);
    };

    const handleDelete = async (ventaId: number) => {
        try {
            if (session?.user?.token?.token) {
                await VentasService.deleteVenta(session.user.token.token, ventaId);
                setVentasHoy(ventasHoy.filter((venta) => venta.id !== ventaId));
                setVentasAyer(ventasAyer.filter((venta) => venta.id !== ventaId));
                setVentasUltimos7Dias(ventasUltimos7Dias.filter((venta) => venta.id !== ventaId));
                setVentasUltimoMes(ventasUltimoMes.filter((venta) => venta.id !== ventaId));
                setVentasTotales(ventasTotales.filter((venta) => venta.id !== ventaId));
                setFilteredVentas(filteredVentas.filter((venta) => venta.id !== ventaId));
            }
        } catch (error) {
            message.error('Error al eliminar la venta');
        }
    };

    const handleEdit = (venta: any) => {
        router.push(`ventas/${venta.id}`);
    };

    const handleFilter = () => {
        let filtered: any[] = [];
        switch (selectedOption) {
            case 'hoy':
                filtered = ventasHoy;
                break;
            case 'ayer':
                filtered = ventasAyer;
                break;
            case '7dias':
                filtered = ventasUltimos7Dias;
                break;
            case 'mes':
                filtered = ventasUltimoMes;
                break;
            case 'todas':
                filtered = ventasTotales;
                break;
            default:
                filtered = ventasTotales;
        }

        if (dateRange) {
            const [startDate, endDate] = dateRange;
            filtered = filtered.filter((venta) =>
                dayjs(venta.fecha_inicio).isBetween(startDate, endDate, null, '[]')
            );
        }

        setFilteredVentas(filtered);
    };

    const handleDateRangeChange: any = (dates: [Dayjs, Dayjs] | null) => {
        setDateRange(dates);
    };

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Detalles de las Ventas</h1>

            <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Select
                        value={selectedOption}
                        onChange={setSelectedOption}
                        style={{ width: 200, marginRight: 10 }}
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
                        style={{ marginRight: 10 }}
                    />
                    <Button onClick={handleFilter} type="primary">Aplicar Filtro</Button>
                </div>
                {/* Búsqueda Global */}
                <Input
                    placeholder="Buscar..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: 300 }}
                />
            </div>

            {filteredVentas.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen ventas" />
                </div>
            ) : (
                <Table
                    dataSource={filteredVentas}
                    scroll={{ x: 1000 }}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            key: 'id',
                        },
                        {
                            title: 'Cliente',
                            dataIndex: 'personas',
                            key: 'cliente',
                            render: (personas: any) => (`${personas[0].nombre} ${personas[0].apellido}`),
                        },
                        {
                            title: 'Fecha de Inicio',
                            dataIndex: 'fecha_inicio',
                            key: 'fecha_inicio',
                            render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
                        },
                        {
                            title: 'Fecha de Fin',
                            dataIndex: 'fecha_fin',
                            key: 'fecha_fin',
                            render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
                        },
                        {
                            title: '# Facturas',
                            dataIndex: 'facturas',
                            key: 'facturas',
                            render: (facturas: any[]) => facturas.length,
                        },
                        {
                            title: 'Subtotal',
                            dataIndex: 'subtotal',
                            key: 'subtotal',
                        },
                        {
                            title: 'Descuento',
                            dataIndex: 'descuento',
                            key: 'descuento',
                        },
                        {
                            title: 'Total',
                            dataIndex: 'total',
                            key: 'total',
                        },
                        {
                            title: 'Acciones',
                            key: 'actions',
                            render: (text: any, venta: any) => (
                                <div className="flex space-x-5">
                                    <EditOutlined className='text-xl' onClick={() => handleEdit(venta)} type="link">Editar</EditOutlined>
                                    <DiffOutlined className='text-xl' onClick={() => router.push(`ventas/facturas/${venta.id}`)} type="link">Ver Facturas</DiffOutlined>
                                    <Popconfirm
                                        title="¿Estás seguro de eliminar esta venta?"
                                        onConfirm={() => handleDelete(venta.id)}
                                        okText="Sí"
                                        cancelText="No"
                                        placement='left'
                                    >
                                        <CloseOutlined className='text-xl' type="link" style={{ color: 'red', cursor: 'pointer' }}>Eliminar</CloseOutlined>
                                    </Popconfirm>
                                </div>
                            ),
                        },
                    ]}
                    rowKey="id"
                />
            )}
        </div>
    );
};

export default Page;
