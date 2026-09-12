"use client";
import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Input, Select, SelectItem, Button, Chip } from '@heroui/react';
import { z } from 'zod';
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
import { toast } from '@/lib/toast';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';

const clientSchema = z.object({
  nombre: z.string().min(1, 'Ingresa el nombre'),
  apellido: z.string().min(1, 'Ingresa el apellido'),
  tipo_documento: z.string().min(1, 'Selecciona el tipo'),
  numero_documento: z.string().min(1, 'Ingresa el número de documento'),
  ciudadania: z.string().min(1, 'Ingresa la ciudadanía'),
  procedencia: z.string().min(1, 'Ingresa la procedencia'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const emptyValues: ClientFormValues = {
  nombre: '',
  apellido: '',
  tipo_documento: '',
  numero_documento: '',
  ciudadania: '',
  procedencia: '',
};

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
  const { control, handleSubmit, reset, getValues, setValue } = useZodForm(clientSchema, {
    defaultValues: emptyValues,
  });
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);

  const editando = !!initial;

  useEffect(() => {
    if (!open) return;
    setExistingId(initial?.id ?? null);
    reset(initial ?? emptyValues);
  }, [open, initial, reset]);

  const handleValidar = async () => {
    const cedula = getValues('numero_documento');
    if (!cedula) {
      toast.warning('Ingresa el número de documento primero');
      return;
    }
    setValidating(true);
    try {
      const cliente = await ClientService.getClientByCedula(cedula, token);
      reset(cliente);
      setExistingId(cliente.id);
      toast.success('Cliente encontrado: se enlazará sin duplicarlo');
    } catch (error: any) {
      setExistingId(null);
      toast.info(error.message || 'No se encontró ningún cliente con esta cédula. Completa sus datos para crearlo.');
    } finally {
      setValidating(false);
    }
  };

  const handleFinish = async (values: ClientFormValues) => {
    setSaving(true);
    try {
      if (existingId) {
        const updated = await ClientService.updateClient(existingId, values, token);
        onSubmit({ ...updated, id: existingId } as Client);
        toast.success(editando ? 'Cliente actualizado' : 'Cliente enlazado a la venta');
      } else {
        const payload = { personas: [values] };
        const created: any = await ClientService.createClient(payload, token);
        const nuevo = Array.isArray(created) ? created[0] : created;
        onSubmit(nuevo);
        toast.success('Cliente creado y agregado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onCancel()} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <ModalTitle icon={<User size={15} />}>{editando ? 'Editar cliente' : 'Agregar cliente'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(handleFinish)}>
            <div style={{ display: 'flex', gap: 12 }}>
              <FormField
                control={control}
                name="nombre"
                render={(field) => (
                  <Input {...field} label="Nombre" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Juan" className="flex-1" />
                )}
              />
              <FormField
                control={control}
                name="apellido"
                render={(field) => (
                  <Input {...field} label="Apellido" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Pérez" className="flex-1" />
                )}
              />
            </div>

            <FormField
              control={control}
              name="tipo_documento"
              render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                <Select
                  label="Tipo de documento"
                  placeholder="Selecciona el tipo"
                  selectedKeys={value ? [value] : []}
                  onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                  onBlur={onBlur}
                  isInvalid={isInvalid}
                  errorMessage={errorMessage}
                  startContent={<IdCard size={14} color={notion.inkFaint} />}
                  className="mt-4"
                >
                  <SelectItem key="cedula">Cédula</SelectItem>
                  <SelectItem key="pasaporte">Pasaporte</SelectItem>
                </Select>
              )}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <FormField
                  control={control}
                  name="numero_documento"
                  render={(field) => (
                    <Input
                      {...field}
                      label="Nro de documento"
                      startContent={<IdCard size={14} color={notion.inkFaint} />}
                      placeholder="1234567890"
                      onChange={(e) => {
                        field.onChange(e);
                        setExistingId(null);
                      }}
                    />
                  )}
                />
                {!editando && existingId && (
                  <Chip color="primary" variant="flat" size="sm" className="mt-1.5">
                    Cliente existente, se enlazará sin duplicarlo
                  </Chip>
                )}
              </div>
              {!editando && (
                <Button
                  startContent={<Search size={14} />}
                  isLoading={validating}
                  onPress={handleValidar}
                  className="mt-1"
                >
                  Validar
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <FormField
                control={control}
                name="ciudadania"
                render={(field) => (
                  <Input {...field} label="Ciudadanía" startContent={<Globe size={14} color={notion.inkFaint} />} placeholder="Ecuador" className="flex-1" />
                )}
              />
              <FormField
                control={control}
                name="procedencia"
                render={(field) => (
                  <Input {...field} label="Procedencia" startContent={<Compass size={14} color={notion.inkFaint} />} placeholder="Colombia" className="flex-1" />
                )}
              />
            </div>

            <Button
              type="submit"
              color="primary"
              fullWidth
              isLoading={saving}
              startContent={editando ? <Save size={16} /> : <UserPlus size={16} />}
              className="mt-4"
            >
              {editando ? 'Guardar cambios' : existingId ? 'Agregar cliente' : 'Crear y agregar'}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
