"use client";

import { motion } from "framer-motion";
import {
	Calendar,
	FileSpreadsheet,
	FileText,
	Filter,
	Loader2,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExport } from "@/hooks/useExport";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
	summary: {
		totalRevenue: number;
		revenueChange: number;
		totalOrders: number;
		ordersChange: number;
		avgTicket: number;
		avgTicketChange: number;
		conversionRate: number;
		conversionChange: number;
	};
	salesData: Array<{ month: string; vendas: number; meta: number }>;
	categoryData: Array<{ name: string; value: number; color: string }>;
	weeklyData: Array<{ day: string; pedidos: number }>;
	topProducts: Array<{ name: string; vendas: number; receita: number }>;
}

type Period = "week" | "month" | "year";

export default function ReportsPage() {
	const [period, setPeriod] = useState<Period>("month");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<ReportData | null>(null);
	const { exportData, isExporting } = useExport();

	const fetchReport = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await api.get(`/reports?period=${period}`);
			setData(response.data);
		} catch (err) {
			console.error("Erro ao carregar relatórios:", err);
			setError("Erro ao carregar os dados. Tente novamente.");
		} finally {
			setIsLoading(false);
		}
	}, [period]);

	useEffect(() => {
		fetchReport();
	}, [fetchReport]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-96 gap-4">
				<p className="text-red-600">{error}</p>
				<Button onClick={fetchReport}>Tentar novamente</Button>
			</div>
		);
	}

	const summary = data?.summary;
	const salesData = data?.salesData || [];
	const categoryData = data?.categoryData || [];
	const weeklyData = data?.weeklyData || [];
	const topProducts = data?.topProducts || [];

	const revenueChange = summary?.revenueChange ?? 0;
	const ordersChange = summary?.ordersChange ?? 0;
	const avgTicketChange = summary?.avgTicketChange ?? 0;
	const conversionChange = summary?.conversionChange ?? 0;

	const summaryCards = [
		{
			label: "Receita Total",
			value: formatCurrency(summary?.totalRevenue ?? 0),
			change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
			positive: revenueChange >= 0,
		},
		{
			label: "Pedidos",
			value: String(summary?.totalOrders ?? 0),
			change: `${ordersChange >= 0 ? "+" : ""}${ordersChange}%`,
			positive: ordersChange >= 0,
		},
		{
			label: "Ticket Médio",
			value: formatCurrency(summary?.avgTicket ?? 0),
			change: `${avgTicketChange >= 0 ? "+" : ""}${avgTicketChange}%`,
			positive: avgTicketChange >= 0,
		},
		{
			label: "Taxa de Conversão",
			value: `${summary?.conversionRate?.toFixed(1) ?? 0}%`,
			change: `${conversionChange >= 0 ? "+" : ""}${conversionChange}%`,
			positive: conversionChange >= 0,
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Relatórios
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Análise detalhada do seu negócio
					</p>
				</div>
				<div className="flex gap-2">
					<div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
						{(["week", "month", "year"] as Period[]).map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => setPeriod(p)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									period === p
										? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
										: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
								}`}
							>
								{p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
							</button>
						))}
					</div>
					<Button variant="outline" size="sm">
						<Filter className="h-4 w-4 mr-2" />
						Filtros
					</Button>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportData("orders", "excel")}
							disabled={isExporting}
						>
							<FileSpreadsheet className="h-4 w-4 mr-1" />
							Excel
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => exportData("orders", "pdf")}
							disabled={isExporting}
						>
							<FileText className="h-4 w-4 mr-1" />
							PDF
						</Button>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{summaryCards.map((stat) => (
					<Card key={stat.label}>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{stat.label}
							</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
								{stat.value}
							</p>
							<p
								className={`text-sm mt-1 ${stat.positive ? "text-green-600" : "text-red-600"}`}
							>
								{stat.change} vs período anterior
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Sales Chart */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-green-500" />
								Vendas vs Meta
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-72">
								{salesData.length > 0 ? (
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={salesData}>
											<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
											<XAxis dataKey="month" fontSize={12} tickLine={false} />
											<YAxis fontSize={12} tickLine={false} axisLine={false} />
											<Tooltip
												formatter={(value) => formatCurrency(Number(value))}
												contentStyle={{
													borderRadius: 8,
													border: "1px solid #e5e7eb",
												}}
											/>
											<Bar
												dataKey="vendas"
												fill="#6366f1"
												radius={[4, 4, 0, 0]}
											/>
											<Bar
												dataKey="meta"
												fill="#e5e7eb"
												radius={[4, 4, 0, 0]}
											/>
										</BarChart>
									</ResponsiveContainer>
								) : (
									<div className="flex items-center justify-center h-full text-gray-500">
										Nenhum dado disponível
									</div>
								)}
							</div>
							<div className="flex justify-center gap-6 mt-4">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-indigo-500 rounded" />
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Vendas
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-gray-200 rounded" />
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Meta
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Category Distribution */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-purple-500" />
								Vendas por Categoria
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-72 flex items-center justify-center">
								{categoryData.length > 0 ? (
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categoryData}
												cx="50%"
												cy="50%"
												innerRadius={60}
												outerRadius={100}
												paddingAngle={2}
												dataKey="value"
											>
												{categoryData.map((entry) => (
													<Cell key={entry.name} fill={entry.color} />
												))}
											</Pie>
											<Tooltip
												formatter={(value) => `${value}%`}
												contentStyle={{
													borderRadius: 8,
													border: "1px solid #e5e7eb",
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
								) : (
									<div className="text-gray-500">Nenhum dado disponível</div>
								)}
							</div>
							<div className="flex flex-wrap justify-center gap-4 mt-4">
								{categoryData.map((cat) => (
									<div key={cat.name} className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded"
											style={{ backgroundColor: cat.color }}
										/>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											{cat.name}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Weekly Orders and Top Products */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Weekly Orders */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>Pedidos por Dia da Semana</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-64">
								{weeklyData.some((d) => d.pedidos > 0) ? (
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={weeklyData}>
											<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
											<XAxis dataKey="day" fontSize={12} tickLine={false} />
											<YAxis fontSize={12} tickLine={false} axisLine={false} />
											<Tooltip
												contentStyle={{
													borderRadius: 8,
													border: "1px solid #e5e7eb",
												}}
											/>
											<Line
												type="monotone"
												dataKey="pedidos"
												stroke="#6366f1"
												strokeWidth={2}
												dot={{ fill: "#6366f1", strokeWidth: 2 }}
											/>
										</LineChart>
									</ResponsiveContainer>
								) : (
									<div className="flex items-center justify-center h-full text-gray-500">
										Nenhum pedido no período
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Top Products */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>Produtos Mais Vendidos</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{topProducts.length > 0 ? (
									topProducts.map((product, index) => (
										<div key={product.name} className="flex items-center gap-4">
											<div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
												{index + 1}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
													{product.name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{product.vendas} vendas
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium text-gray-900 dark:text-white">
													{formatCurrency(product.receita)}
												</p>
											</div>
										</div>
									))
								) : (
									<div className="text-center text-gray-500 py-8">
										Nenhum produto vendido no período
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
