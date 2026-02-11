'use client'

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {MailIcon} from "lucide-react"
import {useEffect, useRef} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "@/hooks/use-auth";
import {toast} from "sonner";

export function VerifyEmailSection() {
    const searchParams = useSearchParams();
    const token: string | null = searchParams.get('token');
    const router = useRouter();
    const {verifyEmail} = useAuth();
    const hasVerified = useRef(false);

    useEffect(() => {
        if (!token || hasVerified.current) return;

        hasVerified.current = true;

        async function verify() {
            try {
                if (token) {
                    await verifyEmail({ token });
                    toast.success("You successfully created your account");
                    router.push("/");
                }
            } catch (e) {
                toast.error("Something went wrong, please try again later");
                router.push("/login");
            }
        }

        verify();
    }, [token]);

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
                <p className="text-center text-sm text-gray-700" >
                    Did not receive it? Check your spam or promotions folder.
                </p>
            </CardFooter>
        </Card>
    )
}