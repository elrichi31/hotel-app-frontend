'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import { Spin, Alert, message } from 'antd';
import { useSession } from 'next-auth/react';
import VentaDetails from '@/components/VentaDetails';

const Page = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [ventas, setVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.token?.token) {
            const fetchVentas = async () => {
                try {
                    const ventasData = await VentasService.getAllVentas(session.user.token.token);
                    setVentas(ventasData);
                    console.log('Ventas:', ventasData);
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
                setVentas(ventas.filter((venta) => venta.id !== ventaId));
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
            <h1 className="text-2xl font-bold mb-4">Detalles de las Ventas</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ventas.map((venta) => (
                    <VentaDetails key={venta.id} venta={venta} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
};

export default Page;
