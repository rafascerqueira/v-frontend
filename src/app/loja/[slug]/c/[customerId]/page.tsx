"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { catalogApi } from "@/lib/api-public";

/**
 * Personalized catalog entry point for a known customer.
 *
 * Flow:
 *   1. Fetch customer scoped to the store slug (backend returns 404 if the
 *      customer does not belong to this seller).
 *   2. Store it in CartContext so the checkout skips the lookup step.
 *   3. Redirect to /loja/[slug].
 *
 * If the customer cannot be resolved (wrong seller, deleted, etc.) we show
 * an error and invite the visitor to browse the store without pre-fill.
 */
export default function PersonalizedStoreEntryPage() {
	const params = useParams();
	const slug = params.slug as string;
	const customerId = params.customerId as string;
	const router = useRouter();
	const { setCustomer } = useCart();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		catalogApi
			.getCustomerInStore(slug, customerId)
			.then(({ data }) => {
				if (cancelled) return;
				setCustomer(data);
				router.replace(`/loja/${slug}`);
			})
			.catch(() => {
				if (cancelled) return;
				setError("Link inválido ou expirado.");
			});

		return () => {
			cancelled = true;
		};
	}, [slug, customerId, setCustomer, router]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="max-w-sm w-full text-center space-y-4">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
					<p className="text-gray-900 dark:text-white font-medium">{error}</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Você ainda pode navegar pelo catálogo e identificar-se no
						checkout.
					</p>
					<Link
						href={`/loja/${slug}`}
						className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
					>
						Abrir catálogo
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
		</div>
	);
}
