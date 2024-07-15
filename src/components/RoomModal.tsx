import React from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const RoomModal = ({ open, onCancel, onOk, room, edit }: any) => {
  const [form] = Form.useForm(); // Usar useForm para inicializar el formulario
  const modalTitle = edit ? `Editar Habitación ${room?.numero}` : 'Crear Nueva Habitación';

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
      title={modalTitle}
      okText={edit ? 'Guardar' : 'Crear'}
      cancelText="Cancelar"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical" initialValues={room}>
        {!edit && (
          <Form.Item
            label="Número de Habitación"
            name="numero"
            rules={[{ required: true, message: 'Por favor ingresa el número de habitación' }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item
          label="Tipo de Habitación"
          name="tipo"
          rules={[{ required: true, message: 'Por favor selecciona el tipo de habitación' }]}
        >
          <Select placeholder="Selecciona el tipo">
            <Option value="Regular">Regular</Option>
            <Option value="Suite">Suite</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado"
          name="estado"
          rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
        >
          <Select placeholder="Selecciona el estado">
            <Option value="Libre">Libre</Option>
            <Option value="Ocupado">Ocupado</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Número de Camas"
          name="numero_camas"
          rules={[{ required: true, message: 'Por favor ingresa el número de camas' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <h1>Precios</h1>

        <Form.List name="precios">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" className='items-center'>
                  <Form.Item
                    {...restField}
                    name={[name, 'numero_personas']}
                    label="Personas"
                    layout='horizontal'
                    rules={[{ required: true, message: 'Por favor ingresa el número de personas' }]}
                    className=''
                  >
                    <InputNumber min={1} placeholder="Número de Personas" className='w-[90%]' />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'precio']}
                    label="Precio"
                    layout='horizontal'
                    rules={[{ required: true, message: 'Por favor ingresa el precio' }]}
                  >
                    <InputNumber min={0} placeholder="Precio" className='w-[90%]'/>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)}/>
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Agregar Precio
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default RoomModal;
