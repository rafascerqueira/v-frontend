"use client";

import { motion } from "framer-motion";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	FileText,
	MoreVertical,
	Search,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Billing {
	id: number;
	billing_number: string;
	order_id: number;
	status: "pending" | "partial" | "paid" | "overdue" | "canceled";
	total_amount: number;
	paid_amount: number;
	payment_method: string;
	payment_status: string;
	due_date: string;
	payment_date?: string;
	notes?: string;
	createdAt: string;
	order?: {
		id: number;
		order_number: string;
		customer?: {
			id: string;
			name: string;
		};
	};
}

const statusConfig: Record<
	string,
	{
		label: string;
		variant: "default" | "success" | "warning" | "error" | "info";
		icon: React.ElementType;
	}
> = {
	pending: { label: "Pendente", variant: "warning", icon: Clock },
	partial: { label: "Parcial", variant: "info", icon: AlertCircle },
	paid: { label: "Pago", variant: "success", icon: CheckCircle },
	overdue: { label: "Vencido", variant: "error", icon: AlertCircle },
	canceled: { label: "Cancelado", variant: "default", icon: XCircle },
};

const paymentMethodLabels: Record<string, string> = {
	cash: "Dinheiro",
	credit_card: "Cartão de Crédito",
	debit_card: "Cartão de Débito",
	pix: "PIX",
};

