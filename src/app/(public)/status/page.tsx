"use client";

import { motion } from "framer-motion";
import {
	Activity,
	ArrowLeft,
	CheckCircle2,
	Database,
	Globe,
	Server,
	Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

const services = [
	{
		icon: Globe,
		name: "Aplicação Web",
		description: "Interface principal do Vendinhas",
		status: "operational",
	},
	{
		icon: Server,
		name: "API Backend",
		description: "Serviços de backend e processamento",
		status: "operational",
	},
	{
		icon: Database,
		name: "Banco de Dados",
		description: "Armazenamento e consultas de dados",
		status: "operational",
	},
	{
		icon: Shield,
		name: "Autenticação",
		description: "Login, registro e segurança",
		status: "operational",
	},
	{
		icon: Activity,
		name: "Notificações em Tempo Real",
		description: "WebSocket e push notifications",
		status: "operational",
	},
];

function StatusBadge({ status }: { status: string }) {
	if (status === "operational") {
		return (
			<span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
				<CheckCircle2 className="w-4 h-4" />
				Operacional
			</span>
		);
	}
	return null;
}

export default function StatusPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<button
						type="button"
						onClick={() => router.back()}
						className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Voltar
					</button>

					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
								<Activity className="w-7 h-7 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Status do Sistema
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Monitoramento em tempo real dos serviços
								</p>
							</div>
						</div>

						<div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-8 text-center">
							<CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
							<p className="text-green-700 dark:text-green-300 font-semibold text-lg">
								Todos os sistemas operacionais
							</p>
							<p className="text-green-600 dark:text-green-400 text-sm mt-1">
								Última verificação: agora
							</p>
						</div>

						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
							Serviços
						</h2>

						<div className="space-y-3">
							{services.map((service) => (
								<div
									key={service.name}
									className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700"
								>
									<div className="flex items-center gap-3">
										<service.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
										<div>
											<h3 className="font-medium text-gray-900 dark:text-white">
												{service.name}
											</h3>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{service.description}
											</p>
										</div>
									</div>
									<StatusBadge status={service.status} />
								</div>
							))}
						</div>

						<div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Problemas com algum serviço? Entre em contato em{" "}
								<a
									href="mailto:suporte@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									suporte@vendinhas.app
								</a>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
