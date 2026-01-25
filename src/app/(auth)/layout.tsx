"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* Left side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="relative z-10"
				>
					<div className="flex items-center gap-3">
						<Image
							src="/vendinhas.svg"
							alt="Vendinhas"
							width={200}
							height={48}
							className="brightness-0 invert"
							priority
						/>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="relative z-10 space-y-6"
				>
					<h1 className="text-4xl font-bold text-white leading-tight">
						Gerencie suas vendas de forma simples e eficiente
					</h1>
					<p className="text-indigo-100 text-lg">
						Controle de estoque, pedidos, clientes e muito mais em uma única
						plataforma.
					</p>

					<div className="flex gap-8 pt-4">
						<div>
							<div className="text-3xl font-bold text-white">500+</div>
							<div className="text-indigo-200 text-sm">Empresas ativas</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-white">50k+</div>
							<div className="text-indigo-200 text-sm">Vendas processadas</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-white">99.9%</div>
							<div className="text-indigo-200 text-sm">Disponibilidade</div>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="relative z-10 text-indigo-200 text-sm"
				>
					© 2025 Vendinhas. Todos os direitos reservados.
				</motion.div>
			</div>

			{/* Right side - Form */}
			<div className="flex-1 flex items-center justify-center p-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4 }}
					className="w-full max-w-md"
				>
					{children}
				</motion.div>
			</div>
		</div>
	);
}
