// components/FacturaModal.tsx
'use client'
import { Button, DatePicker, Form, Input, InputNumber, Select, Modal } from 'antd';
import {
    Trash2,
    Plus,
    FileText,
    User,
    IdCard,
    Phone,
    MapPin,
    Mail,
    Calendar,
    Wallet,
    Save,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';
import { money } from '@/lib/format';

const { Item } = Form;
const { Option } = Select;

export default function FacturaModal({ open, onCancel, onOk, factura, edit }: any) {
    const [form] = Form.useForm();
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const modalTitle = edit ? `Editar factura ${factura?.numero_factura ?? `#${factura?.id}`}` : 'Crear factura';

    // Definir initialValues sin propagar '...factura' para evitar sobrescribir campos
    const initialValues = {
        productos: factura?.productos || [],
        descuento: factura?.descuento || 0,
        estado: factura?.estado || 'guardado',
        fecha_emision: factura?.fecha_emision && dayjs(factura.fecha_emision).isValid()
            ? dayjs(factura.fecha_emision)
            : undefined,
        nombre: factura?.nombre || '',
        apellido: factura?.apellido || '',
        identificacion: factura?.identificacion || '',
        direccion: factura?.direccion || '',
        telefono: factura?.telefono || '',
        correo: factura?.correo || '',
        observaciones: factura?.observaciones || '',
        forma_pago: factura?.forma_pago || '',
    };

    const updateTotals = (productos: any[], descuento: number) => {
        const subtotalCalc = productos.reduce((acc: number, item: any) => {
            if (item && typeof item.cantidad === 'number' && typeof item.precio_unitario === 'number') {
                return acc + (item.cantidad || 0) * (item.precio_unitario || 0);
            }
            return acc;
        }, 0);
        const totalCalc = subtotalCalc - (descuento || 0);
        return { subtotal: subtotalCalc, total: totalCalc > 0 ? totalCalc : 0 };
    };

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue(initialValues);
            const { subtotal: subtotalCalc, total: totalCalc } = updateTotals(initialValues.productos, initialValues.descuento);
            setSubtotal(subtotalCalc);
            setTotal(totalCalc);
            form.setFieldsValue({ subtotal: subtotalCalc, total: totalCalc });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [factura, form, open]);

    const handleValuesChange = (changedValues: any, allValues: any) => {
        if (changedValues.productos || changedValues.descuento !== undefined) {
            const productos = allValues.productos || [];
            const descuento = allValues.descuento || 0;
            const { subtotal: subtotalCalc, total: totalCalc } = updateTotals(productos, descuento);
            setSubtotal(subtotalCalc);
            setTotal(totalCalc);
            form.setFieldsValue({ subtotal: subtotalCalc, total: totalCalc });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const fecha_emision = values.fecha_emision ? values.fecha_emision.format('YYYY-MM-DD') : null;
            onOk({ ...values, fecha_emision });
            form.resetFields();
            setSubtotal(0);
            setTotal(0);
        } catch (errorInfo) {
            console.log('Validation Failed:', errorInfo);
        }
    };

    return (
        <Modal
            open={open}
            title={<ModalTitle icon={<FileText size={15} />}>{modalTitle}</ModalTitle>}
            cancelText="Cancelar"
            onCancel={onCancel}
            onOk={handleOk}
            okText={edit ? 'Guardar' : 'Crear'}
            okButtonProps={{ icon: <Save size={14} />, style: { borderRadius: 8 } }}
            cancelButtonProps={{ style: { borderRadius: 8 } }}
            width={640}
            destroyOnClose
        >
            <Form form={form} layout="vertical" initialValues={initialValues} onValuesChange={handleValuesChange}>
                <Section title="Datos del cliente">
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Item label="Nombre" name="nombre" style={{ flex: 1 }} rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                            <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Nombre" />
                        </Item>
                        <Item label="Apellido" name="apellido" style={{ flex: 1 }} rules={[{ required: true, message: 'Ingresa el apellido' }]}>
                            <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Apellido" />
                        </Item>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Item label="Identificación" name="identificacion" style={{ flex: 1 }} rules={[{ required: true, message: 'Ingresa la identificación' }]}>
                            <Input prefix={<IdCard size={14} color={notion.inkFaint} />} placeholder="0000000000" />
                        </Item>
                        <Item label="Teléfono" name="telefono" style={{ flex: 1 }} rules={[{ required: true, message: 'Ingresa el teléfono' }]}>
                            <Input prefix={<Phone size={14} color={notion.inkFaint} />} placeholder="0900000000" />
                        </Item>
                    </div>
                    <Item label="Dirección" name="direccion" rules={[{ required: true, message: 'Ingresa la dirección' }]}>
                        <Input prefix={<MapPin size={14} color={notion.inkFaint} />} placeholder="Av. Amazonas N11-92" />
                    </Item>
                    <Item
                        label="Correo"
                        name="correo"
                        style={{ marginBottom: 0 }}
                        rules={[
                            { required: true, message: 'Ingresa el correo' },
                            { type: 'email', message: 'Ingresa un correo válido' },
                        ]}
                    >
                        <Input prefix={<Mail size={14} color={notion.inkFaint} />} placeholder="cliente@correo.com" />
                    </Item>
                </Section>

                <Section title="Detalles">
                    <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
                        <Item label="Fecha de emisión" name="fecha_emision" style={{ flex: 1 }} rules={[{ required: true, message: 'Selecciona la fecha' }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Selecciona la fecha" suffixIcon={<Calendar size={14} color={notion.inkFaint} />} />
                        </Item>
                        <Item label="Forma de pago" name="forma_pago" style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: 'Selecciona una forma de pago' }]}>
                            <Select placeholder="Selecciona" suffixIcon={<Wallet size={14} color={notion.inkFaint} />}>
                                <Option value="efectivo">Efectivo</Option>
                                <Option value="tarjeta">Tarjeta</Option>
                                <Option value="transferencia">Transferencia</Option>
                            </Select>
                        </Item>
                    </div>
                </Section>

                <Section title="Productos">
                    <Form.List name="productos">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: notion.inkFaint }}>
                                        <span style={{ width: 72 }}>Cantidad</span>
                                        <span style={{ flex: 1 }}>Descripción</span>
                                        <span style={{ width: 120 }}>Precio unitario</span>
                                        <span style={{ width: 24 }} />
                                    </div>
                                )}
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 10 }}>
                                        <Item
                                            {...restField}
                                            name={[name, 'cantidad']}
                                            rules={[{ required: true, message: 'Requerida' }]}
                                            style={{ width: 72, marginBottom: 0 }}
                                        >
                                            <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
                                        </Item>
                                        <Item
                                            {...restField}
                                            name={[name, 'descripcion']}
                                            rules={[{ required: true, message: 'Requerida' }]}
                                            style={{ flex: 1, marginBottom: 0 }}
                                        >
                                            <Input placeholder="Desayuno buffet" />
                                        </Item>
                                        <Item
                                            {...restField}
                                            name={[name, 'precio_unitario']}
                                            rules={[{ required: true, message: 'Requerido' }]}
                                            style={{ width: 120, marginBottom: 0 }}
                                        >
                                            <InputNumber min={0} placeholder="0.00" style={{ width: '100%' }} prefix="$" />
                                        </Item>
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 size={14} />}
                                            onClick={() => remove(name)}
                                            style={{ width: 24, flexShrink: 0 }}
                                        />
                                    </div>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<Plus size={14} />}>
                                    Agregar producto
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Section>

                <Section title="Descuento y observaciones">
                    <Item label="Descuento" name="descuento" style={{ maxWidth: 200 }}>
                        <InputNumber min={0} placeholder="0.00" style={{ width: '100%' }} prefix="$" />
                    </Item>
                    <Item label="Observaciones" name="observaciones" style={{ marginBottom: 0 }}>
                        <Input.TextArea rows={2} placeholder="Opcional" />
                    </Item>
                </Section>

                <Item name="subtotal" hidden><InputNumber /></Item>
                <Item name="total" hidden><InputNumber /></Item>

                <div style={{ display: 'flex', gap: 32, padding: '4px 4px 8px' }}>
                    <div>
                        <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Subtotal</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(subtotal, 2)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Total</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(total, 2)}</div>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}
