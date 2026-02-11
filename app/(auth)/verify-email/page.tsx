import {VerifyEmailSection} from "@/app/(auth)/verify-email/VerifyEmail";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function VerifyEmail() {
    const cookieStore = await cookies();
    const verifyRequested = cookieStore.get('verifyEmailRequested')?.value;

    if (!verifyRequested) {
        redirect('/login');
    }

    return (
        <VerifyEmailSection/>
    )
}