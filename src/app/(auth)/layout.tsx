import Image from "next/image";
import { AuthRedirectGate } from "@/components/auth-redirect-gate";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
			{/* Left side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-600 to-secondary-700 p-12 flex-col justify-between relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-300 rounded-full blur-3xl" />
				</div>

				<div className="relative z-10 animate-fade-in-up">
					<div className="flex items-center gap-3">
						<Image
							src="/vendinhas.svg"
							alt="Vendinhas"
							width={200}
							height={48}
							className="brightness-0 invert"
							style={{ width: "auto", height: "auto" }}
							priority
						/>
					</div>
				</div>

				<div
					className="relative z-10 space-y-6 animate-fade-in-up"
					style={{ animationDelay: "0.15s" }}
				>
					<h1 className="text-4xl font-bold text-white leading-tight">
						Gerencie suas vendas de forma simples e eficiente
					</h1>
					<p className="text-primary-100 text-lg">
						Controle de estoque, pedidos, clientes e muito mais em uma única
						plataforma.
					</p>

					<div className="flex gap-8 pt-4">
						<div>
							<div className="text-3xl font-bold text-white">500+</div>
							<div className="text-primary-200 text-sm">Empresas ativas</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-white">50k+</div>
							<div className="text-primary-200 text-sm">Vendas processadas</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-white">99.9%</div>
							<div className="text-primary-200 text-sm">Disponibilidade</div>
						</div>
					</div>
				</div>

				<div
					className="relative z-10 text-primary-200 text-sm animate-fade-in-up"
					style={{ animationDelay: "0.3s" }}
				>
					2025 Vendinhas. Todos os direitos reservados.
				</div>
			</div>

			{/* Right side - Form */}
			<div className="flex-1 flex items-center justify-center p-8 relative">
				{/* Theme Toggle */}
				<div className="absolute top-4 right-4">
					<ThemeToggle />
				</div>

				<div className="w-full max-w-md">
					<AuthRedirectGate>{children}</AuthRedirectGate>
				</div>
			</div>
		</div>
	);
}
