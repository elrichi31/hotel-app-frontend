'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VentasService from '@/services/VentasService';
import { Spin, Alert } from 'antd';
import { useSession } from 'next-auth/react';

const VentaDetails = () => {
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
            }
            fetchVentas();
        }
    }, [session]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Detalles de las Ventas</h1>
            {ventas.map((venta) => (
                <div key={venta.id} className="mb-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Información de la Venta #{venta.id}</h2>
                        <p><strong>Fecha Inicio:</strong> {new Date(venta.fecha_inicio).toLocaleDateString()}</p>
                        <p><strong>Fecha Fin:</strong> {new Date(venta.fecha_fin).toLocaleDateString()}</p>
                        <p><strong>Descuento:</strong> ${venta.descuento}</p>
                        <p><strong>Subtotal:</strong> ${venta.subtotal}</p>
                        <p><strong>Total:</strong> ${venta.total}</p>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Personas</h2>
                        <ul>
                            {venta.personas?.map((persona: any) => (
                                <li key={persona.id}>
                                    {persona.nombre} {persona.apellido} - {persona.tipo_documento}: {persona.numero_documento} - {persona.ciudadania} - {persona.procedencia}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Habitaciones y Precios</h2>
                        <ul>
                            {venta.precios?.map((precio: any) => (
                                <li key={precio.id}>
                                    <p><strong>Habitación {precio.habitacion.numero} ({precio.habitacion.tipo}):</strong></p>
                                    <p>Descripción: {precio.habitacion.descripcion}</p>
                                    <p>Estado: {precio.habitacion.estado}</p>
                                    <p>Precio: ${precio.precio} para {precio.numero_personas} personas</p>
                                    <p>Fechas de Ocupación: {new Date(precio.habitacion.fecha_inicio_ocupacion).toLocaleDateString()} - {new Date(precio.habitacion.fecha_fin_ocupacion).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VentaDetails;
