'use client'
import React, { useState } from 'react';
import { Table, Button, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Pencil, Trash2, IdCard, User, Globe, MapPin } from 'lucide-react';
import ClientModal from '@/components/ClientModal';
import { Client } from '@/types/types';
import { notion } from '@/lib/theme';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';

/**
 * Tabla de clientes de la venta. Controlado a propósito: la lista vive en el
 * componente padre (`clients`/`onChange`), no aquí dentro. El wizard de
 * "Nueva venta" desmonta este componente al cambiar de paso (renderiza
 * Registro de cliente o Procesar venta con un ternario) — si la lista fuera
 * estado local, se perdía al volver del paso 2 al 1.
 */
const ClientForm = ({
    clients,
    onChange,
    token,
}: {
    clients: Client[];
    onChange: (clients: Client[]) => void;
    token: string;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);

    const abrirCrear = () => {
        setEditing(null);
        setIsModalOpen(true);
    };

    const abrirEditar = (client: Client) => {
        setEditing(client);
        setIsModalOpen(true);
    };

    const handleAdded = (client: Client) => {
        const yaEsta = clients.some((c) => c.id === client.id);
        onChange(yaEsta ? clients.map((c) => (c.id === client.id ? client : c)) : [...clients, client]);
        setIsModalOpen(false);
        setEditing(null);
    };

    // Quita al cliente de esta venta; no lo borra del sistema.
    const handleRemove = (id: number) => {
        onChange(clients.filter((c) => c.id !== id));
    };

    const columns: ColumnsType<Client> = [
        {
            title: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
            key: 'cliente',
            render: (_, c) => (
                <div>
                    <div style={{ color: notion.ink }}>{c.nombre} {c.apellido}</div>
                </div>
            ),
        },
        {
            title: <ColumnHeader icon={<IdCard size={13} />}>Documento</ColumnHeader>,
            key: 'documento',
            render: (_, c) => (
                <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                    {c.tipo_documento === 'pasaporte' ? 'Pasaporte' : 'Cédula'} · {c.numero_documento}
                </span>
            ),
        },
        {
            title: <ColumnHeader icon={<Globe size={13} />}>Ciudadanía</ColumnHeader>,
            dataIndex: 'ciudadania',
            key: 'ciudadania',
            render: (v: string) => <span style={{ color: notion.inkMuted }}>{v}</span>,
        },
        {
            title: <ColumnHeader icon={<MapPin size={13} />}>Procedencia</ColumnHeader>,
            dataIndex: 'procedencia',
            key: 'procedencia',
            render: (v: string) => <span style={{ color: notion.inkMuted }}>{v}</span>,
        },
        {
            title: '',
            key: 'acciones',
            align: 'right',
            width: 60,
            render: (_, client) => (
                <RowActionsMenu
                    actions={[
                        { key: 'editar', label: 'Editar', icon: <Pencil size={14} />, onClick: () => abrirEditar(client) },
                        {
                            key: 'quitar',
                            label: 'Quitar',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => handleRemove(client.id),
                            confirm: { title: '¿Quitar este cliente de la venta?', okText: 'Quitar' },
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Button type="primary" icon={<Plus size={16} />} onClick={abrirCrear}>
                    Agregar cliente
                </Button>
            </div>

            {clients.length === 0 ? (
                <div
                    style={{
                        border: `1px dashed ${notion.divider}`,
                        borderRadius: notion.radius,
                        padding: '32px 16px',
                    }}
                >
                    <Empty description="Todavía no hay clientes en esta venta" />
                </div>
            ) : (
                <Table<Client>
                    dataSource={clients}
                    columns={columns}
                    rowKey="id"
                    size="middle"
                    pagination={false}
                    scroll={{ x: 640 }}
                />
            )}

            <ClientModal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleAdded}
                initial={editing}
                token={token}
            />
        </div>
    );
};

export default ClientForm;
