"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function StoreError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="min-h-screen bg-transparent">
			<SegmentError
				error={error}
				reset={reset}
				title="Não foi possível abrir a loja"
				description="Houve um problema ao carregar esta loja. Verifique o link ou tente novamente."
			/>
		</div>
	);
}
