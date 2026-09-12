import React, { useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Button, Chip } from '@heroui/react';
import { z } from 'zod';
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
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';
import type { Room } from '@/types/types';

/** Comodidad de sí/no que se muestra como chip compacto (no un Switch de fila completa). */
const AMENITY_CHIPS: { name: 'wifi' | 'tv_cable' | 'mesa_trabajo' | 'bano_privado'; label: string; icon: React.ReactNode }[] = [
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

/** Entrada de tags de texto libre: reemplaza el Select `mode="tags"` de antd, que no tiene equivalente en HeroUI. */
const TagsInput = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        border: `1px solid ${notion.divider}`,
        borderRadius: 8,
        background: notion.pageBg,
      }}
    >
      {value.map((tag) => (
        <Chip key={tag} size="sm" variant="flat" onClose={() => onChange(value.filter((t) => t !== tag))}>
          {tag}
        </Chip>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={addTag}
        placeholder={value.length ? '' : 'Ej. Aire acondicionado, Minibar, Balcón...'}
        style={{
          flex: 1,
          minWidth: 160,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: notion.ink,
          fontSize: 14,
        }}
      />
    </div>
  );
};

const precioSchema = z.object({
  numero_personas: z.coerce.number({ message: 'Ingresa el número de huéspedes' }).min(1, 'Ingresa el número de huéspedes'),
  precio: z.coerce.number({ message: 'Ingresa el precio' }).min(0, 'Ingresa el precio'),
});

const roomSchema = z
  .object({
    numero: z.string().min(1, 'Ingresa el número'),
    tipo: z.string().min(1, 'Selecciona el tipo'),
    estado: z.string().min(1, 'Selecciona el estado'),
    numero_camas: z.coerce.number({ message: 'Ingresa el número de camas' }).min(1, 'Ingresa el número de camas'),
    tipo_cama: z.string().min(1, 'Selecciona el tipo de cama'),
    capacidad: z.coerce.number({ message: 'Ingresa la capacidad' }).min(1, 'Ingresa la capacidad'),
    descripcion: z.string().min(1, 'Ingresa la descripción'),
    wifi: z.boolean(),
    tv_cable: z.boolean(),
    mesa_trabajo: z.boolean(),
    bano_privado: z.boolean(),
    amenidades: z.array(z.string()),
    precios: z.array(precioSchema),
  })
  .superRefine((data, ctx) => {
    const counts = new Map<number, number>();
    data.precios.forEach((p) => counts.set(p.numero_personas, (counts.get(p.numero_personas) ?? 0) + 1));
    data.precios.forEach((p, i) => {
      if ((counts.get(p.numero_personas) ?? 0) > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ya existe una tarifa para este número de huéspedes',
          path: ['precios', i, 'numero_personas'],
        });
      }
    });
  });

type RoomFormValues = z.infer<typeof roomSchema>;

const emptyValues: RoomFormValues = {
  numero: '',
  tipo: '',
  estado: '',
  numero_camas: 0,
  tipo_cama: '',
  capacidad: 0,
  descripcion: '',
  wifi: false,
  tv_cable: false,
  mesa_trabajo: false,
  bano_privado: false,
  amenidades: [],
  precios: [],
};

