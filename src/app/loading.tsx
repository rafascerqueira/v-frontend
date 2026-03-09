export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center gap-4">
				<div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Carregando...
				</p>
			</div>
		</div>
	);
}
