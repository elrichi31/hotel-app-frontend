'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import { Spin, Alert, message, Empty } from 'antd';
import { useSession } from 'next-auth/react';
import VentaDetails from '@/components/VentaDetails';
import dayjs from 'dayjs';

const Page = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [ventasHoy, setVentasHoy] = useState<any[]>([]);
    const [ventasAyer, setVentasAyer] = useState<any[]>([]);
    const [ventasUltimos7Dias, setVentasUltimos7Dias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.token?.token) {
            const fetchVentas = async () => {
                try {
                    const ventasData = await VentasService.getAllVentas(session.user.token.token);
                    const hoy = dayjs().startOf('day');
                    const ayer = hoy.subtract(1, 'day');
                    const hace7Dias = hoy.subtract(7, 'day');

                    const ventasHoy = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(hoy, 'day'));
                    const ventasAyer = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isSame(ayer, 'day'));
                    const ventasUltimos7Dias = ventasData.filter((venta: any) => dayjs(venta.fecha_inicio).isAfter(hace7Dias) && dayjs(venta.fecha_inicio).isBefore(ayer));

                    // Ordenar ventas por fecha desde la más reciente a la más antigua
                    ventasHoy.sort((a:any, b:any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasAyer.sort((a:any, b:any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));
                    ventasUltimos7Dias.sort((a:any, b:any) => dayjs(b.fecha_inicio).diff(dayjs(a.fecha_inicio)));

                    setVentasHoy(ventasHoy);
                    setVentasAyer(ventasAyer);
                    setVentasUltimos7Dias(ventasUltimos7Dias);
                    setLoading(false);
                } catch (error) {
                    setError('Error al obtener las ventas');
                    setLoading(false);
                }
            };
            fetchVentas();
        }
    }, [session]);

    const handleDelete = async (ventaId: number) => {
        try {
            if (session?.user?.token?.token) {
                await VentasService.deleteVenta(session.user.token.token, ventaId);
                setVentasHoy(ventasHoy.filter((venta) => venta.id !== ventaId));
                setVentasAyer(ventasAyer.filter((venta) => venta.id !== ventaId));
                setVentasUltimos7Dias(ventasUltimos7Dias.filter((venta) => venta.id !== ventaId));
            }
        } catch (error) {
            message.error('Error al eliminar la venta');
        }
    };

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div className="container mx-auto p-4">
            <head>
                <title>Detalles de las Ventas</title>
                <meta name="description" content="Página de detalles de las ventas" />
            </head>
            <h1 className="text-2xl font-bold mb-4">Detalles de las Ventas</h1>
            <h2 className="text-xl font-semibold mt-6 mb-2">Ventas de Hoy</h2>
            {ventasHoy.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen ventas" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ventasHoy.map((venta) => (
                        <VentaDetails key={venta.id} venta={venta} onDelete={handleDelete} />
                    ))}
                </div>
            )}
            <h2 className="text-xl font-semibold mt-6 mb-2">Ventas de Ayer</h2>
            {ventasAyer.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen ventas" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ventasAyer.map((venta) => (
                        <VentaDetails key={venta.id} venta={venta} onDelete={handleDelete} />
                    ))}
                </div>
            )}
            <h2 className="text-xl font-semibold mt-6 mb-2">Ventas de los Últimos 7 Días</h2>
            {ventasUltimos7Dias.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Empty description="No existen ventas" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ventasUltimos7Dias.map((venta) => (
                        <VentaDetails key={venta.id} venta={venta} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Page;
