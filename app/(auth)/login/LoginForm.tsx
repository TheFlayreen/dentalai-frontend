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
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.email('Invalid email address.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .max(128, 'Password must be at most 128 characters.'),
});

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    try {
      const message = await login(data);

      if (message.error) {
        toast.error(message.error);
      }
      router.push(ROUTES.HOME);
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl text-bold">Welcome to Dental.AI</CardTitle>
        <CardDescription className="text-center">
          Front Desk Training & Call Simulations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} id="login-form">
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="work@email.com"
                    autoComplete="on"
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
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      {...field}
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="************"
                      autoComplete="on"
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
          </FieldGroup>
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="w-full flex justify-end gap-4">
              <Link href="/reset-password">
                <Button size="xs" variant="ghost" className="hover:bg-white/0 hover:text-blue-600">
                  Forgot Password?
                </Button>
              </Link>
            </div>

            <Button
              disabled={!form.formState.isValid || isLoading}
              className="w-full"
              type="submit"
              form="login-form"
            >
              {isLoading ? 'Loading...' : 'Start Training'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <span className="text-center text-sm text-gray-500 dark:text-gray-400">
          For team members only
        </span>
        <div className="w-full h-[1px] bg-border dark:bg-border-dark" />
        <div className="flex flex-col md:flex-row items-center gap-1 text-sm justify-center w-full">
          <span>New here?</span>
          <Link className="text-blue-600 font-semibold" href={ROUTES.REGISTER}>
            Create your account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
