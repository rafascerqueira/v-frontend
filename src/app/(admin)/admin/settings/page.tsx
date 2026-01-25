"use client";

import { motion } from "framer-motion";
import { CheckCircle, Database, Server, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface SystemHealth {
	status: string;
	database: string;
	timestamp: string;
}

export default function AdminSettingsPage() {
	const [health, setHealth] = useState<SystemHealth | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadHealth() {
			try {
				const response = await api.get("/admin/health");
				setHealth(response.data);
			} catch (_error) {
				toast.error("Erro ao verificar saúde do sistema");
			} finally {
				setLoading(false);
			}
		}
		loadHealth();
	}, []);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Configurações do Sistema
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-1">
					Monitoramento e configurações administrativas
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* System Health */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
							<Server className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Saúde do Sistema
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Status dos serviços
							</p>
						</div>
					</div>

					{loading ? (
						<div className="animate-pulse space-y-4">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
						</div>
					) : health ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
								<div className="flex items-center gap-2">
									<Server className="w-4 h-4 text-gray-400" />
									<span className="text-gray-600 dark:text-gray-400">
										API Server
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-green-500" />
									<span className="text-green-600 font-medium">Online</span>
								</div>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
								<div className="flex items-center gap-2">
									<Database className="w-4 h-4 text-gray-400" />
									<span className="text-gray-600 dark:text-gray-400">
										Database
									</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-4 h-4 text-green-500" />
									<span className="text-green-600 font-medium capitalize">
										{health.database}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between py-3">
								<span className="text-gray-600 dark:text-gray-400">
									Última verificação
								</span>
								<span className="text-gray-900 dark:text-white">
									{new Date(health.timestamp).toLocaleString("pt-BR")}
								</span>
							</div>
						</div>
					) : (
						<p className="text-red-500">Erro ao verificar saúde do sistema</p>
					)}
				</motion.div>

				{/* Admin Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
							<Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Painel Administrativo
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Informações do sistema
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">Versão</span>
							<span className="text-gray-900 dark:text-white font-mono">
								1.0.0
							</span>
						</div>
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">Ambiente</span>
							<span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded">
								Development
							</span>
						</div>
						<div className="flex items-center justify-between py-3">
							<span className="text-gray-600 dark:text-gray-400">
								Framework
							</span>
							<span className="text-gray-900 dark:text-white">
								NestJS + Next.js
							</span>
						</div>
					</div>
				</motion.div>

				{/* General Settings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
							<Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Configurações Gerais
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Configurações administrativas do sistema
							</p>
						</div>
					</div>

					<div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center">
						<Settings className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
						<h4 className="font-medium text-gray-900 dark:text-white mb-2">
							Em desenvolvimento
						</h4>
						<p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
							As configurações avançadas do sistema estarão disponíveis em uma
							próxima atualização. Por enquanto, utilize as páginas de Usuários
							e Logs para gerenciar o sistema.
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
