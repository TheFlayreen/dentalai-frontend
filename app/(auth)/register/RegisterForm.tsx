'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z
    .string('Name is required.')
    .min(3, 'Name must be at least 3 characters.')
    .max(20, 'Name must be at most 20 characters.'),
  surname: z
    .string('Surname is required.')
    .min(3, 'Name must be at least 3 characters.')
    .max(20, 'Name must be at most 20 characters.'),
  email: z.email('Invalid email address.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .max(128, 'Password must be at most 128 characters.'),
});

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true);

    try {
      await register(data);
      router.push('/');
    } catch (error) {
      console.error('Registration error', error);
      toast.error('User already exist with this email.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl text-bold">Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} id="login-form" autoComplete="off">
          <FieldGroup className="gap-4">
            <FieldGroup className="flex flex-col sm:flex-row gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="register-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="register-name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="John"
                      // autoComplete="on"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="surname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="register-surname">Surname</FieldLabel>
                    <Input
                      {...field}
                      id="register-surname"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="Cena"
                      // autoComplete="on"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="register-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="work@email.com"
                    // autoComplete="on"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="************"
                      // autoComplete="on"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 !w-fit p-2 cursor-pointer"
                      aria-label="Show password"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button
              disabled={!form.formState.isValid || isLoading}
              className="w-full"
              type="submit"
              form="login-form"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Create account'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="w-full h-[1px] bg-border dark:bg-border-dark" />
        <div className="flex flex-col md:flex-row items-center gap-1 text-sm justify-center w-full">
          <span>Already have an account?</span>
          <Link className="text-blue-600 font-semibold" href={ROUTES.LOGIN}>
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
