"use client"
import React, { useState } from 'react';
import { Form, Input, Button, message, Alert, Space, Select } from 'antd';
import ClientService from '@/services/ClientService';
import { useSession } from 'next-auth/react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Item } = Form;
const { Option } = Select;

const RegisterClientForm = ({ handlePanelChange, newClient }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [errors, setErrors] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<any>();
    const [isValidated, setIsValidated] = useState(false);

    const onFinish = async (values: any) => {
        try {
            if (session?.user?.token?.token) {
                const clientsData = values.users;
                if (isValidated) {
                    const updatedClients = await Promise.all(
                        clientsData.map((clientData: any) =>
                            ClientService.updateClient(clientData.id, clientData, session.user.token.token)
                        )
                    );
                    message.success('Clientes actualizados correctamente');
                } else {
                    const parsedClients = {
                        personas: clientsData
                    }
                    console.log(parsedClients)
                    const newClients = await ClientService.createClient(parsedClients, session.user.token.token);
                    message.success('Clientes registrados correctamente');
                }
                form.resetFields();
                handlePanelChange();
                newClient(clientsData);
            }
        } catch (error) {
            console.error('Error creando/actualizando clientes:', error);
            message.error('Error al registrar clientes');
        }
    };

    const handleValidation = async (index: number) => {
        try {
            if (session?.user?.token?.token) {
                const token = session.user.token.token;
                setLoading(true);
                const cedula = form.getFieldValue(['users', index, 'numero_documento']);
                const client = await ClientService.getClientByCedula(cedula, token);
                if (client) {
                    const fieldsValue = form.getFieldsValue();
                    fieldsValue.users[index] = {
                        ...fieldsValue.users[index],
                        nombre: client?.nombre,
                        apellido: client?.apellido,
                        tipo_documento: client?.tipo_documento,
                        numero_documento: client?.numero_documento,
                        ciudadania: client?.ciudadania,
                        procedencia: client?.procedencia
                        
                    };
                    form.setFieldsValue(fieldsValue);
                    setClient(client);
                    setIsValidated(true);
                    newClient(client);
                    handlePanelChange()
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
            onFinish={onFinish}
            initialValues={{ remember: true }}
            className='mx-auto w-[90%]'
        >
            <div className='mb-5'>
                <Alert message="IMPORTANTE: Antes de ingresar un cliente nuevo por favor valide la cédula. En caso de que no exista el cliente, proceda con el ingreso del usuario." type="warning" showIcon closable />
            </div>

            <Form.List name="users">
                {(fields, { add, remove }) => (
                    <div className='w-full'>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key} className='items-center mb-10'>
                                <div className='w-full'>
                                    <div className='flex'>
                                        <Item
                                            {...restField}
                                            label="Nombre"
                                            name={[name, 'nombre']}
                                            rules={[{ required: true, message: '¡Por favor ingresa el nombre!' }]}
                                            help={errors?.first_name}
                                            validateStatus={errors?.first_name ? 'error' : undefined}
                                            className='w-[50%] mr-5'
                                        >
                                            <Input placeholder="Juan" />
                                        </Item>
                                        <Item
                                            {...restField}
                                            label="Apellido"
                                            name={[name, 'apellido']}
                                            rules={[{ required: true, message: '¡Por favor ingresa el apellido!' }]}
                                            help={errors?.last_name}
                                            validateStatus={errors?.last_name ? 'error' : undefined}
                                            className='w-[50%]'
                                        >
                                            <Input placeholder="Pérez" />
                                        </Item>
                                    </div>

                                    <div className='flex'>
                                        <Item
                                            {...restField}
                                            label="Tipo de documento"
                                            name={[name, 'tipo_documento']}
                                            rules={[{ required: true, message: '¡Por favor ingresa el tipo de documento!' }]}
                                            help={errors?.tipo_documento}
                                            validateStatus={errors?.tipo_documento ? 'error' : undefined}
                                            className='w-full'
                                        >
                                            <Select placeholder="Selecciona el tipo">
                                                <Option value="cedula">Cedula</Option>
                                                <Option value="pasaporte">Pasaporte</Option>
                                            </Select>
                                        </Item>
                                    </div>

                                    <div className='flex sm:flex items-center'>
                                        <Item
                                            {...restField}
                                            label="Nro de documento"
                                            name={[name, 'numero_documento']}
                                            rules={[{ required: true, message: '¡Por favor ingresa el número de documento!' }]}
                                            help={errors?.numero_documento}
                                            validateStatus={errors?.numero_documento ? 'error' : undefined}
                                            className='mr-5 w-full'
                                        >
                                            <Input placeholder="1234567890" />
                                        </Item>
                                        <Button type="primary" className='' onClick={() => handleValidation(index)} loading={loading}>
                                            Validar Cédula
                                        </Button>
                                    </div>

                                    <div className='flex'>
                                        <Item
                                            {...restField}
                                            label="Ciudadanía"
                                            name={[name, 'ciudadania']}
                                            rules={[{ required: true, message: '¡Por favor ingresa la ciudadanía!' }]}
                                            help={errors?.ciudadania}
                                            validateStatus={errors?.ciudadania ? 'error' : undefined}
                                            className='w-[50%] mr-5'
                                        >
                                            <Input placeholder="Ecuador" />
                                        </Item>
                                        <Item
                                            {...restField}
                                            label="Procedencia"
                                            name={[name, 'procedencia']}
                                            rules={[{ required: true, message: '¡Por favor ingresa la procedencia!' }]}
                                            help={errors?.procedencia}
                                            validateStatus={errors?.procedencia ? 'error' : undefined}
                                            className='w-[50%]'
                                        >
                                            <Input placeholder="Colombia" />
                                        </Item>
                                    </div>
                                </div>
                                <Button type='dashed' danger className='flex h-[100%] w-full' onClick={() => remove(name)} >
                                    <MinusCircleOutlined />
                                    <p>Eliminar persona</p>
                                </Button>
                            </div>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Agregar Cliente
                            </Button>
                        </Form.Item>
                    </div>
                )}
            </Form.List>

            <Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {isValidated ? 'Actualizar Clientes' : 'Registrar Clientes'}
                </Button>
            </Item>
        </Form>
    );
};

export default RegisterClientForm;
