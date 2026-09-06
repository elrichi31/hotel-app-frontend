import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space } from 'antd';
import {
  MinusCircle,
  Plus,
  Hash,
  Home,
  CheckCircle2,
  UserSquare2,
  BedDouble,
  Save,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';

const { Option } = Select;

const RoomModal = ({ open, onCancel, onOk, room, edit }: any) => {
  const [form] = Form.useForm(); // Usar useForm para inicializar el formulario
  const modalTitle = edit ? `Editar habitación ${room?.numero}` : 'Crear nueva habitación';

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // Validar los campos del formulario
      onOk(values);
      form.resetFields(); // Resetear los campos del formulario después de enviar
      form.setFieldsValue(values); // Restaurar los valores del formulario
      return values;
    } catch (errorInfo) {
      console.log('Validation Failed:', errorInfo);
    }
  };

  return (
    <Modal
      open={open}
      title={<ModalTitle icon={<Home size={15} />}>{modalTitle}</ModalTitle>}
      cancelText="Cancelar"
      onCancel={onCancel}
      onOk={handleOk}
      okText={edit ? 'Guardar' : 'Crear'}
      okButtonProps={{ icon: edit ? <Save size={14} /> : <Plus size={14} />, style: { borderRadius: 8 } }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
      width={480}
    >
      <Form form={form} layout="vertical" initialValues={room}>
        <Section title="Datos generales">
          {!edit && (
            <Form.Item
              label="Número de habitación"
              name="numero"
              rules={[{ required: true, message: 'Por favor ingresa el número de habitación' }]}
            >
              <Input prefix={<Hash size={14} color={notion.inkFaint} />} placeholder="Ej. 101" />
            </Form.Item>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item
              label="Tipo de habitación"
              name="tipo"
              rules={[{ required: true, message: 'Por favor selecciona el tipo de habitación' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Selecciona el tipo" suffixIcon={<BedDouble size={14} color={notion.inkFaint} />}>
                <Option value="Regular">Regular</Option>
                <Option value="Suite">Suite</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Selecciona el estado" suffixIcon={<CheckCircle2 size={14} color={notion.inkFaint} />}>
                <Option value="Libre">Libre</Option>
                <Option value="Ocupado">Ocupado</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
          >
            <Input.TextArea rows={3} placeholder="Habitación doble en el piso 3, vista a la ciudad..." />
          </Form.Item>

          <Form.Item
            label="Número de camas"
            name="numero_camas"
            rules={[{ required: true, message: 'Por favor ingresa el número de camas' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber min={1} prefix={<UserSquare2 size={14} color={notion.inkFaint} />} style={{ width: '100%' }} />
          </Form.Item>
        </Section>

        <Section title="Precios por ocupación">
          <Form.List name="precios">
            {(fields, { add, remove }) => (
              <>
                {fields.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: notion.inkFaint }}>
                    <span style={{ flex: 1 }}>Personas</span>
                    <span style={{ flex: 1 }}>Precio</span>
                    <span style={{ width: 20 }} />
                  </div>
                )}
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 2, justifyContent: 'space-between' }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'numero_personas']}
                      rules={[{ required: true, message: 'Por favor ingresa el número de personas' }]}
                    >
                      <InputNumber min={1} placeholder="Personas" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'precio']}
                      rules={[{ required: true, message: 'Por favor ingresa el precio' }]}
                    >
                      <InputNumber min={0} placeholder="Precio" prefix="$" style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="text" danger size="small" icon={<MinusCircle size={14} />} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="dashed" onClick={() => add()} block icon={<Plus size={14} />}>
                    Agregar precio
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Section>
      </Form>
    </Modal>
  );
};

export default RoomModal;
