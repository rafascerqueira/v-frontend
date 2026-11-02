import { PackageX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Link de acompanhamento indisponível",
	robots: { index: false, follow: false },
};

/**
 * Retired tracking URL. It looked orders up by number alone across every store,
 * which leaked other sellers' orders; tracking now lives under the store
 * (`/loja/[slug]/pedido/[orderNumber]`). Without the slug we can't resolve the
 * store, so this page stays static and never calls the API.
 */
export default function LegacyOrderTrackingPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="max-w-md text-center animate-fade-in-up">
				<PackageX
					className="w-16 h-16 text-muted-foreground mx-auto mb-4"
					aria-hidden="true"
				/>
				<h1 className="text-xl font-bold text-foreground mb-2">
					Link de acompanhamento indisponível
				</h1>
				<p className="text-muted-foreground">
					Este link de acompanhamento não está mais disponível. Acesse a loja
					onde você fez o pedido ou fale com o vendedor.
				</p>
			</div>
		</div>
	);
}
