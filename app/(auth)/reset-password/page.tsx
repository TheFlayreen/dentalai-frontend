import { Suspense } from "react";
import { ForgotPasswordSection } from "@/app/(auth)/reset-password/ForgotPassword";
import { PageLoader } from "@/components/ui/page-loader";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ForgotPasswordSection />
        </Suspense>
    );
}