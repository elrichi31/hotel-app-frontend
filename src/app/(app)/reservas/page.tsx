'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReservaService from '@/services/ReservasService';
import { Spin, Alert, message, Empty, Table, Button, Select, DatePicker, Input, Popconfirm, Modal } from 'antd';
import { useSession } from 'next-auth/react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { EditOutlined, CloseOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReservasPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [reservas, setReservas] = useState<any[]>([]);
    const [filteredReservas, setFilteredReservas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string>('todas');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [searchText, setSearchText] = useState<string>(''); // Nuevo estado para el texto de búsqueda
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<any | null>(null);

    useEffect(() => {
        if (session?.user?.token?.token) {
            const fetchReservas = async () => {
                try {
                    const reservasData = await ReservaService.getAllReservas(session.user.token.token);
                    const hoy = dayjs().startOf('day');
                    const ayer = hoy.subtract(1, 'day');
                    const hace7Dias = hoy.subtract(7, 'day');
                    const hace1Mes = hoy.subtract(1, 'month');

                    const reservasHoy = reservasData.filter((reserva: any) => dayjs(reserva.fecha_inicio).isSame(hoy, 'day'));
                    const reservasAyer = reservasData.filter((reserva: any) => dayjs(reserva.fecha_inicio).isSame(ayer, 'day'));
                    const reservasUltimos7Dias = reservasData.filter((reserva: any) => dayjs(reserva.fecha_inicio).isAfter(hace7Dias) && dayjs(reserva.fecha_inicio).isBefore(ayer));
                    const reservasUltimoMes = reservasData.filter((reserva: any) => dayjs(reserva.fecha_inicio).isAfter(hace1Mes));

                    setReservas(reservasData);
                    setFilteredReservas(reservasData); // Inicialmente muestra todas las reservas
                    setLoading(false);
                } catch (error) {
                    setError('Error al obtener las reservas');
                    setLoading(false);
                }
            };
            fetchReservas();
        }
    }, [session]);

    // Función para manejar la búsqueda global
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = reservas.filter((reserva) =>
            reserva.id.toString().includes(value) ||
            reserva.nombre.toLowerCase().includes(value) ||
            reserva.apellido.toLowerCase().includes(value) ||
            reserva.total.toString().includes(value)
        );

        setFilteredReservas(filtered);
    };

    const handleDelete = async (reservaId: number) => {
        try {
            if (session?.user?.token?.token) {
                await ReservaService.deleteReserva(reservaId, session.user.token.token);
                setReservas(reservas.filter((reserva) => reserva.id !== reservaId));
                setFilteredReservas(filteredReservas.filter((reserva) => reserva.id !== reservaId));
            }
        } catch (error) {
            message.error('Error al eliminar la reserva');
        }
    };

    const handleFilter = () => {
        let filtered: any[] = [];
        switch (selectedOption) {
            case 'hoy':
                filtered = reservas.filter((reserva) => dayjs(reserva.fecha_inicio).isSame(dayjs(), 'day'));
                break;
            case 'ayer':
                filtered = reservas.filter((reserva) => dayjs(reserva.fecha_inicio).isSame(dayjs().subtract(1, 'day'), 'day'));
                break;
            case '7dias':
                filtered = reservas.filter((reserva) => dayjs(reserva.fecha_inicio).isAfter(dayjs().subtract(7, 'day')));
                break;
            case 'mes':
                filtered = reservas.filter((reserva) => dayjs(reserva.fecha_inicio).isAfter(dayjs().subtract(1, 'month')));
                break;
            case 'todas':
                filtered = reservas;
                break;
            default:
                filtered = reservas;
        }

        if (dateRange) {
            const [startDate, endDate] = dateRange;
            filtered = filtered.filter((reserva) =>
                dayjs(reserva.fecha_inicio).isBetween(startDate, endDate, null, '[]')
            );
        }

        setFilteredReservas(filtered);
    };

    const handleDateRangeChange: any = (dates: [Dayjs, Dayjs] | null) => {
        setDateRange(dates);
    };

    // Abrir el modal con los detalles de la reserva
    const showModal = (reserva: any) => {
        setSelectedReserva(reserva);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedReserva(null);
    };

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Detalles de las Reservas</h1>

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

            {filteredReservas.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen reservas" />
                </div>
            ) : (
                <Table
                    dataSource={filteredReservas}
                    scroll={{ x: 1000 }}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'id',
                            key: 'id',
                        },
                        {
                            title: 'Cliente',
                            key: 'cliente',
                            render: (text: any, reserva: any) => (`${reserva.nombre} ${reserva.apellido}`),
                        },
                        {
                            title: 'Fecha de Creación',
                            dataIndex: 'created_at',
                            key: 'fecha_creacion',
                            render: (text: string) => dayjs(text).format('DD/MM/YYYY HH:mm'),
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
                            title: 'Número de Personas',
                            dataIndex: 'numero_personas',
                            key: 'numero_personas',
                        },
                        {
                            title: 'Total',
                            dataIndex: 'total',
                            key: 'total',
                        },
                        {
                            title: 'Acciones',
                            key: 'actions',
                            render: (text: any, reserva: any) => (
                                <div className="flex space-x-5">
                                    <InfoCircleOutlined
                                        className='text-xl'
                                        onClick={() => showModal(reserva)}
                                        type="link"
                                        style={{ color: 'blue', cursor: 'pointer' }}
                                    />
                                    <Popconfirm
                                        title="¿Estás seguro de eliminar esta reserva?"
                                        onConfirm={() => handleDelete(reserva.id)}
                                        okText="Sí"
                                        cancelText="No"
                                        placement='left'
                                    >
                                        <CloseOutlined
                                            className='text-xl'
                                            type="link"
                                            style={{ color: 'red', cursor: 'pointer' }}
                                        />
                                    </Popconfirm>
                                </div>
                            ),
                        },
                    ]}
                    rowKey="id"
                />
            )}

            {selectedReserva && (
                <Modal
                    title="Detalles de la Reserva"
                    visible={isModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="close" onClick={handleCancel}>
                            Cerrar
                        </Button>,
                    ]}
                >
                    <p><strong>ID:</strong> {selectedReserva.id}</p>
                    <p><strong>Cliente:</strong> {selectedReserva.nombre} {selectedReserva.apellido}</p>
                    <p><strong>Fecha de Creación:</strong> {dayjs(selectedReserva.created_at).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Fecha de Inicio:</strong> {dayjs(selectedReserva.fecha_inicio).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Fecha de Fin:</strong> {dayjs(selectedReserva.fecha_fin).format('DD/MM/YYYY HH:mm')}</p>
                    <p><strong>Número de Personas:</strong> {selectedReserva.numero_personas}</p>
                    <p><strong>Total:</strong> ${selectedReserva.total}</p>
                    <h3 className="mt-4">Habitaciones:</h3>
                    {selectedReserva.precios.map((precio: any) => (
                        <div key={precio.id} className="mb-2">
                            <p><strong>Habitación Número:</strong> {precio.habitacion.numero}</p>
                            <p><strong>Tipo:</strong> {precio.habitacion.tipo}</p>
                            <p><strong>Descripción:</strong> {precio.habitacion.descripcion}</p>
                            <p><strong>Precio:</strong> ${precio.precio}</p>
                            <p><strong>Estado de la Habitación:</strong> {precio.habitacion.estado}</p>
                        </div>
                    ))}
                </Modal>
            )}
        </div>
    );
};

export default ReservasPage;
