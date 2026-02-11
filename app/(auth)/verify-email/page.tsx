import { Suspense } from "react";
import { VerifyEmailSection } from "@/app/(auth)/verify-email/VerifyEmail";
import { PageLoader } from "@/components/ui/page-loader";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyEmail() {
    const cookieStore = await cookies();
    const verifyRequested = cookieStore.get('verifyEmailRequested')?.value;

    if (!verifyRequested) {
        redirect('/login');
    }

    return (
        <Suspense fallback={<PageLoader />}>
            <VerifyEmailSection />
        </Suspense>
    );
}