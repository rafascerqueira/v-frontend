"use client";

import { motion } from "framer-motion";
import { Calendar, Download, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";

const salesData = [
	{ month: "Jan", vendas: 4000, meta: 4500 },
	{ month: "Fev", vendas: 3000, meta: 4500 },
	{ month: "Mar", vendas: 5000, meta: 4500 },
	{ month: "Abr", vendas: 4500, meta: 4500 },
	{ month: "Mai", vendas: 6000, meta: 5000 },
	{ month: "Jun", vendas: 5500, meta: 5000 },
	{ month: "Jul", vendas: 7000, meta: 5500 },
	{ month: "Ago", vendas: 6500, meta: 5500 },
	{ month: "Set", vendas: 8000, meta: 6000 },
	{ month: "Out", vendas: 7500, meta: 6000 },
	{ month: "Nov", vendas: 9000, meta: 6500 },
	{ month: "Dez", vendas: 10000, meta: 7000 },
];

const categoryData = [
	{ name: "Eletrônicos", value: 35, color: "#6366f1" },
	{ name: "Vestuário", value: 25, color: "#8b5cf6" },
	{ name: "Alimentos", value: 20, color: "#a855f7" },
	{ name: "Casa", value: 12, color: "#d946ef" },
	{ name: "Outros", value: 8, color: "#ec4899" },
];

const weeklyData = [
	{ day: "Seg", pedidos: 12 },
	{ day: "Ter", pedidos: 19 },
	{ day: "Qua", pedidos: 15 },
	{ day: "Qui", pedidos: 22 },
	{ day: "Sex", pedidos: 28 },
	{ day: "Sáb", pedidos: 35 },
	{ day: "Dom", pedidos: 18 },
];

const topProducts = [
	{ name: "Smartphone XYZ", vendas: 142, receita: 28400 },
	{ name: "Notebook Pro", vendas: 98, receita: 49000 },
	{ name: "Fone Bluetooth", vendas: 87, receita: 8700 },
	{ name: "Smart Watch", vendas: 65, receita: 13000 },
	{ name: "Tablet Plus", vendas: 52, receita: 15600 },
];

export default function ReportsPage() {
	const [period, setPeriod] = useState("month");

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
					<p className="text-gray-500 mt-1">Análise detalhada do seu negócio</p>
				</div>
				<div className="flex gap-2">
					<div className="flex bg-gray-100 rounded-lg p-1">
						{["week", "month", "year"].map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => setPeriod(p)}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === p
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-600 hover:text-gray-900"
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
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Exportar
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{[
					{
						label: "Receita Total",
						value: formatCurrency(76500),
						change: "+12.5%",
						positive: true,
					},
					{ label: "Pedidos", value: "342", change: "+8.2%", positive: true },
					{
						label: "Ticket Médio",
						value: formatCurrency(223.68),
						change: "+3.1%",
						positive: true,
					},
					{
						label: "Taxa de Conversão",
						value: "3.2%",
						change: "-0.5%",
						positive: false,
					},
				].map((stat) => (
					<Card key={stat.label}>
						<CardContent className="p-4">
							<p className="text-sm text-gray-500">{stat.label}</p>
							<p className="text-2xl font-bold text-gray-900 mt-1">
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
										<Bar dataKey="meta" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
							<div className="flex justify-center gap-6 mt-4">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-indigo-500 rounded" />
									<span className="text-sm text-gray-600">Vendas</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 bg-gray-200 rounded" />
									<span className="text-sm text-gray-600">Meta</span>
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
							</div>
							<div className="flex flex-wrap justify-center gap-4 mt-4">
								{categoryData.map((cat) => (
									<div key={cat.name} className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded"
											style={{ backgroundColor: cat.color }}
										/>
										<span className="text-sm text-gray-600">{cat.name}</span>
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
								{topProducts.map((product, index) => (
									<div key={product.name} className="flex items-center gap-4">
										<div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600">
											{index + 1}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{product.name}
											</p>
											<p className="text-xs text-gray-500">
												{product.vendas} vendas
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-gray-900">
												{formatCurrency(product.receita)}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
