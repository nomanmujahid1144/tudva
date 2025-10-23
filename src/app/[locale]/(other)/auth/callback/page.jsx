'use client';

import { useRouter } from "next/navigation";
import { LoadingRotating } from "../../../components/loader/LoadingRotating";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallBack() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {

        // Check if user is authenticated using AuthContext
        if (isAuthenticated) {
            // toast.success('Login successful!');
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } else {
            // If not authenticated, redirect to login
            toast.error('Login verification failed');
            setTimeout(() => {
                router.push('/auth/sign-in');
            }, 1000);
        }

        // Set a maximum timeout for the callback page
        const timeoutId = setTimeout(() => {
            console.log('Auth callback timed out, redirecting to home');
            router.push('/');
        }, 5000); // 5 seconds max

        return () => clearTimeout(timeoutId);
    }, [router, isAuthenticated]);

    return (
        <div className="my-5 vh-100 w-100 d-flex justify-content-center text-center">
            <div className="flex flex-col align-items-center gap-2">
                <LoadingRotating />
                <h3 className="text-xl font-semibold">Redirecting...</h3>
                <p>Please wait</p>
            </div>
        </div>
    );
}