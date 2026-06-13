"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Client leaf for the "Voltar" control on otherwise-static pages. Keeping the
 * single bit of interactivity (router.back()) in this leaf lets the public
 * marketing/legal pages stay Server Components — no client JS for the prose.
 */
export function BackButton({ label = "Voltar" }: { label?: string }) {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => router.back()}
			className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-colors"
		>
			<ArrowLeft className="w-4 h-4" />
			{label}
		</button>
	);
}
