import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
					<SearchX className="w-10 h-10 text-primary-600 dark:text-primary-400" />
				</div>

				<h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-2">
					404
				</h1>
				<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
					Página não encontrada
				</h2>
				<p className="text-gray-500 dark:text-gray-400 mb-8">
					A página que você está procurando não existe ou foi movida.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
					<Link
						href="/home"
						className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
					>
						<Home className="w-4 h-4" />
						Página Inicial
					</Link>
					<Link
						href="/login"
						className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
					>
						<ArrowLeft className="w-4 h-4" />
						Ir para Login
					</Link>
				</div>
			</div>
		</div>
	);
}
