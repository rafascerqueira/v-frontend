"use client";

import { motion } from "framer-motion";
import { Activity, RefreshCw, Shield, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface ActiveUser {
	id: string;
	name: string;
	email: string;
	role: string;
	last_login_at: string;
}

function formatRelativeTime(date: string) {
	const now = new Date();
	const past = new Date(date);
	const diffMs = now.getTime() - past.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return "Agora mesmo";
	if (diffMins < 60)
		return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24)
		return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;
}

export default function AdminActivityPage() {
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [lastRefresh, setLastRefresh] = useState(new Date());

	const loadActiveUsers = useCallback(async () => {
		try {
			const response = await api.get("/admin/active-users");
			setActiveUsers(response.data);
			setLastRefresh(new Date());
		} catch (_error) {
			toast.error("Erro ao carregar usuários ativos");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadActiveUsers();

		// Auto-refresh every 30 seconds
		const interval = setInterval(loadActiveUsers, 30000);
		return () => clearInterval(interval);
	}, [loadActiveUsers]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Atividade em Tempo Real
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Usuários ativos nos últimos 30 minutos
					</p>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500 dark:text-gray-400">
						Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}
					</span>
					<button
						type="button"
						onClick={loadActiveUsers}
						className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
					>
						<RefreshCw className="w-4 h-4" />
						Atualizar
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
							<Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Usuários Online
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{activeUsers.length}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
							<User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Vendedores Ativos
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{activeUsers.filter((u) => u.role === "seller").length}
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
							<Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Admins Ativos
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{activeUsers.filter((u) => u.role === "admin").length}
							</p>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Active Users List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"
			>
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<h2 className="font-semibold text-gray-900 dark:text-white">
						Sessões Ativas
					</h2>
				</div>

				{loading ? (
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto" />
						<p className="text-gray-500 dark:text-gray-400 mt-2">
							Carregando...
						</p>
					</div>
				) : activeUsers.length === 0 ? (
					<div className="p-12 text-center">
						<Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
							Nenhum usuário ativo
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Não há usuários conectados nos últimos 30 minutos
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{activeUsers.map((user) => (
							<div
								key={user.id}
								className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30"
							>
								<div className="flex items-center gap-4">
									<div className="relative">
										<div
											className={`w-12 h-12 rounded-full flex items-center justify-center ${
												user.role === "admin"
													? "bg-red-100 dark:bg-red-900/30"
													: "bg-blue-100 dark:bg-blue-900/30"
											}`}
										>
											{user.role === "admin" ? (
												<Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
											) : (
												<User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
											)}
										</div>
										<span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
									</div>
									<div>
										<p className="font-medium text-gray-900 dark:text-white">
											{user.name}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{user.email}
										</p>
									</div>
								</div>
								<div className="text-right">
									<span
										className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
											user.role === "admin"
												? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
												: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
										}`}
									>
										{user.role === "admin" ? "Administrador" : "Vendedor"}
									</span>
									<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
										{formatRelativeTime(user.last_login_at)}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</motion.div>

			{/* Info */}
			<div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400">
				<p>
					💡 Esta página atualiza automaticamente a cada 30 segundos. Os
					usuários são considerados ativos se fizeram login nos últimos 30
					minutos.
				</p>
			</div>
		</div>
	);
}
