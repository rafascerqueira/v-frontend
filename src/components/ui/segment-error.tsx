"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SegmentErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
	title?: string;
	description?: string;
}

/**
 * Shared UI for App Router `error.tsx` segment boundaries. Each segment exports a
 * thin client wrapper that forwards `error`/`reset` here so the look stays
 * consistent and the copy stays in Portuguese.
 */
export function SegmentError({
	error,
	reset,
	title = "Algo deu errado",
	description = "Não foi possível carregar esta seção. Tente novamente.",
}: SegmentErrorProps) {
	useEffect(() => {
		// Surface the boundary error for observability.
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
				<AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
			</div>
			<div className="space-y-1">
				<h2 className="text-xl font-semibold text-foreground">{title}</h2>
				<p className="max-w-md text-sm text-muted-foreground">{description}</p>
			</div>
			<Button onClick={reset} variant="primary">
				Tentar novamente
			</Button>
		</div>
	);
}
