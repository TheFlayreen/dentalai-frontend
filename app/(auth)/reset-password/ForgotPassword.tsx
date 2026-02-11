'use client'

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft, RotateCcwKeyIcon, LucideMail, Loader2, Key, EyeOffIcon, EyeIcon} from "lucide-react"
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "@/hooks/use-auth";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {toast} from "sonner";

const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email address."),
})

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(128, "Password must be at most 128 characters."),
    newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters.")
        .max(128, "Password must be at most 128 characters."),
}).refine((data) => data.password === data.newPassword, {
    message: "Passwords do not match",
    path: ["newPassword"],
});

export function ForgotPasswordSection() {
    const searchParams = useSearchParams();
    const token: string | null = searchParams.get('token');
    const router = useRouter();
    const [counter, setCounter] = useState<number>(0);
    const [loadingForgot, setLoadingForgot] = useState<boolean>(false);
    const [loadingReset, setLoadingReset] = useState<boolean>(false);
    const [isSentEmail, setIsSentEmail] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const {forgotPassword, resetPassword} = useAuth();

    const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    })
    const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            newPassword: ""
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    })

    async function onSubmitForgotPassword(data: z.infer<typeof forgotPasswordSchema>) {
        setLoadingForgot(true);

        try {
            await forgotPassword(data);
            setIsSentEmail(true)
            setCounter(60);
        } catch (e) {
            console.log(e)
            toast.error("User with this email not found!");
        } finally {
            setLoadingForgot(false)
        }
    }

    async function onSubmitResetPassword(data: z.infer<typeof resetPasswordSchema>) {
        setLoadingReset(true);
        const tokenStorage: string | null = localStorage.getItem("token");

        if (tokenStorage) {
            try {
                await resetPassword({
                    token: tokenStorage,
                    newPassword: data.newPassword
                });
                toast.success("Password reset successfully!");
            } catch (e) {
                console.log(e)
                toast.error("Something went wrong! Please try again later");
            } finally {
                setLoadingForgot(false);
                router.push("/login");
                localStorage.removeItem("token");
            }
        }
    }

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (counter > 0) {
            timer = setTimeout(() => setCounter(counter - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [counter]);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        }
    }, [token]);

    return (
        <Card className="w-full max-w-lg">
            {token ? (
                <>
                    <CardHeader>
                        <Key className="w-12 h-12 mx-auto text-blue-600"/>
                        <CardTitle className="text-center text-lg text-medium">
                            Set New Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-gray-700 mb-2">
                            Your password must be different to previously used passwords.
                        </p>
                        <form onSubmit={resetPasswordForm.handleSubmit(onSubmitResetPassword)} id="reset-password-form">
                            <div className="flex flex-col gap-4 w-full">
                                <FieldGroup className="gap-4">
                                    <Controller
                                        name='password'
                                        control={resetPasswordForm.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                                <FieldLabel htmlFor="reset-password">
                                                    New password
                                                </FieldLabel>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        id="reset-password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="************"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => !prev)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 !w-fit p-2 cursor-pointer"
                                                        aria-label="Show password"
                                                    >
                                                        {showPassword ? <EyeOffIcon className="w-5 h-5"/> :
                                                            <EyeIcon className="w-5 h-5"/>}
                                                    </button>
                                                </div>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name='newPassword'
                                        control={resetPasswordForm.control}
                                        render={({field, fieldState}) => (
                                            <Field data-invalid={fieldState.invalid} className="gap-1">
                                                <FieldLabel htmlFor="reset-new-password">
                                                    Confirm new password
                                                </FieldLabel>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        id="reset-new-password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="************"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(prev => !prev)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 !w-fit p-2 cursor-pointer"
                                                        aria-label="Show new password"
                                                    >
                                                        {showNewPassword ? <EyeOffIcon className="w-5 h-5"/> :
                                                            <EyeIcon className="w-5 h-5"/>}
                                                    </button>
                                                </div>
                                                {fieldState.invalid && (
                                                    <FieldError errors={[fieldState.error]}/>
                                                )}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                                <Button
                                    type="submit"
                                    form="reset-password-form"
                                    className="w-full"
                                    disabled={!resetPasswordForm.formState.isValid || loadingReset}
                                >
                                    {loadingForgot
                                        ? <Loader2 className="animate-spin"/>
                                        : "Reset password"
                                    }
                                </Button>
                            </div>
                        </form>

                    </CardContent>
                </>
            ) : (
                <>
                    <CardHeader>
                        {isSentEmail
                            ? <LucideMail className="w-12 h-12 mx-auto text-blue-600"/>
                            : <RotateCcwKeyIcon className="w-12 h-12 mx-auto text-blue-600"/>
                        }
                        <CardTitle className="text-center text-lg text-medium">
                            {isSentEmail ? "Check Your Email" : "Forgot Password?"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-gray-700 mb-2">
                            {isSentEmail
                                ? `We sent a password reset link to ${forgotPasswordForm.getValues("email")}`
                                : "No worries, we will send you reset instructions"}
                        </p>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)} id="forgot-password-form">
                            <div className="flex flex-col gap-4 w-full">
                                {!isSentEmail ? (
                                    <FieldGroup className="gap-4">
                                        <Controller
                                            name='email'
                                            control={forgotPasswordForm.control}
                                            render={({field, fieldState}) => (
                                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                                    <FieldLabel htmlFor="forgot-email">
                                                        Email
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="forgot-email"
                                                        disabled={loadingForgot}
                                                        type="email"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="work@email.com"
                                                        autoComplete="on"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]}/>
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                ) : null}
                                <Button
                                    type="submit"
                                    form="forgot-password-form"
                                    className="w-full"
                                    disabled={!forgotPasswordForm.formState.isValid || loadingForgot || counter > 0}
                                >
                                    {counter > 0
                                        ? `Resend in ${counter}s`
                                        : loadingForgot
                                            ? <Loader2 className="animate-spin"/>
                                            : "Reset password"
                                    }
                                </Button>
                            </div>
                        </form>

                    </CardContent>
                </>
            )}
            <CardFooter className="flex flex-col gap-4 items-center">
                <Link href="/login">
                    <Button size="xs" variant="ghost" className="hover:bg-white/0 hover:text-blue-600">
                        <ArrowLeft/>
                        Go back to login
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}