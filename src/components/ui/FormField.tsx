"use client";
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

/**
 * Reemplaza `Form.Item` de antd: conecta un campo de react-hook-form a
 * cualquier componente controlado de HeroUI (Input, Select, DatePicker...)
 * que acepte `value`/`onChange`/`onBlur`/`isInvalid`/`errorMessage`. El error
 * viene del resolver de zod en `useZodForm`, no de reglas declaradas acá.
 */
export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  render,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  render: (field: {
    value: any;
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    name: string;
    isInvalid: boolean;
    errorMessage?: string;
  }) => React.ReactElement;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        render({
          ...field,
          isInvalid: !!fieldState.error,
          errorMessage: fieldState.error?.message,
        })
      }
    />
  );
}
