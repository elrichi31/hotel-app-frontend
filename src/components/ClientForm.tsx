'use client'
import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { Plus, Pencil, Trash2, IdCard, User, Globe, MapPin } from 'lucide-react';
import ClientModal from '@/components/ClientModal';
import { Client } from '@/types/types';
import { notion } from '@/lib/theme';
import { ColumnHeader } from '@/components/ui/ColumnHeader';
import { RowActionsMenu } from '@/components/ui/RowActionsMenu';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';

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

    const columns: DataTableColumn<Client>[] = [
        {
            key: 'cliente',
            header: <ColumnHeader icon={<User size={13} />}>Cliente</ColumnHeader>,
            render: (c) => <span style={{ color: notion.ink }}>{c.nombre} {c.apellido}</span>,
        },
        {
            key: 'documento',
            header: <ColumnHeader icon={<IdCard size={13} />}>Documento</ColumnHeader>,
            render: (c) => (
                <span style={{ color: notion.inkMuted, fontVariantNumeric: 'tabular-nums' }}>
                    {c.tipo_documento === 'pasaporte' ? 'Pasaporte' : 'Cédula'} · {c.numero_documento}
                </span>
            ),
        },
        {
            key: 'ciudadania',
            header: <ColumnHeader icon={<Globe size={13} />}>Ciudadanía</ColumnHeader>,
            render: (c) => <span style={{ color: notion.inkMuted }}>{c.ciudadania}</span>,
        },
        {
            key: 'procedencia',
            header: <ColumnHeader icon={<MapPin size={13} />}>Procedencia</ColumnHeader>,
            render: (c) => <span style={{ color: notion.inkMuted }}>{c.procedencia}</span>,
        },
        {
            key: 'acciones',
            header: '',
            align: 'end',
            width: 60,
            render: (client) => (
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
                <Button color="primary" startContent={<Plus size={16} />} onPress={abrirCrear}>
                    Agregar cliente
                </Button>
            </div>

            <DataTable<Client>
                ariaLabel="Clientes de la venta"
                columns={columns}
                rows={clients}
                emptyContent="Todavía no hay clientes en esta venta"
            />

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
