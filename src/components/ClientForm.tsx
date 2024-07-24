'use client'
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Alert, Select } from 'antd';
import ClientService from '@/services/ClientService';
import { useSession } from 'next-auth/react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Client } from '@/types/types';

const { Item } = Form;
const { Option } = Select;

const ClientForm = ({ personas, updateClientIds, handlePanelChange }: any) => {
    const { data: session } = useSession();
    const [form] = Form.useForm();
    const [errors, setErrors] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [validatedClients, setValidatedClients] = useState<Record<number, boolean>>({});
    const [clientIds, setClientIds] = useState<number[]>([]);
    const [disabledButtons, setDisabledButtons] = useState<Record<number, boolean>>({});

    useEffect(() => {
        updateClientIds(clientIds);
    }, [clientIds, updateClientIds]);

    if (personas) {
        useEffect(() => {
            const initialValues = {
                users: personas.map((persona: any) => ({
                    nombre: persona.nombre,
                    apellido: persona.apellido,
                    tipo_documento: persona.tipo_documento,
                    numero_documento: persona.numero_documento,
                    ciudadania: persona.ciudadania,
                    procedencia: persona.procedencia,
                    id: persona.id,
                }))
            };
            form.setFieldsValue(initialValues);
            setClientIds(personas.map((persona: any) => persona.id));

            // Deshabilitar botones de validar para usuarios ya cargados
            const initialDisabledButtons = personas.reduce((acc: Record<number, boolean>, persona: any) => {
                acc[persona.id] = true; // Deshabilitar botón para cada usuario cargado inicialmente
                return acc;
            }, {});
            setDisabledButtons(initialDisabledButtons);
        }, [personas, form]);
    }

    const onFinish = async (index: number) => {
        try {
            if (session?.user?.token?.token) {
                const clientsData = form.getFieldsValue();
                const data: Client = clientsData.users[index];
                const parsedClients = {
                    personas: [data]
                };
                if (validatedClients[data.id] || personas) {
                    const res = await ClientService.updateClient(data.id as number, data, session.user.token.token);
                    console.log('Cliente actualizado:', res);
                    message.success('Cliente actualizado correctamente');
                } else {
                    const newClientResponse: any = await ClientService.createClient(parsedClients, session.user.token.token);
                    const newClientId = newClientResponse[0].id;
                    const fieldsValue = form.getFieldsValue();
                    fieldsValue.users[index].id = newClientId;
                    form.setFieldsValue(fieldsValue);
                    setValidatedClients({ ...validatedClients, [newClientId]: true });
                    setClientIds((prevIds) => [...prevIds, newClientId]);
                    console.log('Cliente registrado:', newClientResponse[0]);
                    message.success('Cliente registrado correctamente');
                }
                if (handlePanelChange) {
                    handlePanelChange()
                }
                setDisabledButtons({ ...disabledButtons, [data.id]: true });
            }
        } catch (error) {
            console.error('Error creando/actualizando clientes:', error);
            message.error('Error al registrar cliente');
        }
    };

    const handleValidation = async (index: number) => {
        try {
            if (session?.user?.token?.token) {
                const token = session.user.token.token;
                setLoading(true);
                const cedula = form.getFieldValue(['users', index, 'numero_documento']);
                const client: Client = await ClientService.getClientByCedula(cedula, token);
                if (client) {
                    const fieldsValue = form.getFieldsValue();
                    fieldsValue.users[index] = {
                        ...fieldsValue.users[index],
                        nombre: client?.nombre,
                        apellido: client?.apellido,
                        tipo_documento: client?.tipo_documento,
                        numero_documento: client?.numero_documento,
                        ciudadania: client?.ciudadania,
                        procedencia: client?.procedencia,
                        id: client?.id,
                    };
                    form.setFieldsValue(fieldsValue);
                    setValidatedClients({ ...validatedClients, [client.id]: true });
                    setClientIds((prevIds: any) => [...prevIds, client.id]);
                    if (handlePanelChange) {
                        handlePanelChange()
                    }
                    message.success('Cédula validada correctamente');
                    setDisabledButtons({ ...disabledButtons, [client.id]: true });
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

    const handleRemove = (index: number) => {
        const userId = form.getFieldValue(['users', index, 'id']);
        console.log('User ID:', userId);
        const updatedClientIds = [...clientIds];
        updatedClientIds.splice(index, 1);
        setClientIds(updatedClientIds);

        const updatedDisabledButtons = { ...disabledButtons };
        delete updatedDisabledButtons[0];
        setDisabledButtons(updatedDisabledButtons);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{ remember: true }}
            className='mx-auto w-[95%]'
        >
            {
                personas ?
                    <h2 className='text-lg mb-3'>Editar Clientes</h2> :
                    <div className='mb-5'>
                        <Alert message="IMPORTANTE: Antes de ingresar un cliente nuevo por favor valide la cédula. En caso de que no exista el cliente, proceda con el ingreso del usuario." type="warning" showIcon closable />
                    </div>
            }

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

                                    <div className='flex flex-col md:flex-row items-start md:items-center'>
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
                                        <Button
                                            type="primary"
                                            className='mb-5 md:mb-0 md:mt-1'
                                            onClick={() => handleValidation(index)}
                                            loading={loading}
                                            disabled={disabledButtons[form.getFieldValue(['users', index, 'id'])]}
                                        >
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
                                        <Item
                                            {...restField}
                                            name={[name, 'id']}
                                            hidden={true}
                                        >
                                            <Input />
                                        </Item>
                                    </div>
                                </div>
                                <div className='flex flex-col md:flex-row space-y-3 md:space-x-5 md:space-y-0'>
                                    <Button type="primary" htmlType="submit" loading={loading} onClick={() => { onFinish(index) }}>
                                        {validatedClients[form.getFieldValue(['users', index, 'id'])] || personas ? 'Actualizar Cliente' : 'Registrar Cliente'}
                                    </Button>
                                    <Button type='dashed' danger className='flex' onClick={() => { remove(name); handleRemove(index); }} >
                                        <MinusCircleOutlined />
                                        <p>Eliminar persona</p>
                                    </Button>
                                </div>
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

            <div>
                <h3 className='mt-4'>IDs de Clientes Validados/Registrados:</h3>
                <ul>
                    {clientIds.map((id) => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
            </div>
        </Form>
    );
};

export default ClientForm;
