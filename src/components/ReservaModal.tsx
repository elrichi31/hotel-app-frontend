import React from 'react';
import { Modal, Button, Badge, Divider, Typography } from 'antd';
import { UserOutlined, CalendarOutlined, DollarOutlined, TeamOutlined, HomeOutlined, SkinOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    reserva: any;
}

const ReservaModal: React.FC<ReservaModalProps> = ({ isOpen, onClose, reserva }) => {
    return (
        <Modal
            title={`Detalles de la Reserva #${reserva.id}`}
            visible={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Cerrar
                </Button>,
            ]}
        >
            <Title level={4} className="mb-2">Información del Cliente</Title>
            <div className="grid gap-2">
                <InfoItem icon={<UserOutlined />} label="Cliente" value={`${reserva.nombre} ${reserva.apellido}`} />
                <InfoItem icon={<CalendarOutlined />} label="Fecha de Creación" value={dayjs(reserva.created_at).format('DD/MM/YYYY HH:mm')} />
                <InfoItem icon={<CalendarOutlined />} label="Fecha de Inicio" value={dayjs(reserva.fecha_inicio).format('DD/MM/YYYY HH:mm')} />
                <InfoItem icon={<CalendarOutlined />} label="Fecha de Fin" value={dayjs(reserva.fecha_fin).format('DD/MM/YYYY HH:mm')} />
                <InfoItem icon={<TeamOutlined />} label="Número de Personas" value={`${reserva.numero_personas}`} />
                <InfoItem icon={<DollarOutlined />} label="Total" value={`$${reserva.total}`} />
            </div>

            <Divider />

            <Title level={4} className="mb-2">Habitaciones Reservadas</Title>
            <div className="grid gap-4">
                {reserva.precios.map((precio: any) => (
                    <RoomItem
                        key={precio.id}
                        number={precio.habitacion.numero}
                        type={precio.habitacion.tipo}
                        description={precio.habitacion.descripcion}
                        price={`$${precio.precio}`}
                        status={precio.habitacion.estado}
                    />
                ))}
            </div>
        </Modal>
    );
};

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        {icon}
        <Text strong>{label}:</Text>
        <Text>{value}</Text>
    </div>
);

interface RoomItemProps {
    number: string;
    type: string;
    description: string;
    price: string;
    status: string;
}

const RoomItem: React.FC<RoomItemProps> = ({ number, type, description, price, status }) => (
    <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <SkinOutlined />
                <Text strong>Habitación {number}</Text>
            </div>
            <Badge color={status === 'Libre' ? 'green' : 'red'} text={status} />
        </div>
        <div className="grid gap-1">
            <div className="flex items-center gap-2">
                <HomeOutlined />
                <Text>{type}</Text>
            </div>
            <Text className="text-sm text-gray-500">{description}</Text>
            <div className="flex items-center gap-2">
                <DollarOutlined />
                <Text>{price}</Text>
            </div>
        </div>
    </div>
);

export default ReservaModal;
