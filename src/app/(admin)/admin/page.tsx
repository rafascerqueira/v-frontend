"use client";

import { motion } from "framer-motion";
import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Stats {
	accounts: { total: number };
	customers: { total: number };
	products: { total: number; active: number };
	orders: {
		total: number;
		today: number;
		thisMonth: number;
		pending: number;
		growth: number;
	};
	revenue: { thisMonth: number; lastMonth: number; growth: number };
}

interface ActiveUser {
	id: string;
	name: string;
	email: string;
	role: string;
	last_login_at: string;
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

function formatRelativeTime(date: string) {
	const now = new Date();
	const past = new Date(date);
	const diffMs = now.getTime() - past.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return "Agora";
	if (diffMins < 60) return `${diffMins}min atrás`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h atrás`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d atrás`;
}

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<Stats | null>(null);
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				const [statsRes, activeUsersRes] = await Promise.all([
					api.get("/admin/stats"),
					api.get("/admin/active-users"),
				]);
				setStats(statsRes.data);
				setActiveUsers(activeUsersRes.data);
			} catch (_error) {
				toast.error("Erro ao carregar dados. Verifique suas permissões.");
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
						>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 dark:text-gray-400">
					Erro ao carregar estatísticas. Verifique se você tem permissões de
					administrador.
				</p>
			</div>
		);
	}

	const statCards = [
		{
			title: "Vendedores",
			value: stats.accounts.total,
			icon: Users,
			color: "bg-blue-500",
			description: "Total de contas",
		},
		{
			title: "Clientes",
			value: stats.customers.total,
			icon: Users,
			color: "bg-green-500",
			description: "Clientes cadastrados",
		},
		{
			title: "Pedidos Hoje",
			value: stats.orders.today,
			icon: ShoppingCart,
			color: "bg-purple-500",
			description: `${stats.orders.pending} pendentes`,
		},
		{
			title: "Receita do Mês",
			value: formatCurrency(stats.revenue.thisMonth),
			icon: DollarSign,
			color: "bg-emerald-500",
			growth: stats.revenue.growth,
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Painel Administrativo
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-1">
					Visão geral do sistema Vendinhas
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<div
								className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
							>
								<stat.icon className="w-6 h-6 text-white" />
							</div>
							{stat.growth !== undefined && (
								<div
									className={`flex items-center gap-1 text-sm font-medium ${
										stat.growth >= 0 ? "text-green-600" : "text-red-600"
									}`}
								>
									{stat.growth >= 0 ? (
										<ArrowUpRight className="w-4 h-4" />
									) : (
										<ArrowDownRight className="w-4 h-4" />
									)}
									{Math.abs(stat.growth).toFixed(1)}%
								</div>
							)}
						</div>
						<div className="mt-4">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{stat.title}
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
								{stat.value}
							</p>
							{stat.description && (
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
									{stat.description}
								</p>
							)}
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Monthly Overview */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
							<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Resumo Mensal
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Comparativo com mês anterior
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">
								Pedidos este mês
							</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{stats.orders.thisMonth}
							</span>
						</div>
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">
								Total de pedidos
							</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{stats.orders.total}
							</span>
						</div>
						<div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
							<span className="text-gray-600 dark:text-gray-400">
								Produtos ativos
							</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{stats.products.active} / {stats.products.total}
							</span>
						</div>
						<div className="flex items-center justify-between py-3">
							<span className="text-gray-600 dark:text-gray-400">
								Receita mês passado
							</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{formatCurrency(stats.revenue.lastMonth)}
							</span>
						</div>
					</div>
				</motion.div>

				{/* Active Users */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
							<Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Usuários Ativos
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Últimos 30 minutos
							</p>
						</div>
					</div>

					{activeUsers.length === 0 ? (
						<div className="text-center py-8">
							<Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
							<p className="text-gray-500 dark:text-gray-400">
								Nenhum usuário ativo no momento
							</p>
						</div>
					) : (
						<div className="space-y-3 max-h-64 overflow-y-auto">
							{activeUsers.map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between py-2"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
											<span className="text-sm font-medium text-gray-600 dark:text-gray-300">
												{user.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900 dark:text-white">
												{user.name}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{user.email}
											</p>
										</div>
									</div>
									<div className="text-right">
										<span
											className={`inline-block px-2 py-0.5 text-xs rounded-full ${
												user.role === "admin"
													? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
													: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
											}`}
										>
											{user.role === "admin" ? "Admin" : "Vendedor"}
										</span>
										<p className="text-xs text-gray-400 mt-1">
											{formatRelativeTime(user.last_login_at)}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</motion.div>
			</div>

			{/* Quick Stats */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white"
			>
				<div className="flex items-center gap-3 mb-4">
					<Package className="w-8 h-8" />
					<h3 className="font-semibold text-lg">Sistema Vendinhas</h3>
				</div>
				<div className="grid md:grid-cols-4 gap-6">
					<div>
						<p className="text-white/70 text-sm">Vendedores Cadastrados</p>
						<p className="text-2xl font-bold">{stats.accounts.total}</p>
					</div>
					<div>
						<p className="text-white/70 text-sm">Clientes Totais</p>
						<p className="text-2xl font-bold">{stats.customers.total}</p>
					</div>
					<div>
						<p className="text-white/70 text-sm">Produtos Cadastrados</p>
						<p className="text-2xl font-bold">{stats.products.total}</p>
					</div>
					<div>
						<p className="text-white/70 text-sm">Pedidos Totais</p>
						<p className="text-2xl font-bold">{stats.orders.total}</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
