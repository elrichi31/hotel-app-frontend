import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { User } from '@/types/types';

const { Option } = Select;

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<User>) => void;
  user?: User | null;
  isEditMode: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ visible, onCancel, onOk, user, isEditMode }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
      form.resetFields();
    } catch (error) {
      // Handle validation error
    }
  };

  return (
    <Modal
      visible={visible}
      title={isEditMode ? "Editar Usuario" : "Crear Usuario"}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button key="back" onClick={() => {
          form.resetFields();
          onCancel();
        }}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {isEditMode ? "Guardar" : "Crear"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="first_name"
          label="Nombre"
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="last_name"
          label="Apellido"
          rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo Electrónico"
          rules={[{ required: true, type: 'email', message: 'Por favor ingrese un correo válido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="role"
          label="Rol"
          rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
        >
          <Select>
            <Option value="admin">Admin</Option>
            <Option value="empleado">Empleado</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Estado"
          rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
        >
          <Select>
            <Option value="activo">Activo</Option>
            <Option value="inactivo">Inactivo</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
