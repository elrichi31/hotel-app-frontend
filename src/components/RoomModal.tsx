import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

const RoomModal = ({ open, onCancel, onOk, room, edit }: any) => {
    const [form] = Form.useForm();

    const modalTitle = edit ? `Editar Habitación ${room.numero}` : 'Crear Nueva Habitación';

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                form.resetFields();
                onOk(values);
            })
            .catch((errorInfo) => {
                console.log('Validation Failed:', errorInfo);
            });
    };

    return (
        <Modal
            visible={open}
            title={modalTitle}
            okText={edit ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            onCancel={onCancel}
            onOk={handleOk}
        >
            <Form form={form} layout="vertical" initialValues={room}>
                {!edit && (
                    <Form.Item label="Número de Habitación" name="numero" rules={[{ required: true, message: 'Por favor ingresa el número de habitación' }]}>
                        <Input />
                    </Form.Item>
                )}

                <Form.Item label="Tipo de Habitación" name="tipo" rules={[{ required: true, message: 'Por favor selecciona el tipo de habitación' }]}>
                    <Select placeholder="Selecciona el tipo">
                        <Option value="Simple">Simple</Option>
                        <Option value="Doble">Doble</Option>
                        <Option value="Triple">Triple</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Precio" name="precio" rules={[{ required: true, message: 'Por favor ingresa el precio' }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Estado" name="estado" rules={[{ required: true, message: 'Por favor selecciona el estado' }]}>
                    <Select placeholder="Selecciona el estado">
                        <Option value="Libre">Libre</Option>
                        <Option value="Ocupado">Ocupado</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Descripción" name="descripcion" rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}>
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item label="Número de Camas" name="numero_camas" rules={[{ required: true, message: 'Por favor ingresa el número de camas' }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoomModal;
