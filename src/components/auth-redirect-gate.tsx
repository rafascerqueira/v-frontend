"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

/**
 * Client leaf for the (auth) route group. Bounces already-authenticated users to
 * the dashboard and holds the auth screens behind a spinner until the session
 * check resolves. Extracting this lets the (auth) layout itself stay a Server
 * Component.
 *
 * The check is validity-based (via /auth/me in the auth context), NOT cookie
 * presence — an expired session cookie that outlives its JWT therefore can't
 * trap the user in a redirect loop.
 */
export function AuthRedirectGate({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.replace("/dashboard");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading || isAuthenticated) {
		return (
			<div className="flex w-full items-center justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
			</div>
		);
	}

	return <>{children}</>;
}
