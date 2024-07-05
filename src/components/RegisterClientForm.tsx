"use client"
import React, { useState } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import ClientService from '@/services/ClientService';
import { useSession } from 'next-auth/react';

const { Item } = Form;

const RegisterClientForm = ({ handlePanelChange }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [errors, setErrors] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<any>();
    const [isValidated, setIsValidated] = useState(false);
    
    const onFinishFirstStep = async (values: any) => {
        try {
            if (session?.user?.token?.token) {
                if (isValidated){
                    const res = await ClientService.updateClient(client.id, values, session.user.token.token);
                    form.resetFields();
                    form.setFieldsValue({ 
                        nombre: values.nombre,
                        apellido: values.apellido,
                        email: values.email,
                        telefono: values.telefono,
                        direccion: values.direccion,
                        identificacion: values.identificacion,
                    });
                    handlePanelChange();
                    message.success('Cliente actualizado correctamente');
                } else {
                    const res = await ClientService.createClient(values, session.user.token.token);
                    form.resetFields();
                    form.setFieldsValue({ 
                        nombre: values.nombre,
                        apellido: values.apellido,
                        email: values.email,
                        telefono: values.telefono,
                        direccion: values.direccion,
                        identificacion: values.identificacion,
                    });
                    handlePanelChange();
                    setIsValidated(true);
                    message.success('Cliente registrado correctamente');
                }
            }
        } catch (error) {
            console.error('Error creating client:', error);
            message.error('Error al registrar cliente');
        }
    };

    const handleValidation = async () => {
        try {
            if (session?.user?.token?.token) {
                const token = session.user.token.token;
                setLoading(true); // Activar el estado de carga al iniciar la validación
                const cedula = form.getFieldValue('identificacion');
                const client = await ClientService.getClientByCedula(cedula, token);
                if (client) {
                    form.setFieldsValue({
                        nombre: client?.nombre,
                        apellido: client?.apellido,
                        email: client.email,
                        telefono: client.telefono,
                        direccion: client.direccion,
                        identidicacion: client.identificacion, 
                    });
                    handlePanelChange(); // Avanzar al siguiente paso después de validar la cédula
                    setClient(client);
                    setIsValidated(true);
                    message.success('Cédula validada correctamente');
                } else {
                    message.warning('No se encontró ningún cliente con esta cédula');
                }
            }
        } catch (error: any) {
            message.error(error.message || 'Error al validar la cédula');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinishFirstStep}
            initialValues={{ remember: true }}
            style={{ width: '95%' }}
            className='mx-auto'
        >
            <div className='mb-5'>
                <Alert message="IMPORTANTE: Antes de ingresar un cliente nuevo por favor valide la cédula. En caso de que no exista el cliente, proceda con el ingreso del usuario." type="warning" showIcon closable />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Item
                        label="Nombre"
                        name="nombre"
                        rules={[{ required: true, message: '¡Por favor ingresa el nombre!' }]}
                        help={errors?.first_name}
                        validateStatus={errors?.first_name ? 'error' : undefined}
                        style={{ marginBottom: '16px', width: '50%' }}
                    >
                        <Input placeholder="Juan" />
                    </Item>

                    <Item
                        label="Apellido"
                        name="apellido"
                        rules={[{ required: true, message: '¡Por favor ingresa el apellido!' }]}
                        help={errors?.last_name}
                        validateStatus={errors?.last_name ? 'error' : undefined}
                        style={{ marginBottom: '16px', width: '48%' }}
                    >
                        <Input placeholder="Pérez" />
                    </Item>
                </div>

                <Item
                    label="Correo Electrónico"
                    name="email"
                    rules={[
                        { required: true, message: '¡Por favor ingresa el correo electrónico!' },
                        { type: 'email', message: '¡Por favor ingresa un correo válido!' },
                    ]}
                    help={errors?.email}
                    validateStatus={errors?.email ? 'error' : undefined}
                    style={{ marginBottom: '16px' }}
                >
                    <Input placeholder="correo@example.com" />
                </Item>

                <div style={{ display: 'flex', justifyContent: 'space-between' }} className='flex-col sm:flex-row'>
                    <Item
                        label="Teléfono"
                        name="telefono"
                        rules={[{ required: true, message: '¡Por favor ingresa el teléfono!' }]}
                        help={errors?.phone_number}
                        validateStatus={errors?.phone_number ? 'error' : undefined}
                        style={{ marginBottom: '16px' }}
                        className='w-full sm:w-1/2'
                    >
                        <Input placeholder="1234567890" />
                    </Item>

                    <div style={{ display: 'flex', alignItems: 'end', marginBottom: '16px' }} className='w-full sm:w-[48%]'>
                        <Item
                            label="Cédula"
                            name="identificacion"
                            rules={[{ required: true, message: '¡Por favor ingresa la cédula!' }]}
                            style={{ marginRight: '16px', marginBottom: '0' }}
                            className='w-full'
                        >
                            <Input placeholder="1700000000" />
                        </Item>

                        <Button type="primary" onClick={handleValidation} loading={loading}>
                            Validar Cédula
                        </Button>
                    </div>
                </div>

                <Item
                    label="Dirección"
                    name="direccion"
                    rules={[{ required: true, message: '¡Por favor ingresa la dirección!' }]}
                    help={errors?.address}
                    validateStatus={errors?.address ? 'error' : undefined}
                    style={{ marginBottom: '16px' }}
                >
                    <Input placeholder="Av. Principal 123" />
                </Item>

                <Item>
                    <Button type="primary" htmlType="submit" block>
                        {isValidated ? 'Actualizar Cliente' : 'Registrar Cliente'}
                    </Button>
                </Item>
            </div>
        </Form>
    );
};

export default RegisterClientForm;
