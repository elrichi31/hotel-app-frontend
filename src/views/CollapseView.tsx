"use client"
import React, { useState } from 'react';
import { Collapse, Space } from 'antd';
import ClientForm from '@/components/ClientForm';
import VentaForm from '@/components/VentaForm';

const CollapseView = () => {
    const [activeKeys, setActiveKeys] = useState(['1']);
    const [enabledKeys, setEnabledKeys] = useState(['1']);
    const [venta, setVenta] = useState<any>();
    const [clientIds, setClientIds] = useState<number[]>([]);

    const handleKeys = () => {
        setEnabledKeys([...enabledKeys, '2']);
        setActiveKeys([...activeKeys, '2']);
    };

    const handlePanelChange = (keys: string[] | any) => {
        const newKeys = Array.isArray(keys) ? keys : [keys];
        setActiveKeys(newKeys);
    };

    const updateClientIds = (newClientIds: number[]) => {
        setClientIds(newClientIds);
    };

    return (
        <Space direction="vertical" className='w-full'>
            <Collapse
                activeKey={activeKeys}
                onChange={handlePanelChange}
                items={[
                    {
                        key: '1',
                        label: 'Registro de cliente',
                        children: <ClientForm handlePanelChange={handleKeys} updateClientIds={updateClientIds} />,
                    },
                    {
                        key: '2',
                        label: 'Procesar venta',
                        children: <VentaForm setVenta={setVenta} personIds={clientIds} />,
                        collapsible: enabledKeys.includes('2') ? 'header' : 'disabled',
                    },
                ]}
            />
            <div>
                <h3 className='mt-4'>IDs de Clientes Validados/Registrados:</h3>
                <ul>
                    {clientIds.map((id) => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
                <pre>{JSON.stringify(venta, null, 2)}</pre>
            </div>
        </Space>
    );
};

export default CollapseView;
