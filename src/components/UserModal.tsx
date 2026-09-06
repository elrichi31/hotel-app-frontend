import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Switch } from 'antd';
import {
  User as UserIcon,
  IdCard,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  UserPlus,
  BellRing,
} from 'lucide-react';
import { User } from '@/types/types';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';

const { Option } = Select;

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  color: notion.inkFaint,
  margin: '4px 0 12px 0',
};

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

/** Fila de switch con icono + descripción, para preferencias booleanas (más legible que un
 * Form.Item label + Switch suelto, y toda la fila es clickeable). */
const ToggleRow: React.FC<ToggleRowProps> = ({ icon, title, description, checked, onChange }) => (
  <div
    onClick={() => onChange?.(!checked)}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 14px',
      borderRadius: notion.radius,
      border: `1px solid ${notion.divider}`,
      background: notion.cardBg,
      cursor: 'pointer',
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 30,
        height: 30,
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(53, 149, 224, 0.12)',
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, color: notion.ink, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 12, color: notion.inkFaint, marginTop: 2, lineHeight: 1.5 }}>{description}</div>
    </div>
    <Switch checked={checked} onChange={onChange} onClick={(_, e) => e.stopPropagation()} />
  </div>
);

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
      <Form form={form} layout="vertical" initialValues={{ notificar_reservas: false }}>
        <p style={sectionLabelStyle}>Datos personales</p>
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
          name="email"
          label="Correo electrónico"
          rules={[{ required: true, type: 'email', message: 'Por favor ingrese un correo válido' }]}
        >
          <Input prefix={<Mail size={14} color={notion.inkFaint} />} placeholder="correo@ejemplo.com" />
        </Form.Item>

        <p style={sectionLabelStyle}>Acceso</p>
        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
        >
          <Input prefix={<IdCard size={14} color={notion.inkFaint} />} placeholder="Nombre de usuario" />
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

        <p style={sectionLabelStyle}>Notificaciones</p>
        <Form.Item name="notificar_reservas" valuePropName="checked" style={{ marginBottom: 4 }}>
          <ToggleRow
            icon={<BellRing size={16} color={notion.blue} />}
            title="Avisar de nuevas reservas"
            description="Recibirá un correo cada vez que un cliente genere una reserva en la aplicación."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
