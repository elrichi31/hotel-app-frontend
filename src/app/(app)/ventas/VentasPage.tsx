// components/VentasPage.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import { Spin, Alert, message, Empty, Table, Button, Select, DatePicker, Input, Popconfirm } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { EditOutlined, CloseOutlined, DiffOutlined, SearchOutlined } from '@ant-design/icons';

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface VentasPageProps {
    token: string;
}

const VentasPage: React.FC<VentasPageProps> = ({ token }) => {
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
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const ventasData = await VentasService.getAllVentas(token);
                const hoy = dayjs().startOf('day');
                const ayer = hoy.subtract(1, 'day');
                const hace7Dias = hoy.subtract(7, 'day');
                const hace1Mes = hoy.subtract(1, 'month');

                const ventasHoy = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(hoy, 'day'));
                const ventasAyer = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(ayer, 'day'));
                const ventasUltimos7Dias = ventasData.filter((venta: any) => 
                    dayjs(venta.fecha_inicio).isBetween(hace7Dias, hoy, 'day', '[]') // Incluir bordes
                );
                
                const ventasUltimoMes = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isAfter(hace1Mes));

                setVentasHoy(ventasHoy.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
                setVentasAyer(ventasAyer.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
                setVentasUltimos7Dias(ventasUltimos7Dias.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
                setVentasUltimoMes(ventasUltimoMes.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
                setVentasTotales(ventasData.sort((a: any, b: any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio))));
                setFilteredVentas(ventasData);
            } catch {
                setError('Error al obtener las ventas');
            } finally {
                setLoading(false);
            }
        };

        fetchVentas();
    }, [token]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        setFilteredVentas(ventasTotales.filter((venta) =>
            venta.id.toString().includes(value) ||
            venta.personas[0]?.nombre.toLowerCase().includes(value) ||
            venta.personas[0]?.apellido.toLowerCase().includes(value) ||
            venta.subtotal.toString().includes(value) ||
            venta.total.toString().includes(value)
        ));
    };

    const handleDelete = async (ventaId: number) => {
        try {
            await VentasService.deleteVenta(token, ventaId);
            message.success('Venta eliminada');
            setFilteredVentas(filteredVentas.filter((venta) => venta.id !== ventaId));
        } catch {
            message.error('Error al eliminar la venta');
        }
    };

    const handleEdit = (venta: any) => router.push(`ventas/${venta.id}`);

    const handleFilter = () => {
        let filtered = ventasTotales;
        if (selectedOption === 'hoy') filtered = ventasHoy;
        else if (selectedOption === 'ayer') filtered = ventasAyer;
        else if (selectedOption === '7dias') filtered = ventasUltimos7Dias;
        else if (selectedOption === 'mes') filtered = ventasUltimoMes;

        if (dateRange) {
            filtered = filtered.filter((venta) => dayjs(venta.fecha_inicio).isBetween(dateRange[0], dateRange[1], null, '[]'));
        }
        setFilteredVentas(filtered);
    };

    if (loading) return <Spin />;
    if (error) return <Alert message="Error" description={error} type="error" showIcon />;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Detalles de las Ventas</h1>
            <div className="mb-4 flex flex-col lg:flex-row w-full space-x-0 lg:space-x-10 space-y-5 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center w-full space-x-0 sm:space-x-3 space-y-3 sm:space-y-0">
                    <Select value={selectedOption} onChange={setSelectedOption} >
                        <Option value="hoy">Hoy</Option>
                        <Option value="ayer">Ayer</Option>
                        <Option value="7dias">Últimos 7 Días</Option>
                        <Option value="mes">Último Mes</Option>
                        <Option value="todas">Todas</Option>
                    </Select>
                    <RangePicker format="DD/MM/YYYY" onChange={(dates: any) => setDateRange(dates)} />
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

            {filteredVentas.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen ventas" />
                </div>
            ) : (
                <Table
                    dataSource={filteredVentas}
                    rowKey="id"
                    scroll={{
                        x:
                            'max-content'
                    }}
                    columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id' },
                        { title: 'Cliente', dataIndex: 'personas', key: 'cliente', render: (personas) => `${personas[0].nombre} ${personas[0].apellido}` },
                        { title: 'Fecha de Inicio', dataIndex: 'fecha_inicio', key: 'fecha_inicio', render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm') },
                        { title: 'Fecha de Fin', dataIndex: 'fecha_fin', key: 'fecha_fin', render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm') },
                        { title: '# Facturas', dataIndex: 'facturas', key: 'facturas', render: (facturas) => facturas.length },
                        { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal' },
                        { title: 'Descuento', dataIndex: 'descuento', key: 'descuento' },
                        { title: 'Total', dataIndex: 'total', key: 'total' },
                        {
                            title: 'Acciones', key: 'actions', render: (text, venta) => (
                                <div className="flex space-x-5">
                                    <a onClick={() => handleEdit(venta)} type="link">Editar</a>
                                    <a onClick={() => router.push(`ventas/facturas/${venta.id}`)} type="link">Facturas</a>
                                    <Popconfirm title="¿Estás seguro de eliminar esta venta?" onConfirm={() => handleDelete(venta.id)} okText="Sí" cancelText="No" placement='left'>
                                        <CloseOutlined className='text-xl' style={{ color: 'red', cursor: 'pointer' }}>Eliminar</CloseOutlined>
                                    </Popconfirm>
                                </div>
                            ),
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default VentasPage;
