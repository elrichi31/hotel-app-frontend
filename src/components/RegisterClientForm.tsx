"use client"
import React, { useState } from 'react';
import { Form, Input, Button, Steps, message } from 'antd';
import { useService } from '@/hooks/useService';

const { Item } = Form;
const { Step } = Steps;

const RegisterClientForm: React.FC = () => {
    const { registerClient } = useService();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<any>();

    const onFinishFirstStep = async (values: any) => {
        try {
            await registerClient({ setErrors, ...values });
            form.resetFields();
            setCurrentStep(1); // Avanzar al siguiente paso después de registrar el cliente
            message.success('Cliente registrado correctamente');
        } catch (error) {
            message.error('Error al registrar cliente');
        }
    };

    const handleValidation = async () => {
        try {
            // Implementa la lógica de validación aquí
            // Por ejemplo, validar la cédula y obtener la información del cliente
            const cedula = form.getFieldValue('cedula');

            // Simular una llamada a la API o servicio para validar la cédula
            // Aquí puedes hacer la lógica para verificar la cédula
            const validatedData = {
                first_name: 'Nombre',
                last_name: 'Apellido',
                email: 'correo@example.com',
                phone_number: '1234567890',
                address: 'Dirección 123',
            };

            // Rellenar el formulario con la información validada
            form.setFieldsValue(validatedData);
            setCurrentStep(1); // Avanzar al siguiente paso después de validar la cédula
            message.success('Cédula validada correctamente');
        } catch (error) {
            message.error('Error al validar la cédula');
        }
    };

    return (
        <div className=' flex flex-col'>
            <div className='mx-auto sm:mx-1'>
                <Steps current={currentStep} style={{ marginBottom: '24px'}}>
                    <Step title="Registrar Cliente" />
                    <Step title="Procesar venta" />
                    <Step title="Resumen" />
                </Steps>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={currentStep === 0 ? onFinishFirstStep : undefined}
                initialValues={{ remember: true }}
                style={{ width: '90%'}}
                className='mx-auto'
            >
                {currentStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Item
                                label="Nombre"
                                name="first_name"
                                rules={[{ required: true, message: '¡Por favor ingresa el nombre!' }]}
                                help={errors?.first_name}
                                validateStatus={errors?.first_name ? 'error' : undefined}
                                style={{ marginBottom: '16px', width: '50%' }}
                            >
                                <Input placeholder="Juan" />
                            </Item>

                            <Item
                                label="Apellido"
                                name="last_name"
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
                                name="phone_number"
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
                                    name="cedula"
                                    rules={[{ required: true, message: '¡Por favor ingresa la cédula!' }]}
                                    style={{ marginRight: '16px', marginBottom: '0' }}
                                    className='w-full'
                                >
                                    <Input placeholder="1700000000" />
                                </Item>

                                <Button type="primary" onClick={handleValidation}>
                                    Validar Cédula
                                </Button>
                            </div>
                        </div>

                        <Item
                            label="Dirección"
                            name="address"
                            rules={[{ required: true, message: '¡Por favor ingresa la dirección!' }]}
                            help={errors?.address}
                            validateStatus={errors?.address ? 'error' : undefined}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input placeholder="Av. Principal 123" />
                        </Item>
                        <Item>
                            <Button type="primary" htmlType="submit" block>
                                Siguiente
                            </Button>
                        </Item>
                    </div>
                )}

                {currentStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                        <Item
                            label="Campo del Segundo Formulario"
                            name="second_field"
                            rules={[{ required: true, message: '¡Por favor ingresa este campo!' }]}
                            style={{ marginBottom: '16px' }}
                        >
                            <Input placeholder="Campo del segundo formulario" />
                        </Item>

                        <Item>
                            <Button type="primary" htmlType="submit" block>
                                Finalizar Registro
                            </Button>
                        </Item>
                    </div>
                )}
            </Form>
        </div>
    );
};

export default RegisterClientForm;
