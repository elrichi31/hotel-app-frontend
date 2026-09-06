import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import {
  User as UserIcon,
  IdCard,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  UserPlus,
} from 'lucide-react';
import { User } from '@/types/types';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';

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
      title={<ModalTitle icon={<UserIcon size={15} />}>{isEditMode ? 'Editar usuario' : 'Crear usuario'}</ModalTitle>}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        <Button
          key="back"
          style={{ borderRadius: 8 }}
          onClick={() => {
            form.resetFields();
            onCancel();
          }}
        >
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={isEditMode ? <Save size={14} /> : <UserPlus size={14} />}
          onClick={handleOk}
          style={{ borderRadius: 8 }}
        >
          {isEditMode ? 'Guardar' : 'Crear'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="first_name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            style={{ flex: 1 }}
          >
            <Input prefix={<UserIcon size={14} color={notion.inkFaint} />} placeholder="Nombre" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
            style={{ flex: 1 }}
          >
            <Input prefix={<UserIcon size={14} color={notion.inkFaint} />} placeholder="Apellido" />
          </Form.Item>
        </div>
        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
        >
          <Input prefix={<IdCard size={14} color={notion.inkFaint} />} placeholder="Nombre de usuario" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo Electrónico"
          rules={[{ required: true, type: 'email', message: 'Por favor ingrese un correo válido' }]}
        >
          <Input prefix={<Mail size={14} color={notion.inkFaint} />} placeholder="correo@ejemplo.com" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Selecciona un rol" suffixIcon={<ShieldCheck size={14} color={notion.inkFaint} />}>
              <Option value="admin">Admin</Option>
              <Option value="empleado">Empleado</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="Selecciona el estado" suffixIcon={<CheckCircle2 size={14} color={notion.inkFaint} />}>
              <Option value="activo">Activo</Option>
              <Option value="inactivo">Inactivo</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default UserModal;
