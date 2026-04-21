"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Package,
	PackageCheck,
	Truck,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { catalogApi, type OrderTrackingResponse } from "@/lib/api-public";

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

function formatDate(dateStr: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(dateStr));
}

type OrderStatus = OrderTrackingResponse["status"];

const STATUS_STEPS: {
	key: OrderStatus;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ key: "pending", label: "Aguardando confirmação", icon: Clock },
	{ key: "confirmed", label: "Confirmado", icon: CheckCircle },
	{ key: "shipping", label: "Em entrega", icon: Truck },
	{ key: "delivered", label: "Entregue", icon: PackageCheck },
];

const STATUS_ORDER: OrderStatus[] = [
	"pending",
	"confirmed",
	"shipping",
	"delivered",
];

function getStepIndex(status: OrderStatus) {
	if (status === "canceled") return -1;
	return STATUS_ORDER.indexOf(status);
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
	pending: "Aguardando pagamento",
	confirmed: "Pago",
	canceled: "Cancelado",
};

export default function OrderTrackingPage() {
	const params = useParams();
	const orderNumber = params.orderNumber as string;
	const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		catalogApi
			.trackOrder(orderNumber)
			.then((res) => setOrder(res.data))
			.catch(() => toast.error("Pedido não encontrado"))
			.finally(() => setLoading(false));
	}, [orderNumber]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
				<div className="text-center">
					<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
					<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
						Pedido não encontrado
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mb-6">
						Verifique o número do pedido e tente novamente.
					</p>
					<Link
						href="/"
						className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Voltar ao início
					</Link>
				</div>
			</div>
		);
	}

	const currentStep = getStepIndex(order.status);
	const isCanceled = order.status === "canceled";

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-sm">
				<div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
					<Link
						href="/"
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					</Link>
					<div>
						<h1 className="font-bold text-xl text-gray-900 dark:text-white">
							Acompanhar Pedido
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{order.store_name}
						</p>
					</div>
				</div>
			</header>

			<main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
				{/* Order number + status summary */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Número do pedido
							</p>
							<p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">
								{order.order_number}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
								{formatCurrency(order.total)}
							</p>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
								isCanceled
									? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
									: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
							}`}
						>
							{isCanceled ? (
								<XCircle className="w-3.5 h-3.5" />
							) : (
								<Clock className="w-3.5 h-3.5" />
							)}
							{isCanceled
								? "Cancelado"
								: (STATUS_STEPS[currentStep]?.label ?? order.status)}
						</span>
						<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
							{PAYMENT_STATUS_LABEL[order.payment_status] ??
								order.payment_status}
						</span>
					</div>

					<p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
						Pedido em {formatDate(order.created_at)}
					</p>
					{order.delivery_date && (
						<p className="text-xs text-gray-400 dark:text-gray-500">
							Entrega prevista: {formatDate(order.delivery_date)}
						</p>
					)}
				</motion.div>

				{/* Status timeline */}
				{!isCanceled && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
					>
						<h2 className="font-semibold text-gray-900 dark:text-white mb-6">
							Status do Pedido
						</h2>

						<div className="relative">
							{/* Vertical line */}
							<div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700" />

							<div className="space-y-6">
								{STATUS_STEPS.map((s, i) => {
									const done = i <= currentStep;
									const active = i === currentStep;

									return (
										<div
											key={s.key}
											className="flex items-center gap-4 relative"
										>
											<div
												className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
													done
														? "bg-primary-600 text-white"
														: "bg-gray-100 dark:bg-gray-700 text-gray-400"
												} ${active ? "ring-4 ring-primary-100 dark:ring-primary-900/50" : ""}`}
											>
												<s.icon className="w-5 h-5" />
											</div>
											<div>
												<p
													className={`font-medium ${
														done
															? "text-gray-900 dark:text-white"
															: "text-gray-400 dark:text-gray-500"
													}`}
												>
													{s.label}
												</p>
												{active && (
													<p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
														Status atual
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</motion.div>
				)}

				{/* Items */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
				>
					<h2 className="font-semibold text-gray-900 dark:text-white mb-4">
						Itens do Pedido
					</h2>
					<div className="space-y-3">
						{order.items.map((item, i) => (
							<div
								key={i}
								className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
							>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
										<Package className="w-5 h-5 text-gray-400" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900 dark:text-white">
											{item.product?.name ?? "Produto removido"}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{item.quantity}x {formatCurrency(item.unit_price)}
										</p>
									</div>
								</div>
								<p className="text-sm font-semibold text-gray-900 dark:text-white">
									{formatCurrency(item.total)}
								</p>
							</div>
						))}
					</div>

					{/* Totals */}
					<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
						{order.discount > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-500 dark:text-gray-400">
									Desconto
								</span>
								<span className="text-green-600">
									-{formatCurrency(order.discount)}
								</span>
							</div>
						)}
						<div className="flex justify-between font-semibold">
							<span className="text-gray-900 dark:text-white">Total</span>
							<span className="text-primary-600 dark:text-primary-400">
								{formatCurrency(order.total)}
							</span>
						</div>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
