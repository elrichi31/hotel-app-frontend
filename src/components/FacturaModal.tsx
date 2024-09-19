// components/FacturaModal.tsx
'use client'
import { Button, DatePicker, Form, Input, InputNumber, Select, Space, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function FacturaModal({ open, onCancel, onOk, factura, edit }: any) {
    const { Option } = Select;
    const [form] = Form.useForm();
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const modalTitle = edit ? `Editar Factura ${factura?.id}` : 'Crear Nueva Factura';

    // Definir initialValues sin propagar '...factura' para evitar sobrescribir campos
    const initialValues = {
        productos: factura?.productos || [],
        descuento: factura?.descuento || 0,
        estado: factura?.estado || 'guardado',
        fecha_emision: factura?.fecha_emision && dayjs(factura.fecha_emision).isValid()
            ? dayjs(factura.fecha_emision)
            : undefined, // Asegurar que sea un objeto dayjs o undefined
        nombre: factura?.nombre || '',
        apellido: factura?.apellido || '',
        identificacion: factura?.identificacion || '',
        direccion: factura?.direccion || '',
        telefono: factura?.telefono || '',
        correo: factura?.correo || '',
        numero_factura: factura?.numero_factura || '',
        observaciones: factura?.observaciones || '',
        forma_pago: factura?.forma_pago || '',
    };

    // Función para calcular subtotal y total
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
        if (open) { // Asegurar que se ejecuta al abrir el modal
            form.resetFields(); // Resetear campos al abrir el modal
            form.setFieldsValue(initialValues); // Establecer valores iniciales

            // Calcular y establecer subtotal y total
            const { subtotal: subtotalCalc, total: totalCalc } = updateTotals(initialValues.productos, initialValues.descuento);
            setSubtotal(subtotalCalc);
            setTotal(totalCalc);
            form.setFieldsValue({ subtotal: subtotalCalc, total: totalCalc });
        }
    }, [factura, form, open]);

    // Manejar cambios en el formulario para recalcular subtotal y total
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

    // Manejar la confirmación del modal
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Formatear la fecha de emisión a YYYY-MM-DD
            const fecha_emision = values.fecha_emision
                ? values.fecha_emision.format('YYYY-MM-DD')
                : null;
            onOk({ ...values, fecha_emision }); // Incluir la fecha formateada
            form.resetFields(); // Resetear el formulario
            setSubtotal(0); // Resetear subtotal
            setTotal(0); // Resetear total
        } catch (errorInfo) {
            console.log('Validation Failed:', errorInfo);
        }
    };

    return (
        <Modal
            open={open}
            title={modalTitle}
            okText={edit ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            onCancel={onCancel}
            onOk={handleOk}
        >
            <Form
                form={form}
                layout='vertical'
                className='w-[450px] m-auto my-10'
                initialValues={initialValues}
                onValuesChange={handleValuesChange}
            >
                {/* Campos del formulario */}
                <div className='flex space-x-5'>
                    <Form.Item
                        label='Nombre'
                        name='nombre'
                        className='w-full'
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input placeholder='Ingrese el nombre' />
                    </Form.Item>
                    <Form.Item
                        label='Apellido'
                        name='apellido'
                        className='w-full'
                        rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
                    >
                        <Input placeholder='Ingrese el apellido' />
                    </Form.Item>
                </div>
                <div className='flex space-x-5'>
                    <Form.Item
                        label='Identificación'
                        name='identificacion'
                        className='w-full'
                        rules={[{ required: true, message: 'Por favor ingrese la identificación' }]}
                    >
                        <Input placeholder='Ingrese la identificación' />
                    </Form.Item>
                    <Form.Item
                        label='Dirección'
                        name='direccion'
                        className='w-full'
                        rules={[{ required: true, message: 'Por favor ingrese la dirección' }]}
                    >
                        <Input placeholder='Ingrese la dirección' />
                    </Form.Item>
                </div>
                <div className='flex space-x-5'>
                    <Form.Item
                        label='Teléfono'
                        name='telefono'
                        className='w-full'
                        rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
                    >
                        <Input placeholder='Ingrese el teléfono' />
                    </Form.Item>
                    <Form.Item
                        label='Correo'
                        name='correo'
                        className='w-full'
                        rules={[
                            { required: true, message: 'Por favor ingrese el correo' },
                            { type: 'email', message: 'Por favor ingrese un correo válido' }
                        ]}
                    >
                        <Input placeholder='Ingrese el correo' />
                    </Form.Item>
                </div>
                <div className='w-full'>
                    <Form.Item
                        label='Fecha de Emisión'
                        name='fecha_emision'
                        rules={[{ required: true, message: 'Por favor seleccione la fecha de emisión' }]}
                    >
                        <DatePicker
                            className='w-full'
                            format='YYYY-MM-DD'
                            placeholder='Seleccione la fecha'
                        />
                    </Form.Item>
                </div>
                <div className='w-full'>
                    <Form.Item
                        label='# Factura'
                        name='numero_factura'
                        rules={[{ required: true, message: 'Por favor ingrese un numero de factura' }]}
                    >
                        <Input className='w-full' placeholder='#' />
                    </Form.Item>
                </div>
                <div className='w-full'>
                    <Form.List name="productos">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} align="baseline" className='w-full'>
                                        <div className='flex mb-5 space-x-2 w-full'>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'cantidad']}
                                                label="Cantidad"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa la cantidad' }]}
                                                className='m-auto'
                                            >
                                                <InputNumber min={1} placeholder="Cantidad" className='w-full' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'descripcion']}
                                                label="Descripción"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
                                                className='m-auto'
                                            >
                                                <Input placeholder="Descripción" className='w-full' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'precio_unitario']}
                                                label="Precio Unitario"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa el precio unitario' }]}
                                                className='m-auto'
                                            >
                                                <InputNumber min={0} placeholder="Precio unitario" className='w-full' />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} className='self-center text-red-500' />
                                        </div>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Agregar Producto
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </div>
                <div>
                    <Form.Item
                        label='Forma de Pago'
                        name='forma_pago'
                        rules={[{ required: true, message: 'Por favor seleccione una forma de pago' }]}
                    >
                        <Select placeholder='Seleccione la forma de pago'>
                            <Option value='efectivo'>Efectivo</Option>
                            <Option value='tarjeta'>Tarjeta</Option>
                            <Option value='transferencia'>Transferencia</Option>
                        </Select>
                    </Form.Item>
                </div>
                <div>
                    <Form.Item
                        label="Observaciones"
                        name="observaciones"
                        rules={[{ required: false }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </div>
                <Form.Item
                    label='Descuento'
                    name='descuento'
                    className='w-full'
                    rules={[{ required: false }]}
                >
                    <InputNumber placeholder='Ingrese el descuento' className='w-full' />
                </Form.Item>
                {/* Campos ocultos para subtotal y total */}
                <Form.Item name='subtotal' hidden>
                    <InputNumber />
                </Form.Item>
                <Form.Item name='total' hidden>
                    <InputNumber />
                </Form.Item>
                <div className='mt-4'>
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Total: ${total.toFixed(2)}</p>
                </div>
            </Form>
        </Modal>
    )
}