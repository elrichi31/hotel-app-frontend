"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Spinner } from '@heroui/react';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import AuthService from '@/services/AuthService'; // Importa el servicio que creaste
import { toast } from '@/lib/toast';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'Please input your first name!'),
    last_name: z.string().min(1, 'Please input your last name!'),
    username: z.string().min(1, 'Please input your username!'),
    email: z.string().min(1, 'Please input a valid email!').email('Please input a valid email!'),
    password: z.string().min(1, 'Please input your password!'),
    confirm_password: z.string().min(1, 'Please confirm your password!'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'The two passwords that you entered do not match!',
    path: ['confirm_password'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { control, handleSubmit } = useZodForm(registerSchema, {
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onFinish = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const response = await AuthService.register({
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        toast.error('Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Registration successful');
      router.push('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <form onSubmit={handleSubmit(onFinish)} noValidate autoComplete="off">
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

          <FormField
            control={control}
            name="first_name"
            render={(field) => <Input {...field} label="First Name" className="mb-4" />}
          />

          <FormField
            control={control}
            name="last_name"
            render={(field) => <Input {...field} label="Last Name" className="mb-4" />}
          />

          <FormField
            control={control}
            name="username"
            render={(field) => <Input {...field} label="Username" className="mb-4" />}
          />

          <FormField
            control={control}
            name="email"
            render={(field) => <Input {...field} type="email" label="Email" className="mb-4" />}
          />

          <FormField
            control={control}
            name="password"
            render={(field) => (
              <Input
                {...field}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                endContent={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-default-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                className="mb-4"
              />
            )}
          />

          <FormField
            control={control}
            name="confirm_password"
            render={(field) => (
              <Input
                {...field}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                endContent={
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-default-400">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                className="mb-4"
              />
            )}
          />

          <div className="text-center">
            <Button type="submit" color="primary" isDisabled={loading}>
              {loading ? <Spinner size="sm" color="white" /> : 'Register'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
