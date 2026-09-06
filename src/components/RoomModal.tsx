import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button } from 'antd';
import {
  Trash2,
  Plus,
  Hash,
  Home,
  CheckCircle2,
  UserSquare2,
  BedDouble,
  Save,
  Wifi,
  Tv,
  Users,
  Briefcase,
  ShowerHead,
  Wallet,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';

const { Option } = Select;

/** Comodidad de sí/no que se muestra como chip compacto (no un Switch de fila completa). */
const AMENITY_CHIPS: { name: string; label: string; icon: React.ReactNode }[] = [
  { name: 'wifi', label: 'Wifi', icon: <Wifi size={13} /> },
  { name: 'tv_cable', label: 'TV por cable', icon: <Tv size={13} /> },
  { name: 'mesa_trabajo', label: 'Mesa de trabajo', icon: <Briefcase size={13} /> },
  { name: 'bano_privado', label: 'Baño privado', icon: <ShowerHead size={13} /> },
];

const AmenityChip = ({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      borderRadius: 8,
      border: `1px solid ${checked ? notion.blue : notion.divider}`,
      background: checked ? 'rgba(53, 149, 224, 0.12)' : 'transparent',
      color: checked ? notion.blue : notion.inkMuted,
      cursor: 'pointer',
      fontSize: 13,
      userSelect: 'none',
      transition: 'all 0.15s ease',
    }}
  >
    {icon}
    {label}
  </div>
);

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
      width={720}
    >
      <Form form={form} layout="vertical" initialValues={room} size="middle">
        <Section title="Datos generales">
          <div style={{ display: 'flex', gap: 12 }}>
            {!edit && (
              <Form.Item
                label="Número"
                name="numero"
                rules={[{ required: true, message: 'Ingresa el número' }]}
                style={{ flex: 1, marginBottom: 12 }}
              >
                <Input prefix={<Hash size={14} color={notion.inkFaint} />} placeholder="Ej. 101" />
              </Form.Item>
            )}

            <Form.Item
              label="Tipo de habitación"
              name="tipo"
              rules={[{ required: true, message: 'Selecciona el tipo' }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <Select placeholder="Tipo" suffixIcon={<BedDouble size={14} color={notion.inkFaint} />}>
                <Option value="Regular">Regular</Option>
                <Option value="Suite">Suite</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: 'Selecciona el estado' }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <Select placeholder="Estado" suffixIcon={<CheckCircle2 size={14} color={notion.inkFaint} />}>
                <Option value="Libre">Libre</Option>
                <Option value="Ocupado">Ocupado</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item
              label="Número de camas"
              name="numero_camas"
              rules={[{ required: true, message: 'Ingresa el número de camas' }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <InputNumber min={1} prefix={<UserSquare2 size={14} color={notion.inkFaint} />} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Tipo de cama"
              name="tipo_cama"
              rules={[{ required: true, message: 'Selecciona el tipo de cama' }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <Select placeholder="Tipo de cama" suffixIcon={<BedDouble size={14} color={notion.inkFaint} />}>
                <Option value="Una plaza">Una plaza</Option>
                <Option value="Dos plazas">Dos plazas</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Capacidad (personas)"
              name="capacidad"
              rules={[{ required: true, message: 'Ingresa la capacidad' }]}
              style={{ flex: 1, marginBottom: 12 }}
            >
              <InputNumber min={1} prefix={<Users size={14} color={notion.inkFaint} />} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            label="Descripción"
            name="descripcion"
            rules={[{ required: true, message: 'Ingresa la descripción' }]}
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea rows={2} placeholder="Habitación doble en el piso 3, vista a la ciudad..." />
          </Form.Item>
        </Section>

        <Section title="Comodidades">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {AMENITY_CHIPS.map((item) => (
              <Form.Item key={item.name} name={item.name} valuePropName="checked" noStyle>
                <AmenityChip icon={item.icon} label={item.label} checked={false} onChange={() => {}} />
              </Form.Item>
            ))}
          </div>

          <Form.Item label="Otras comodidades" name="amenidades" style={{ marginBottom: 0 }}>
            <Select
              mode="tags"
              placeholder="Ej. Aire acondicionado, Minibar, Balcón..."
              tokenSeparators={[',']}
              options={[]}
            />
          </Form.Item>
        </Section>

        <Section
          title="Precios por ocupación"
          extra={
            <span style={{ fontSize: 12, color: notion.inkFaint }}>Una tarifa por cada número de huéspedes</span>
          }
        >
          <Form.List name="precios">
            {(fields, { add, remove }) => {
              const nextPersonas = () => {
                const actuales: { numero_personas?: number }[] = form.getFieldValue('precios') || [];
                const usados = actuales.map((p) => p?.numero_personas).filter((n): n is number => !!n);
                return usados.length ? Math.max(...usados) + 1 : 1;
              };

              return (
                <>
                  {fields.length === 0 && (
                    <div
                      style={{
                        border: `1px dashed ${notion.divider}`,
                        borderRadius: 10,
                        padding: '18px 16px',
                        textAlign: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontSize: 13, color: notion.inkFaint }}>
                        Todavía no hay tarifas cargadas para esta habitación.
                      </div>
                    </div>
                  )}

                  {fields.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 6, paddingLeft: 4, fontSize: 12, color: notion.inkFaint }}>
                      <span style={{ flex: 1 }}>Huéspedes</span>
                      <span style={{ flex: 1 }}>Precio por noche</span>
                      <span style={{ width: 28 }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          background: notion.pageBg,
                          border: `1px solid ${notion.divider}`,
                          borderRadius: 10,
                          padding: 8,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'numero_personas']}
                          rules={[
                            { required: true, message: 'Ingresa el número de huéspedes' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value === undefined || value === null) return Promise.resolve();
                                const lista: { numero_personas?: number }[] = getFieldValue('precios') || [];
                                const repetidos = lista.filter((p) => p?.numero_personas === value).length;
                                return repetidos > 1
                                  ? Promise.reject(new Error('Ya existe una tarifa para este número de huéspedes'))
                                  : Promise.resolve();
                              },
                            }),
                          ]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <InputNumber
                            min={1}
                            max={20}
                            placeholder="Huéspedes"
                            prefix={<Users size={13} color={notion.inkFaint} />}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'precio']}
                          rules={[{ required: true, message: 'Ingresa el precio' }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            placeholder="Precio"
                            prefix={<Wallet size={13} color={notion.inkFaint} />}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={() => remove(name)}
                          style={{ marginTop: 2 }}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="dashed"
                    onClick={() => add({ numero_personas: nextPersonas() })}
                    block
                    icon={<Plus size={14} />}
                  >
                    Agregar tarifa
                  </Button>
                </>
              );
            }}
          </Form.List>
        </Section>
      </Form>
    </Modal>
  );
};

export default RoomModal;
