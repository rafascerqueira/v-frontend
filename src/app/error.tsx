"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
	reset,
}: {
	error: globalThis.Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
					<AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
				</div>

				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Algo deu errado
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mb-8">
					Ocorreu um erro inesperado. Tente novamente ou volte para a página
					inicial.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<button
						type="button"
						onClick={reset}
						className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
					>
						<RefreshCw className="w-4 h-4" />
						Tentar Novamente
					</button>
					<Link
						href="/home"
						className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
					>
						<Home className="w-4 h-4" />
						Página Inicial
					</Link>
				</div>
			</div>
		</div>
	);
}
