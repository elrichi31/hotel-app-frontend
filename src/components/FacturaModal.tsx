import { Button, DatePicker, Form, Input, InputNumber, Select, Space, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs'; // Necesario para el formateo de la fecha

export default function FacturaModal({ open, onCancel, onOk, factura, edit }: any) {
    const { Option } = Select;
    const [form] = Form.useForm();
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const modalTitle = edit ? `Editar Factura ${factura?.id}` : 'Crear Nueva Factura';

    const initialValues = {
        productos: factura?.productos || [],
        descuento: factura?.descuento || 0,
        subtotal: factura?.subtotal || 0,
        total: factura?.total || 0,
        estado: factura?.estado || 'guardado',
        fecha_emision: factura?.fecha_emision ? dayjs(factura.fecha_emision) : null, // Formatear la fecha
        ...factura,
    };

    useEffect(() => {
        const productos = form.getFieldValue('productos') || [];
        const descuento = form.getFieldValue('descuento') || 0;
        const { subtotal: subtotalCalc, total: totalCalc } = updateTotals(productos, descuento);
        setSubtotal(subtotalCalc);
        setTotal(totalCalc);
        form.setFieldsValue({ subtotal: subtotalCalc, total: totalCalc });
    }, [form.getFieldValue('productos'), form.getFieldValue('descuento')]);

    const updateTotals = (productos: any[], descuento: number) => {
        const subtotalCalc = productos.reduce((acc: number, item: any) => {
            if (item && typeof item.cantidad === 'number' && typeof item.precio_unitario === 'number') {
                return acc + (item.cantidad || 0) * (item.precio_unitario || 0);
            }
            return acc;
        }, 0);

        const totalCalc = subtotalCalc - (descuento || 0);
        return { subtotal: subtotalCalc, total: totalCalc };
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Formatear la fecha de emisión a YYYY-MM-DD
            const fecha_emision = values.fecha_emision ? values.fecha_emision.format('YYYY-MM-DD') : null;
            onOk({ ...values, fecha_emision }); // Incluir la fecha formateada
            form.resetFields();
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
                onValuesChange={(changedValues) => {
                    if (changedValues.productos || changedValues.descuento !== undefined) {
                        const productos = form.getFieldValue('productos') || [];
                        const descuento = form.getFieldValue('descuento') || 0;
                        const { subtotal, total } = updateTotals(productos, descuento);
                        setSubtotal(subtotal);
                        setTotal(total);
                        form.setFieldsValue({ subtotal, total });
                    }
                }}
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
                        <DatePicker className='w-full' placeholder='Seleccione la fecha' />
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
                                    <Space key={key}>
                                        <div className='flex mb-5'>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'cantidad']}
                                                label="Cantidad"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa la cantidad' }]}
                                                className='m-auto'
                                            >
                                                <InputNumber min={1} placeholder="Cantidad" className='w-[90%]' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'descripcion']}
                                                label="Descripción"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa la descripcion' }]}
                                                className='m-auto'
                                            >
                                                <Input min={0} placeholder="Descripcion" className='w-[90%]' />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'precio_unitario']}
                                                label="Precio Unitario"
                                                layout='vertical'
                                                rules={[{ required: true, message: 'Por favor ingresa el precio unitario' }]}
                                                className='m-auto'
                                            >
                                                <InputNumber min={0} placeholder="Precio unitario" className='w-[90%]' />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </div>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
                    <Input value={subtotal} />
                </Form.Item>
                <Form.Item name='total' hidden>
                    <Input value={total} />
                </Form.Item>
                <div>
                    <p>Subtotal: ${subtotal.toFixed(2)}</p>
                    <p>Total: ${total.toFixed(2)}</p>
                </div>
            </Form>
        </Modal>
    );
}
