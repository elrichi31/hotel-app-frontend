import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';

/**
 * `useForm` con validación zod ya enchufada. Reemplaza los `rules` de
 * `Form.Item` de antd: el esquema es la única fuente de verdad de validación,
 * compartible entre formularios y testeable fuera de React.
 */
export function useZodForm<TSchema extends ZodType<any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });
}
