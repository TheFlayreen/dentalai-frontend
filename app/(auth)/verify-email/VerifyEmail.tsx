'use client'

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {MailIcon} from "lucide-react"
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "@/hooks/use-auth";
import {toast} from "sonner";

export function VerifyEmailSection() {
    const searchParams = useSearchParams();
    const token: string | null = searchParams.get('token');
    const router = useRouter();
    const {verifyEmail} = useAuth();
    const [counter, setCounter] = useState<number>(60);
    const [loading, setLoading] = useState<boolean>(!!token);
    const hasVerified = useRef(false);

    useEffect(() => {
        if (!token || hasVerified.current) return;

        hasVerified.current = true;

        async function verify() {
            setLoading(true);
            try {
                if (token) {
                    await verifyEmail({ token });
                    toast.success("You successfully created your account");
                    router.push("/");
                }
            } catch (e) {
                toast.error("Something went wrong, please try again later");
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }

        verify();
    }, [token]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (counter > 0) {
            timer = setTimeout(() => setCounter(counter - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [counter]);

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <MailIcon className="w-12 h-12 mx-auto text-blue-600"/>
                <CardTitle className="text-center text-lg text-medium">
                    Check your email
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-sm text-gray-700">
                    We have sent you a secure activation link.
                </p>
                <p className="text-center text-sm text-gray-700" >
                    Click the link in your email to finish setting up your account.
                </p>
                <p className="text-center text-sm text-gray-700">
                    You will be taken straight into your training.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 items-center">
                <Button className="w-full"  disabled={counter > 0 || loading}>
                    {counter > 0 ? `Resend in ${counter}s` : 'Resend activation email'}
                </Button>
                <p className="text-center text-sm text-gray-700" >
                    Did not receive it? Check your spam or promotions folder.
                </p>
            </CardFooter>
        </Card>
    )
}