const RoomModal = ({
  open,
  onCancel,
  onOk,
  room,
  edit,
}: {
  open: boolean;
  onCancel: () => void;
  onOk: (values: RoomFormValues) => void;
  room?: Room | null;
  edit: boolean;
}) => {
  const { control, handleSubmit, reset, getValues } = useZodForm(roomSchema, { defaultValues: emptyValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'precios', keyName: '_key' });
  const modalTitle = edit ? `Editar habitación ${room?.numero}` : 'Crear nueva habitación';

  useEffect(() => {
    if (!open) return;
    reset(room ? { ...emptyValues, ...room } : emptyValues);
  }, [open, room, reset]);

  const nextPersonas = () => {
    const actuales = getValues('precios') ?? [];
    const usados = actuales.map((p) => p?.numero_personas).filter((n): n is number => !!n);
    return usados.length ? Math.max(...usados) + 1 : 1;
  };

  const submit = handleSubmit((values) => {
    onOk(values);
  });

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onCancel()} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <ModalTitle icon={<Home size={15} />}>{modalTitle}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form id="room-form" onSubmit={submit}>
            <Section title="Datos generales">
              <div style={{ display: 'flex', gap: 12 }}>
                {!edit && (
                  <FormField
                    control={control}
                    name="numero"
                    render={(field) => (
                      <Input {...field} label="Número" startContent={<Hash size={14} color={notion.inkFaint} />} placeholder="Ej. 101" className="flex-1" />
                    )}
                  />
                )}

                <FormField
                  control={control}
                  name="tipo"
                  render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                    <Select
                      label="Tipo de habitación"
                      placeholder="Tipo"
                      selectedKeys={value ? [value] : []}
                      onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                      onBlur={onBlur}
                      isInvalid={isInvalid}
                      errorMessage={errorMessage}
                      startContent={<BedDouble size={14} color={notion.inkFaint} />}
                      className="flex-1"
                    >
                      <SelectItem key="Regular">Regular</SelectItem>
                      <SelectItem key="Suite">Suite</SelectItem>
                    </Select>
                  )}
                />

                <FormField
                  control={control}
                  name="estado"
                  render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                    <Select
                      label="Estado"
                      placeholder="Estado"
                      selectedKeys={value ? [value] : []}
                      onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                      onBlur={onBlur}
                      isInvalid={isInvalid}
                      errorMessage={errorMessage}
                      startContent={<CheckCircle2 size={14} color={notion.inkFaint} />}
                      className="flex-1"
                    >
                      <SelectItem key="Libre">Libre</SelectItem>
                      <SelectItem key="Ocupado">Ocupado</SelectItem>
                    </Select>
                  )}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <FormField
                  control={control}
                  name="numero_camas"
                  render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                    <Input
                      name={name}
                      type="number"
                      min={1}
                      value={value ? String(value) : ''}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      isInvalid={isInvalid}
                      errorMessage={errorMessage}
                      label="Número de camas"
                      startContent={<UserSquare2 size={14} color={notion.inkFaint} />}
                      className="flex-1"
                    />
                  )}
                />

                <FormField
                  control={control}
                  name="tipo_cama"
                  render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                    <Select
                      label="Tipo de cama"
                      placeholder="Tipo de cama"
                      selectedKeys={value ? [value] : []}
                      onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                      onBlur={onBlur}
                      isInvalid={isInvalid}
                      errorMessage={errorMessage}
                      startContent={<BedDouble size={14} color={notion.inkFaint} />}
                      className="flex-1"
                    >
                      <SelectItem key="Una plaza">Una plaza</SelectItem>
                      <SelectItem key="Dos plazas">Dos plazas</SelectItem>
                    </Select>
                  )}
                />

                <FormField
                  control={control}
                  name="capacidad"
                  render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                    <Input
                      name={name}
                      type="number"
                      min={1}
                      value={value ? String(value) : ''}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      isInvalid={isInvalid}
                      errorMessage={errorMessage}
                      label="Capacidad (personas)"
                      startContent={<Users size={14} color={notion.inkFaint} />}
                      className="flex-1"
                    />
                  )}
                />
              </div>

              <FormField
                control={control}
                name="descripcion"
                render={(field) => (
                  <Input
                    {...field}
                    label="Descripción"
                    placeholder="Habitación doble en el piso 3, vista a la ciudad..."
                    className="mt-3"
                  />
                )}
              />
            </Section>

            <Section title="Comodidades">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {AMENITY_CHIPS.map((item) => (
                  <FormField
                    key={item.name}
                    control={control}
                    name={item.name}
                    render={({ value, onChange }) => (
                      <AmenityChip icon={item.icon} label={item.label} checked={!!value} onChange={onChange} />
                    )}
                  />
                ))}
              </div>

              <FormField
                control={control}
                name="amenidades"
                render={({ value, onChange }) => <TagsInput value={value ?? []} onChange={onChange} />}
              />
            </Section>

            <Section
              title="Precios por ocupación"
              extra={<span style={{ fontSize: 12, color: notion.inkFaint }}>Una tarifa por cada número de huéspedes</span>}
            >
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
                  <div style={{ fontSize: 13, color: notion.inkFaint }}>Todavía no hay tarifas cargadas para esta habitación.</div>
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
                {fields.map((item, index) => (
                  <div
                    key={item._key}
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
                    <FormField
                      control={control}
                      name={`precios.${index}.numero_personas`}
                      render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                        <Input
                          name={name}
                          type="number"
                          min={1}
                          max={20}
                          value={value ? String(value) : ''}
                          onChange={(e) => onChange(e.target.value)}
                          onBlur={onBlur}
                          isInvalid={isInvalid}
                          errorMessage={errorMessage}
                          placeholder="Huéspedes"
                          startContent={<Users size={13} color={notion.inkFaint} />}
                          className="flex-1"
                        />
                      )}
                    />
                    <FormField
                      control={control}
                      name={`precios.${index}.precio`}
                      render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                        <Input
                          name={name}
                          type="number"
                          min={0}
                          value={value ? String(value) : ''}
                          onChange={(e) => onChange(e.target.value)}
                          onBlur={onBlur}
                          isInvalid={isInvalid}
                          errorMessage={errorMessage}
                          placeholder="Precio"
                          startContent={<Wallet size={13} color={notion.inkFaint} />}
                          className="flex-1"
                        />
                      )}
                    />
                    <Button isIconOnly variant="light" color="danger" onPress={() => remove(index)} className="mt-1">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="bordered"
                onPress={() => append({ numero_personas: nextPersonas(), precio: 0 })}
                fullWidth
                startContent={<Plus size={14} />}
              >
                Agregar tarifa
              </Button>
            </Section>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onCancel}>
            Cancelar
          </Button>
          <Button color="primary" type="submit" form="room-form" startContent={edit ? <Save size={14} /> : <Plus size={14} />}>
            {edit ? 'Guardar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoomModal;
