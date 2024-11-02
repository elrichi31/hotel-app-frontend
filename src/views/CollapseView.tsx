"use client"
import React, { useState } from 'react';
import { Collapse, Space } from 'antd';
import ClientForm from '@/components/ClientForm';
import VentaForm from '@/components/VentaForm';

interface CollapseViewProps {
    token: string;
}

const CollapseView: React.FC<CollapseViewProps> = ({ token }) => {
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
                        children: <ClientForm handlePanelChange={handleKeys} updateClientIds={updateClientIds} token={token}/>,
                    },
                    {
                        key: '2',
                        label: 'Procesar venta',
                        children: <VentaForm setVenta={setVenta} personIds={clientIds} token={token}/>,
                        collapsible: enabledKeys.includes('2') ? 'header' : 'disabled',
                    },
                ]}
            />
        </Space>
    );
};

export default CollapseView;
