"use client";
import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { useService } from '@/hooks/useService';

const { Item } = Form;

const RegisterClientForm: React.FC = () => {
    const { registerClient } = useService();
    const [form] = Form.useForm();
    const [errors, setErrors] = useState<any>();

    const onFinish = async (values: any) => {
        try {
            await registerClient({ setErrors, ...values });
            form.resetFields();
        } catch (error) {
            message.error('Failed to register client');
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ remember: true }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Item
                        label="First Name"
                        name="first_name"
                        rules={[{ required: true, message: 'Please input the first name!' }]}
                        help={errors?.first_name}
                        validateStatus={errors?.first_name ? 'error' : undefined}
                    >
                        <Input />
                    </Item>
                </Col>
                <Col span={12}>
                    <Item
                        label="Last Name"
                        name="last_name"
                        rules={[{ required: true, message: 'Please input the last name!' }]}
                        help={errors?.last_name}
                        validateStatus={errors?.last_name ? 'error' : undefined}
                    >
                        <Input />
                    </Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                        help={errors?.email}
                        validateStatus={errors?.email ? 'error' : undefined}
                    >
                        <Input />
                    </Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Item
                        label="Phone Number"
                        name="phone_number"
                        rules={[{ required: true, message: 'Please input the phone number!' }]}
                        help={errors?.phone_number}
                        validateStatus={errors?.phone_number ? 'error' : undefined}
                    >
                        <Input />
                    </Item>
                </Col>
                <Col span={12}>
                    <Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Please input the address!' }]}
                        help={errors?.address}
                        validateStatus={errors?.address ? 'error' : undefined}
                    >
                        <Input />
                    </Item>
                </Col>
            </Row>

            <Item>
                <Button type="primary" htmlType="submit" block>
                    Register Client
                </Button>
            </Item>
        </Form>
    );
};

export default RegisterClientForm;
