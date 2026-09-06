"use client";
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Tag } from 'antd';
import {
  Search,
  User,
  IdCard,
  Globe,
  Compass,
  UserPlus,
  Save,
} from 'lucide-react';
import ClientService from '@/services/ClientService';
import { Client } from '@/types/types';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';

const { Item } = Form;
const { Option } = Select;

/**
 * Alta/edición de un cliente para una venta. Sin fila en edición (`initial`
 * ausente) primero se valida la cédula: si el cliente ya existe se enlaza
 * sin duplicarlo; si no, se completa el resto y se crea.
 */
export default function ClientModal({
  open,
  onCancel,
  onSubmit,
  initial,
  token,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (client: Client) => void;
  initial: Client | null;
  token: string;
}) {
  const [form] = Form.useForm();
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);

  const editando = !!initial;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setExistingId(initial?.id ?? null);
    if (initial) form.setFieldsValue(initial);
  }, [open, initial, form]);

  const handleValidar = async () => {
    const cedula = form.getFieldValue('numero_documento');
    if (!cedula) {
      message.warning('Ingresa el número de documento primero');
      return;
    }
    setValidating(true);
    try {
      const cliente = await ClientService.getClientByCedula(cedula, token);
      form.setFieldsValue(cliente);
      setExistingId(cliente.id);
      message.success('Cliente encontrado: se enlazará sin duplicarlo');
    } catch (error: any) {
      setExistingId(null);
      message.info(error.message || 'No se encontró ningún cliente con esta cédula. Completa sus datos para crearlo.');
    } finally {
      setValidating(false);
    }
  };

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      if (existingId) {
        const updated = await ClientService.updateClient(existingId, values, token);
        onSubmit({ ...updated, id: existingId } as Client);
        message.success(editando ? 'Cliente actualizado' : 'Cliente enlazado a la venta');
      } else {
        const payload = { personas: [values] };
        const created: any = await ClientService.createClient(payload, token);
        const nuevo = Array.isArray(created) ? created[0] : created;
        onSubmit(nuevo);
        message.success('Cliente creado y agregado');
      }
    } catch (error: any) {
      message.error(error.message || 'Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<ModalTitle icon={<User size={15} />}>{editando ? 'Editar cliente' : 'Agregar cliente'}</ModalTitle>}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]} style={{ flex: 1 }}>
            <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Juan" />
          </Item>
          <Item name="apellido" label="Apellido" rules={[{ required: true, message: 'Ingresa el apellido' }]} style={{ flex: 1 }}>
            <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Pérez" />
          </Item>
        </div>

        <Item name="tipo_documento" label="Tipo de documento" rules={[{ required: true, message: 'Selecciona el tipo' }]}>
          <Select placeholder="Selecciona el tipo" suffixIcon={<IdCard size={14} color={notion.inkFaint} />}>
            <Option value="cedula">Cédula</Option>
            <Option value="pasaporte">Pasaporte</Option>
          </Select>
        </Item>

        {/* El botón va fuera del Item: Form.Item solo clona a su hijo directo,
            envolverlo junto al botón le rompía el id y la propagación de valor. */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Item
            name="numero_documento"
            label="Nro de documento"
            rules={[{ required: true, message: 'Ingresa el número de documento' }]}
            extra={
              !editando && existingId ? (
                <Tag color="blue" style={{ marginTop: 6 }}>Cliente existente, se enlazará sin duplicarlo</Tag>
              ) : undefined
            }
            style={{ flex: 1 }}
          >
            <Input prefix={<IdCard size={14} color={notion.inkFaint} />} placeholder="1234567890" onChange={() => setExistingId(null)} />
          </Item>
          {!editando && (
            <Button
              icon={<Search size={14} />}
              loading={validating}
              onClick={handleValidar}
              style={{ marginTop: 30, borderRadius: 8 }}
            >
              Validar
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Item name="ciudadania" label="Ciudadanía" rules={[{ required: true, message: 'Ingresa la ciudadanía' }]} style={{ flex: 1 }}>
            <Input prefix={<Globe size={14} color={notion.inkFaint} />} placeholder="Ecuador" />
          </Item>
          <Item name="procedencia" label="Procedencia" rules={[{ required: true, message: 'Ingresa la procedencia' }]} style={{ flex: 1 }}>
            <Input prefix={<Compass size={14} color={notion.inkFaint} />} placeholder="Colombia" />
          </Item>
        </div>

        <Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={saving}
            icon={editando ? <Save size={16} /> : <UserPlus size={16} />}
            style={{ borderRadius: 8 }}
          >
            {editando ? 'Guardar cambios' : existingId ? 'Agregar cliente' : 'Crear y agregar'}
          </Button>
        </Item>
      </Form>
    </Modal>
  );
}
