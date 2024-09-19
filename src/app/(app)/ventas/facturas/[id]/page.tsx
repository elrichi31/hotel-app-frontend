'use client';
import React, { useEffect, useState } from 'react';
import FacturasService from '@/services/FacturasService';
import { useSession } from 'next-auth/react';
import CardFactura from '@/components/FacturaCard';
import { PlusCircleOutlined } from '@ant-design/icons';
import FacturaModal from '@/components/FacturaModal';
import { Button, message } from 'antd';

export default function Page({ params }: any) {
  const { data: session } = useSession();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        if (session?.user?.token.token) {
          const data = await FacturasService.getFacturasByVenta(params.id, session.user.token.token);
          if (Array.isArray(data)) {
            setFacturas(data);
          } else {
            setFacturas([]); // Asegura que siempre sea un array
            setError('Datos de facturas inválidos.');
          }
        }
      } catch (error: any) {
        setError(error.message || 'Unexpected error');
        setFacturas([]); // Asegura que siempre sea un array en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [params.id, session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async (values: any) => {
    try {
      if (session?.user?.token?.token) {
        const val = { ...values, venta_id: params.id, estado: 'guardado' };
        console.log(val, session.user.token.token);
        const newFactura = await FacturasService.createFactura(session.user.token.token, val);

        if (newFactura && typeof newFactura === 'object') {
          setFacturas([...facturas, newFactura]);
          message.success('Factura creada exitosamente');
          setIsModalOpen(false);
        } else {
          throw new Error('Factura creada inválida');
        }
      }
    } catch (error: any) {
      console.error('Error creando factura:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al crear la factura');
      }
    }
  };

  // Función para actualizar una factura existente en el estado
  const updateFactura = (updatedFactura: any) => {
    setFacturas((prevFacturas) =>
      prevFacturas.map((factura) =>
        factura.id === updatedFactura.id ? updatedFactura : factura
      )
    );
  };

  // Función para eliminar una factura del estado
  const deleteFactura = (facturaId: number) => {
    setFacturas((prevFacturas) => prevFacturas.filter((factura) => factura.id !== facturaId));
    message.success('Factura eliminada exitosamente');
  };

  return (
    <div>
      <h1 className='text-lg font-bold'>Facturas para Venta {params.id}</h1>
      {facturas.length > 0 ? (
        <div>
          <div className='flex space-x-5'>
            {facturas.map((factura) => (
              <CardFactura 
                key={factura.id} 
                factura={factura} 
                onUpdate={updateFactura} // Pasa la función de actualización
                onDelete={deleteFactura} // Pasa la función de eliminación
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No hay facturas para esta venta.</p>
      )}
      <Button className='w-[250px] h-[260px] flex-col m-[16px]' onClick={showModal}>
        <PlusCircleOutlined style={{ fontSize: "20px" }} className='mx-10' />
        Crear factura
      </Button>
      <FacturaModal 
        open={isModalOpen} 
        onCancel={handleCancel} 
        onOk={handleOk} 
        factura={null} 
        edit={false} 
      />
    </div >
  );
}
