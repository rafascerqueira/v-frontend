"use client";

import { motion } from "framer-motion";
import {
	Clock,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const statusColors: Record<string, string> = {
	pending:
		"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
	confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
	shipping:
		"bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300",
	delivered:
		"bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
	canceled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
	pending: "Pendente",
	confirmed: "Confirmado",
	shipping: "Em trânsito",
	delivered: "Entregue",
	canceled: "Cancelado",
};

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchStats = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/dashboard/stats");
			setStats(data);
		} catch (error) {
			console.error("Erro ao carregar estatísticas:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	const statCards = [
		{
			name: "Receita Total",
			value: formatCurrency(stats?.totalRevenue || 0),
			icon: DollarSign,
			color: "bg-green-500",
		},
		{
			name: "Pedidos",
			value: stats?.totalOrders?.toString() || "0",
			subtitle: `${stats?.pendingOrders || 0} pendentes`,
			icon: ShoppingCart,
			color: "bg-blue-500",
		},
		{
			name: "Clientes",
			value: stats?.totalCustomers?.toString() || "0",
			icon: Users,
			color: "bg-secondary-500",
		},
		{
			name: "Produtos",
			value: stats?.totalProducts?.toString() || "0",
			icon: Package,
			color: "bg-orange-500",
		},
	];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
				<p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
			</div>

			{/* Stats Grid */}
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
			>
				{statCards.map((stat) => (
					<motion.div key={stat.name} variants={item}>
						<Card className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className={cn("p-3 rounded-xl", stat.color)}>
										<stat.icon className="h-6 w-6 text-white" />
									</div>
									{stat.subtitle && (
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<Clock className="h-4 w-4" />
											{stat.subtitle}
										</div>
									)}
								</div>
								<div className="mt-4">
									<p className="text-2xl font-bold text-foreground">
										{stat.value}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{stat.name}
									</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</motion.div>

			{/* Charts and Tables Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Sales Chart Placeholder */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="lg:col-span-2"
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-green-500" />
								Vendas dos últimos 30 dias
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-64 flex items-center justify-center bg-surface-muted rounded-lg">
								<p className="text-subtle-foreground">
									Gráfico de vendas em breve
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Top Products */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<Card className="h-full">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="h-5 w-5 text-orange-500" />
								Produtos mais vendidos
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{(stats?.topProducts || []).length > 0 ? (
									stats?.topProducts.map((product, index) => (
										<div key={product.name} className="flex items-center gap-3">
											<div className="w-8 h-8 bg-surface-muted rounded-lg flex items-center justify-center text-sm font-medium text-muted-foreground">
												{index + 1}
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium text-foreground">
													{product.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{product.sales} vendas
												</p>
											</div>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground text-center py-4">
										Nenhum produto vendido ainda
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Recent Orders */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
			>
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<ShoppingCart className="h-5 w-5 text-blue-500" />
								Pedidos Recentes
							</CardTitle>
							<a
								href="/orders"
								className="text-sm text-primary-600 hover:text-primary-700 font-medium"
							>
								Ver todos →
							</a>
						</div>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
											Pedido
										</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
											Cliente
										</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
											Total
										</th>
										<th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{(stats?.recentOrders || []).length > 0 ? (
										stats?.recentOrders.map((order) => (
											<tr
												key={order.id}
												className="border-b border-border hover:bg-surface-muted transition-colors"
											>
												<td className="py-3 px-4 text-sm font-medium text-foreground">
													{order.orderNumber}
												</td>
												<td className="py-3 px-4 text-sm text-muted-foreground">
													{order.customer}
												</td>
												<td className="py-3 px-4 text-sm font-medium text-foreground">
													{formatCurrency(order.total)}
												</td>
												<td className="py-3 px-4">
													<span
														className={cn(
															"inline-flex px-2 py-1 text-xs font-medium rounded-full",
															statusColors[order.status] ||
																"bg-surface-muted text-foreground",
														)}
													>
														{statusLabels[order.status] || order.status}
													</span>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={4}
												className="py-8 text-center text-muted-foreground"
											>
												Nenhum pedido recente
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
