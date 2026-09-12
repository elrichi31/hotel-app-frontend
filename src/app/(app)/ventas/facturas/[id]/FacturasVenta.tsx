'use client';
import React, { useEffect, useState } from 'react';
import FacturasService from '@/services/FacturasService';
import CardFactura from '@/components/FacturaCard';
import { Plus } from 'lucide-react';
import FacturaModal from '@/components/FacturaModal';
import { Button, Empty, Spin, Alert } from 'antd';
import { PageHeader } from '@/components/ui/PageHeader';
import { toast } from '@/lib/toast';

export default function FacturasVenta({ params, token }: any) {
    const [facturas, setFacturas] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchFacturas = async () => {
            try {
                if (token) {
                    const data = await FacturasService.getFacturasByVenta(params.id, token);
                    if (Array.isArray(data)) setFacturas(data);
                }
            } catch (error: any) {
                setError(error.message || 'Error al obtener las facturas');
                setFacturas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFacturas();
    }, [params.id, token]);

    const handleOk = async (values: any) => {
        try {
            const val = { ...values, venta_id: params.id, estado: 'guardado' };
            const newFactura = await FacturasService.createFactura(token, val);
            if (newFactura && typeof newFactura === 'object') {
                setFacturas((prev) => [...prev, newFactura]);
                toast.success('Factura creada exitosamente');
                setIsModalOpen(false);
            } else {
                throw new Error('Factura creada inválida');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear la factura');
        }
    };

    const updateFactura = (updatedFactura: any) => {
        setFacturas((prev) => prev.map((f) => (f.id === updatedFactura.id ? updatedFactura : f)));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    return (
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <PageHeader
                title={`Facturas de la venta #${params.id}`}
                subtitle={`${facturas.length} factura${facturas.length === 1 ? '' : 's'}`}
                action={
                    <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                        Crear factura
                    </Button>
                }
            />

            {facturas.length === 0 ? (
                <div style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: '48px 16px' }}>
                    <Empty description="No hay facturas para esta venta" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {facturas.map((factura) => (
                        <CardFactura key={factura.id} factura={factura} onUpdate={updateFactura} token={token} />
                    ))}
                </div>
            )}

            <FacturaModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleOk} factura={null} edit={false} />
        </div>
    );
}
