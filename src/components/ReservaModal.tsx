import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@heroui/react';
import {
    User,
    Calendar,
    Users,
    Home,
    BedDouble,
    Clock,
    Phone,
} from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { money, dateTime } from '@/lib/format';
import { ModalTitle } from '@/components/ui/ModalTitle';

interface ReservaModalProps {
    isOpen: boolean;
    onClose: () => void;
    reserva: any;
}

/** Título de sección con un ícono muted delante, mismo tratamiento que FacturaCard. */
const SectionLabel = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: notion.inkMuted, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        <span style={{ fontSize: 13, display: 'inline-flex' }}>{icon}</span>
        {children}
    </div>
);

/** Fila etiqueta/valor con un ícono muted a la izquierda del texto. */
const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '7px 0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: notion.inkFaint, fontSize: 13 }}>
            <span style={{ fontSize: 13, display: 'inline-flex' }}>{icon}</span>
            {label}
        </span>
        <span style={{ color: notion.ink, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
);

/** Chip de estado con fondo tintado, igual patrón que EstadoPill de facturas. */
const EstadoPill = ({ estado }: { estado: string }) => {
    const color = estado === 'Libre' ? viz.positive : viz.negative;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 9px',
                borderRadius: 999,
                background: `${color}1f`,
                color,
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
            {estado}
        </span>
    );
};

const RoomItem: React.FC<{ number: string; type: string; description: string; price: string; status: string }> = ({
    number,
    type,
    description,
    price,
    status,
}) => (
    <div
        style={{
            border: `1px solid ${notion.divider}`,
            borderRadius: 12,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${notion.divider}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: `${viz.series1}1f`,
                        color: viz.series1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                    }}
                >
                    <BedDouble size={14} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: notion.ink }}>Habitación {number}</span>
            </div>
            <EstadoPill estado={status} />
        </div>
        <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Home size={13} color={notion.inkFaint} />
                <span style={{ fontSize: 13, color: notion.ink, fontWeight: 500 }}>{type}</span>
            </div>
            <div style={{ fontSize: 12.5, color: notion.inkMuted, lineHeight: 1.5, marginBottom: 8 }}>{description}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: notion.ink }}>{price}</div>
        </div>
    </div>
);

const ReservaModal: React.FC<ReservaModalProps> = ({ isOpen, onClose, reserva }) => {
    if (!reserva) return null;

    const initials = `${reserva.nombre?.[0] ?? ''}${reserva.apellido?.[0] ?? ''}`.toUpperCase();

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>
                    <ModalTitle icon={<Calendar size={15} />}>Detalles de la reserva #{reserva.id}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {/* Cliente + total como cifra hero, mismo patrón que FacturaCard */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Avatar radius="sm" style={{ width: 34, height: 34, background: viz.series1, fontSize: 13, flexShrink: 0 }} name={initials || undefined} icon={!initials ? <User size={13} /> : undefined} />
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: notion.ink }}>
                                {reserva.nombre} {reserva.apellido}
                            </div>
                            {reserva.telefono && (
                                <div style={{ fontSize: 12.5, color: notion.inkMuted, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                    <Phone size={13} />
                                    {reserva.telefono}
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${notion.divider}`,
                            marginBottom: 18,
                        }}
                    >
                        <div style={{ fontSize: 11.5, color: notion.inkFaint, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                            Total de la reserva
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 700, color: notion.ink, marginTop: 4, lineHeight: 1.1 }}>
                            {money(reserva.total, 2)}
                        </div>
                        <div style={{ fontSize: 12, color: notion.inkMuted, marginTop: 4 }}>
                            <Users size={12} style={{ marginRight: 6 }} />
                            {reserva.numero_personas} persona{Number(reserva.numero_personas) === 1 ? '' : 's'}
                        </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <SectionLabel icon={<Calendar size={13} />}>Fechas</SectionLabel>
                    </div>
                    <div style={{ borderTop: `1px solid ${notion.divider}` }}>
                        <Row icon={<Clock size={13} />} label="Fecha de creación" value={dateTime(reserva.created_at)} />
                        <Row icon={<Calendar size={13} />} label="Fecha de inicio" value={dateTime(reserva.fecha_inicio)} />
                        <Row icon={<Calendar size={13} />} label="Fecha de fin" value={dateTime(reserva.fecha_fin)} />
                    </div>

                    <div style={{ marginTop: 18, marginBottom: 10 }}>
                        <SectionLabel icon={<Home size={13} />}>Habitaciones Reservadas</SectionLabel>
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {reserva.precios.map((precio: any) => (
                            <RoomItem
                                key={precio.id}
                                number={precio.habitacion.numero}
                                type={precio.habitacion.tipo}
                                description={precio.habitacion.descripcion}
                                price={money(precio.precio, 2)}
                                status={precio.habitacion.estado}
                            />
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReservaModal;
