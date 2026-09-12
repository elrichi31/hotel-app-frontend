import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Button, Switch } from '@heroui/react';
import { z } from 'zod';
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
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';

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
    <Switch isSelected={checked} onValueChange={onChange} onClick={(e) => e.stopPropagation()} />
  </div>
);

const userSchema = z.object({
  first_name: z.string().min(1, 'Por favor ingrese el nombre'),
  last_name: z.string().min(1, 'Por favor ingrese el apellido'),
  email: z.string().min(1, 'Por favor ingrese un correo válido').email('Por favor ingrese un correo válido'),
  username: z.string().min(1, 'Por favor ingrese el nombre de usuario'),
  role: z.string().min(1, 'Por favor seleccione un rol'),
  status: z.string().min(1, 'Por favor seleccione el estado'),
  notificar_reservas: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

const emptyValues: UserFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  role: '',
  status: '',
  notificar_reservas: false,
};

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<User>) => void;
  user?: User | null;
  isEditMode: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ visible, onCancel, onOk, user, isEditMode }) => {
  const { control, handleSubmit, reset } = useZodForm(userSchema, { defaultValues: emptyValues });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        username: user.username ?? '',
        role: user.role ?? '',
        status: user.status ?? '',
        notificar_reservas: user.notificar_reservas ?? false,
      });
    } else {
      reset(emptyValues);
    }
  }, [user, reset]);

  const close = () => {
    reset(emptyValues);
    onCancel();
  };

  const submit = handleSubmit((values) => {
    onOk(values);
    reset(emptyValues);
  });

  return (
    <Modal isOpen={visible} onOpenChange={(open) => !open && close()} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <ModalTitle icon={<UserIcon size={15} />}>{isEditMode ? 'Editar usuario' : 'Crear usuario'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form id="user-form" onSubmit={submit}>
            <p style={sectionLabelStyle}>Datos personales</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <FormField
                control={control}
                name="first_name"
                render={(field) => (
                  <Input
                    {...field}
                    label="Nombre"
                    startContent={<UserIcon size={14} color={notion.inkFaint} />}
                    placeholder="Nombre"
                    className="flex-1"
                  />
                )}
              />
              <FormField
                control={control}
                name="last_name"
                render={(field) => (
                  <Input
                    {...field}
                    label="Apellido"
                    startContent={<UserIcon size={14} color={notion.inkFaint} />}
                    placeholder="Apellido"
                    className="flex-1"
                  />
                )}
              />
            </div>
            <FormField
              control={control}
              name="email"
              render={(field) => (
                <Input
                  {...field}
                  type="email"
                  label="Correo electrónico"
                  startContent={<Mail size={14} color={notion.inkFaint} />}
                  placeholder="correo@ejemplo.com"
                  className="mt-4"
                />
              )}
            />

            <p style={sectionLabelStyle}>Acceso</p>
            <FormField
              control={control}
              name="username"
              render={(field) => (
                <Input
                  {...field}
                  label="Nombre de usuario"
                  startContent={<IdCard size={14} color={notion.inkFaint} />}
                  placeholder="Nombre de usuario"
                />
              )}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <FormField
                control={control}
                name="role"
                render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                  <Select
                    label="Rol"
                    placeholder="Selecciona un rol"
                    selectedKeys={value ? [value] : []}
                    onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                    onBlur={onBlur}
                    isInvalid={isInvalid}
                    errorMessage={errorMessage}
                    startContent={<ShieldCheck size={14} color={notion.inkFaint} />}
                    className="flex-1"
                  >
                    <SelectItem key="admin">Admin</SelectItem>
                    <SelectItem key="empleado">Empleado</SelectItem>
                  </Select>
                )}
              />
              <FormField
                control={control}
                name="status"
                render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                  <Select
                    label="Estado"
                    placeholder="Selecciona el estado"
                    selectedKeys={value ? [value] : []}
                    onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                    onBlur={onBlur}
                    isInvalid={isInvalid}
                    errorMessage={errorMessage}
                    startContent={<CheckCircle2 size={14} color={notion.inkFaint} />}
                    className="flex-1"
                  >
                    <SelectItem key="activo">Activo</SelectItem>
                    <SelectItem key="inactivo">Inactivo</SelectItem>
                  </Select>
                )}
              />
            </div>

            <p style={sectionLabelStyle}>Notificaciones</p>
            <FormField
              control={control}
              name="notificar_reservas"
              render={({ value, onChange }) => (
                <ToggleRow
                  icon={<BellRing size={16} color={notion.blue} />}
                  title="Avisar de nuevas reservas"
                  description="Recibirá un correo cada vez que un cliente genere una reserva en la aplicación."
                  checked={value}
                  onChange={onChange}
                />
              )}
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={close}>
            Cancelar
          </Button>
          <Button
            color="primary"
            type="submit"
            form="user-form"
            startContent={isEditMode ? <Save size={14} /> : <UserPlus size={14} />}
          >
            {isEditMode ? 'Guardar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