export default function BillingsPage() {
	const [billings, setBillings] = useState<Billing[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [viewingBilling, setViewingBilling] = useState<Billing | null>(null);
	const [activeMenu, setActiveMenu] = useState<number | null>(null);
	const [updatingBilling, setUpdatingBilling] = useState<Billing | null>(null);

	const fetchBillings = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/billings");
			setBillings(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Erro ao carregar cobranças");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBillings();
	}, [fetchBillings]);

	const handleUpdateStatus = async (
		billingId: number,
		status: string,
		paidAmount?: number,
	) => {
		try {
			await api.patch(`/billings/${billingId}`, {
				status,
				paid_amount: paidAmount,
				payment_date: status === "paid" ? new Date().toISOString() : undefined,
			});
			toast.success("Cobrança atualizada!");
			fetchBillings();
			setActiveMenu(null);
			setUpdatingBilling(null);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao atualizar cobrança";
			toast.error(message);
		}
	};

	const filteredBillings = billings.filter(
		(billing) =>
			billing.billing_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
			billing.order?.order_number
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			billing.order?.customer?.name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()),
	);

	const totalPending = billings
		.filter((b) => b.status === "pending" || b.status === "partial")
		.reduce((acc, b) => acc + (b.total_amount - b.paid_amount), 0);

	const totalPaid = billings
		.filter((b) => b.status === "paid")
		.reduce((acc, b) => acc + b.paid_amount, 0);

	const totalOverdue = billings
		.filter((b) => b.status === "overdue")
		.reduce((acc, b) => acc + (b.total_amount - b.paid_amount), 0);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Cobranças</h1>
					<p className="text-gray-500 mt-1">
						Gerencie suas cobranças e pagamentos
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-yellow-100 rounded-lg">
								<Clock className="h-6 w-6 text-yellow-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Pendente</p>
								<p className="text-xl font-bold text-gray-900">
									{formatCurrency(totalPending)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Recebido</p>
								<p className="text-xl font-bold text-gray-900">
									{formatCurrency(totalPaid)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-red-100 rounded-lg">
								<AlertCircle className="h-6 w-6 text-red-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Vencido</p>
								<p className="text-xl font-bold text-gray-900">
									{formatCurrency(totalOverdue)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-indigo-500" />
							Lista de Cobranças
						</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar cobranças..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
						</div>
					) : filteredBillings.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<FileText className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">Nenhuma cobrança encontrada</p>
							<p className="text-sm">
								As cobranças são geradas a partir dos pedidos
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Cobrança</TableCell>
									<TableCell as="th">Pedido / Cliente</TableCell>
									<TableCell as="th">Vencimento</TableCell>
									<TableCell as="th">Valor</TableCell>
									<TableCell as="th">Pago</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBillings.map((billing, index) => {
									const status =
										statusConfig[billing.status] || statusConfig.pending;
									const StatusIcon = status.icon;
									return (
										<motion.tr
											key={billing.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="hover:bg-gray-50 transition-colors"
										>
											<TableCell>
												<code className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
													{billing.billing_number}
												</code>
											</TableCell>
											<TableCell>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{billing.order?.order_number || "-"}
													</p>
													<p className="text-xs text-gray-500">
														{billing.order?.customer?.name ||
															"Cliente não encontrado"}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Calendar className="h-3.5 w-3.5" />
													{formatDate(billing.due_date)}
												</div>
											</TableCell>
											<TableCell>
												<span className="font-medium text-gray-900">
													{formatCurrency(billing.total_amount)}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-green-600 font-medium">
													{formatCurrency(billing.paid_amount)}
												</span>
											</TableCell>
											<TableCell>
												<Badge
													variant={status.variant}
													className="flex items-center gap-1 w-fit"
												>
													<StatusIcon className="h-3 w-3" />
													{status.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="relative inline-block">
													<button
														type="button"
														onClick={() =>
															setActiveMenu(
																activeMenu === billing.id ? null : billing.id,
															)
														}
														className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
													>
														<MoreVertical className="h-4 w-4 text-gray-500" />
													</button>
													{activeMenu === billing.id && (
														<motion.div
															initial={{ opacity: 0, scale: 0.95 }}
															animate={{ opacity: 1, scale: 1 }}
															className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
														>
															<button
																type="button"
																onClick={() => {
																	setViewingBilling(billing);
																	setActiveMenu(null);
																}}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
															>
																<FileText className="h-4 w-4" />
																Ver Detalhes
															</button>
															<div className="border-t border-gray-100 my-1" />
															<button
																type="button"
																onClick={() => {
																	setUpdatingBilling(billing);
																	setActiveMenu(null);
																}}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
															>
																<CreditCard className="h-4 w-4" />
																Registrar Pagamento
															</button>
															<button
																type="button"
																onClick={() =>
																	handleUpdateStatus(billing.id, "canceled")
																}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
															>
																<XCircle className="h-4 w-4" />
																Cancelar
															</button>
														</motion.div>
													)}
												</div>
											</TableCell>
										</motion.tr>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* View Billing Modal */}
			<Modal
				isOpen={!!viewingBilling}
				onClose={() => setViewingBilling(null)}
				title={`Cobrança ${viewingBilling?.billing_number}`}
				size="lg"
			>
				{viewingBilling && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">Pedido</p>
								<p className="font-medium">
									{viewingBilling.order?.order_number}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Cliente</p>
								<p className="font-medium">
									{viewingBilling.order?.customer?.name}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Vencimento</p>
								<p className="font-medium">
									{formatDate(viewingBilling.due_date)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Forma de Pagamento</p>
								<p className="font-medium">
									{paymentMethodLabels[viewingBilling.payment_method] ||
										viewingBilling.payment_method}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Valor Total</p>
								<p className="font-medium text-lg">
									{formatCurrency(viewingBilling.total_amount)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Valor Pago</p>
								<p className="font-medium text-lg text-green-600">
									{formatCurrency(viewingBilling.paid_amount)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Status</p>
								<Badge
									variant={
										statusConfig[viewingBilling.status]?.variant || "default"
									}
								>
									{statusConfig[viewingBilling.status]?.label ||
										viewingBilling.status}
								</Badge>
							</div>
							{viewingBilling.payment_date && (
								<div>
									<p className="text-sm text-gray-500">Data do Pagamento</p>
									<p className="font-medium">
										{formatDate(viewingBilling.payment_date)}
									</p>
								</div>
							)}
						</div>
						{viewingBilling.notes && (
							<div>
								<p className="text-sm text-gray-500">Observações</p>
								<p className="text-gray-700">{viewingBilling.notes}</p>
							</div>
						)}
						<div className="flex justify-end pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setViewingBilling(null)}
							>
								Fechar
							</Button>
						</div>
					</div>
				)}
			</Modal>

			{/* Payment Modal */}
			<Modal
				isOpen={!!updatingBilling}
				onClose={() => setUpdatingBilling(null)}
				title="Registrar Pagamento"
				size="sm"
			>
				{updatingBilling && (
					<div className="space-y-4">
						<div>
							<p className="text-sm text-gray-500">Valor Pendente</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(
									updatingBilling.total_amount - updatingBilling.paid_amount,
								)}
							</p>
						</div>
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								className="flex-1"
								onClick={() =>
									handleUpdateStatus(
										updatingBilling.id,
										"partial",
										updatingBilling.paid_amount +
										Math.floor(
											(updatingBilling.total_amount -
												updatingBilling.paid_amount) /
											2,
										),
									)
								}
							>
								Pagamento Parcial
							</Button>
							<Button
								type="button"
								className="flex-1"
								onClick={() =>
									handleUpdateStatus(
										updatingBilling.id,
										"paid",
										updatingBilling.total_amount,
									)
								}
							>
								Pago Total
							</Button>
						</div>
						<div className="flex justify-end pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setUpdatingBilling(null)}
							>
								Cancelar
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}
