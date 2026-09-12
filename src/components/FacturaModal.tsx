// components/FacturaModal.tsx
'use client'
import { Button, DatePicker, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import {
    Trash2,
    Plus,
    FileText,
    User,
    IdCard,
    Phone,
    MapPin,
    Mail,
    Calendar,
    Wallet,
    Save,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Section } from '@/components/ui/Section';
import { ModalTitle } from '@/components/ui/ModalTitle';
import { notion } from '@/lib/theme';
import { money } from '@/lib/format';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';
import { toCalendarDate, fromCalendarDate } from '@/lib/dateField';

const productoSchema = z.object({
    cantidad: z.coerce.number({ message: 'Requerida' }).min(1, 'Requerida'),
    descripcion: z.string().min(1, 'Requerida'),
    precio_unitario: z.coerce.number({ message: 'Requerido' }).min(0, 'Requerido'),
});

const facturaSchema = z.object({
    nombre: z.string().min(1, 'Ingresa el nombre'),
    apellido: z.string().min(1, 'Ingresa el apellido'),
    identificacion: z.string().min(1, 'Ingresa la identificación'),
    telefono: z.string().min(1, 'Ingresa el teléfono'),
    direccion: z.string().min(1, 'Ingresa la dirección'),
    correo: z.string().min(1, 'Ingresa el correo').email('Ingresa un correo válido'),
    fecha_emision: z.string().min(1, 'Selecciona la fecha'),
    forma_pago: z.string().min(1, 'Selecciona una forma de pago'),
    productos: z.array(productoSchema),
    descuento: z.coerce.number().min(0).optional(),
    observaciones: z.string().optional(),
});

type FacturaFormValues = z.infer<typeof facturaSchema>;

const emptyValues: FacturaFormValues = {
    nombre: '',
    apellido: '',
    identificacion: '',
    telefono: '',
    direccion: '',
    correo: '',
    fecha_emision: '',
    forma_pago: '',
    productos: [],
    descuento: 0,
    observaciones: '',
};

const updateTotals = (productos: { cantidad?: number; precio_unitario?: number }[], descuento: number) => {
    const subtotalCalc = productos.reduce((acc, item) => {
        if (item && typeof item.cantidad === 'number' && typeof item.precio_unitario === 'number') {
            return acc + (item.cantidad || 0) * (item.precio_unitario || 0);
        }
        return acc;
    }, 0);
    const totalCalc = subtotalCalc - (descuento || 0);
    return { subtotal: subtotalCalc, total: totalCalc > 0 ? totalCalc : 0 };
};

export default function FacturaModal({ open, onCancel, onOk, factura, edit }: any) {
    const { control, handleSubmit, reset } = useZodForm(facturaSchema, { defaultValues: emptyValues });
    const { fields, append, remove } = useFieldArray({ control, name: 'productos', keyName: '_key' });
    const modalTitle = edit ? `Editar factura ${factura?.numero_factura ?? `#${factura?.id}`}` : 'Crear factura';

    const productos = useWatch({ control, name: 'productos' });
    const descuento = useWatch({ control, name: 'descuento' });
    const { subtotal, total } = updateTotals(productos ?? [], descuento ?? 0);

    useEffect(() => {
        if (!open) return;
        reset({
            productos: factura?.productos || [],
            descuento: factura?.descuento || 0,
            fecha_emision: factura?.fecha_emision || '',
            nombre: factura?.nombre || '',
            apellido: factura?.apellido || '',
            identificacion: factura?.identificacion || '',
            direccion: factura?.direccion || '',
            telefono: factura?.telefono || '',
            correo: factura?.correo || '',
            observaciones: factura?.observaciones || '',
            forma_pago: factura?.forma_pago || '',
        });
    }, [factura, open, reset]);

    const submit = handleSubmit((values) => {
        onOk({ ...values, subtotal, total });
    });

    return (
        <Modal isOpen={open} onOpenChange={(isOpen) => !isOpen && onCancel()} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>
                    <ModalTitle icon={<FileText size={15} />}>{modalTitle}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <form id="factura-form" onSubmit={submit}>
                        <Section title="Datos del cliente">
                            <div style={{ display: 'flex', gap: 12 }}>
                                <FormField control={control} name="nombre" render={(field) => (
                                    <Input {...field} label="Nombre" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Nombre" className="flex-1" />
                                )} />
                                <FormField control={control} name="apellido" render={(field) => (
                                    <Input {...field} label="Apellido" startContent={<User size={14} color={notion.inkFaint} />} placeholder="Apellido" className="flex-1" />
                                )} />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <FormField control={control} name="identificacion" render={(field) => (
                                    <Input {...field} label="Identificación" startContent={<IdCard size={14} color={notion.inkFaint} />} placeholder="0000000000" className="flex-1" />
                                )} />
                                <FormField control={control} name="telefono" render={(field) => (
                                    <Input {...field} label="Teléfono" startContent={<Phone size={14} color={notion.inkFaint} />} placeholder="0900000000" className="flex-1" />
                                )} />
                            </div>
                            <FormField control={control} name="direccion" render={(field) => (
                                <Input {...field} label="Dirección" startContent={<MapPin size={14} color={notion.inkFaint} />} placeholder="Av. Amazonas N11-92" className="mt-3" />
                            )} />
                            <FormField control={control} name="correo" render={(field) => (
                                <Input {...field} type="email" label="Correo" startContent={<Mail size={14} color={notion.inkFaint} />} placeholder="cliente@correo.com" className="mt-3" />
                            )} />
                        </Section>

                        <Section title="Detalles">
                            <div style={{ display: 'flex', gap: 12 }}>
                                <FormField control={control} name="fecha_emision" render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                                    <DatePicker
                                        name={name}
                                        label="Fecha de emisión"
                                        value={toCalendarDate(value)}
                                        onChange={(date) => onChange(fromCalendarDate(date))}
                                        onBlur={onBlur}
                                        isInvalid={isInvalid}
                                        errorMessage={errorMessage}
                                        showMonthAndYearPickers
                                        className="flex-1"
                                    />
                                )} />
                                <FormField control={control} name="forma_pago" render={({ value, onChange, onBlur, isInvalid, errorMessage }) => (
                                    <Select
                                        label="Forma de pago"
                                        placeholder="Selecciona"
                                        selectedKeys={value ? [value] : []}
                                        onSelectionChange={(keys) => onChange(Array.from(keys as Set<React.Key>)[0] ?? '')}
                                        onBlur={onBlur}
                                        isInvalid={isInvalid}
                                        errorMessage={errorMessage}
                                        startContent={<Wallet size={14} color={notion.inkFaint} />}
                                        className="flex-1"
                                    >
                                        <SelectItem key="efectivo">Efectivo</SelectItem>
                                        <SelectItem key="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem key="transferencia">Transferencia</SelectItem>
                                    </Select>
                                )} />
                            </div>
                        </Section>

                        <Section title="Productos">
                            {fields.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: notion.inkFaint }}>
                                    <span style={{ width: 72 }}>Cantidad</span>
                                    <span style={{ flex: 1 }}>Descripción</span>
                                    <span style={{ width: 120 }}>Precio unitario</span>
                                    <span style={{ width: 24 }} />
                                </div>
                            )}
                            {fields.map((item, index) => (
                                <div key={item._key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                                    <FormField control={control} name={`productos.${index}.cantidad`} render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                                        <Input
                                            name={name}
                                            type="number"
                                            min={1}
                                            value={value ? String(value) : ''}
                                            onChange={(e) => onChange(e.target.value)}
                                            onBlur={onBlur}
                                            isInvalid={isInvalid}
                                            errorMessage={errorMessage}
                                            placeholder="1"
                                            style={{ width: 72 }}
                                        />
                                    )} />
                                    <FormField control={control} name={`productos.${index}.descripcion`} render={(field) => (
                                        <Input {...field} placeholder="Desayuno buffet" className="flex-1" />
                                    )} />
                                    <FormField control={control} name={`productos.${index}.precio_unitario`} render={({ value, onChange, onBlur, isInvalid, errorMessage, name }) => (
                                        <Input
                                            name={name}
                                            type="number"
                                            min={0}
                                            value={value ? String(value) : ''}
                                            onChange={(e) => onChange(e.target.value)}
                                            onBlur={onBlur}
                                            isInvalid={isInvalid}
                                            errorMessage={errorMessage}
                                            placeholder="0.00"
                                            startContent="$"
                                            style={{ width: 120 }}
                                        />
                                    )} />
                                    <Button isIconOnly variant="light" color="danger" size="sm" onPress={() => remove(index)} className="mt-1">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="bordered"
                                onPress={() => append({ cantidad: 1, descripcion: '', precio_unitario: 0 })}
                                fullWidth
                                startContent={<Plus size={14} />}
                            >
                                Agregar producto
                            </Button>
                        </Section>

                        <Section title="Descuento y observaciones">
                            <FormField control={control} name="descuento" render={({ value, onChange, onBlur, name }) => (
                                <Input
                                    name={name}
                                    type="number"
                                    min={0}
                                    value={value ? String(value) : ''}
                                    onChange={(e) => onChange(e.target.value)}
                                    onBlur={onBlur}
                                    label="Descuento"
                                    startContent="$"
                                    style={{ maxWidth: 200 }}
                                />
                            )} />
                            <FormField control={control} name="observaciones" render={(field) => (
                                <Input {...field} label="Observaciones" placeholder="Opcional" className="mt-3" />
                            )} />
                        </Section>

                        <div style={{ display: 'flex', gap: 32, padding: '4px 4px 8px' }}>
                            <div>
                                <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Subtotal</div>
                                <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(subtotal, 2)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12.5, color: notion.inkMuted }}>Total</div>
                                <div style={{ fontSize: 20, fontWeight: 600, color: notion.ink, marginTop: 2 }}>{money(total, 2)}</div>
                            </div>
                        </div>
                    </form>
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" onPress={onCancel}>Cancelar</Button>
                    <Button color="primary" type="submit" form="factura-form" startContent={<Save size={14} />}>
                        {edit ? 'Guardar' : 'Crear'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
