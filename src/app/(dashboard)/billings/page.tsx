"use client";

import { motion } from "framer-motion";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	DollarSign,
	FileText,
	MoreVertical,
	Pencil,
	Search,
	ShoppingCart,
	Trash2,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
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
		status?: string;
		customer?: { id: string; name: string };
	};
}

type StatusFilter = "all" | "pending" | "partial" | "paid" | "overdue" | "canceled";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "Todas" },
	{ value: "pending", label: "Pendente" },
	{ value: "partial", label: "Parcial" },
	{ value: "overdue", label: "Vencido" },
	{ value: "paid", label: "Pago" },
	{ value: "canceled", label: "Cancelado" },
];

const statusConfig: Record<
	string,
	{ label: string; variant: "default" | "success" | "warning" | "error" | "info"; icon: React.ElementType }
> = {
	pending: { label: "Pendente", variant: "warning", icon: Clock },
	partial: { label: "Parcial", variant: "info", icon: AlertCircle },
	paid: { label: "Pago", variant: "success", icon: CheckCircle },
	overdue: { label: "Vencido", variant: "error", icon: AlertCircle },
	canceled: { label: "Cancelado", variant: "default", icon: XCircle },
};

const orderStatusConfig: Record<
	string,
	{ label: string; variant: "default" | "success" | "warning" | "error" | "info"; icon: React.ElementType }
> = {
	pending: { label: "Pendente", variant: "warning", icon: Clock },
	confirmed: { label: "Confirmado", variant: "info", icon: CheckCircle },
	shipping: { label: "Em trânsito", variant: "info", icon: ShoppingCart },
	delivered: { label: "Entregue", variant: "success", icon: CheckCircle },
	canceled: { label: "Cancelado", variant: "default", icon: XCircle },
};

const PAYMENT_METHODS = [
	{ value: "cash", label: "Dinheiro" },
	{ value: "credit_card", label: "Cartão de Crédito" },
	{ value: "debit_card", label: "Cartão de Débito" },
	{ value: "pix", label: "PIX" },
];

const paymentMethodLabel = (method: string) =>
	PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

export default function BillingsPage() {
	const [billings, setBillings] = useState<Billing[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [activeMenu, setActiveMenu] = useState<number | null>(null);

	// modals
	const [viewingBilling, setViewingBilling] = useState<Billing | null>(null);
	const [updatingBilling, setUpdatingBilling] = useState<Billing | null>(null);
	const [editingBilling, setEditingBilling] = useState<Billing | null>(null);
	const [partialAmount, setPartialAmount] = useState(0);
	const [paymentMethod, setPaymentMethod] = useState("cash");

	// edit form state
	const [editDueDate, setEditDueDate] = useState("");
	const [editNotes, setEditNotes] = useState("");
	const [editPaymentMethod, setEditPaymentMethod] = useState("cash");

	const fetchBillings = useCallback(async () => {
		try {
			setIsLoading(true);
			await api.post("/billings/sync").catch(() => null); // best-effort sync
			const { data } = await api.get("/billings");
			setBillings(Array.isArray(data) ? data : []);
		} catch {
			toast.error("Erro ao carregar cobranças");
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
		method?: string,
	) => {
		try {
			await api.patch(`/billings/${billingId}`, {
				status,
				paid_amount: paidAmount,
				payment_method: method,
			});
			toast.success("Cobrança atualizada!");
			fetchBillings();
			setActiveMenu(null);
			setUpdatingBilling(null);
		} catch (error: unknown) {
			const msg =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
				"Erro ao atualizar cobrança";
			toast.error(msg);
		}
	};

	const handleEdit = async () => {
		if (!editingBilling) return;
		try {
			await api.patch(`/billings/${editingBilling.id}`, {
				due_date: editDueDate ? new Date(editDueDate).toISOString() : undefined,
				notes: editNotes || undefined,
				payment_method: editPaymentMethod,
			});
			toast.success("Cobrança atualizada!");
			fetchBillings();
			setEditingBilling(null);
		} catch {
			toast.error("Erro ao atualizar cobrança");
		}
	};

	const handleDelete = async (billingId: number) => {
		if (!confirm("Excluir esta cobrança permanentemente?")) return;
		try {
			await api.delete(`/billings/${billingId}`);
			toast.success("Cobrança excluída!");
			fetchBillings();
			setActiveMenu(null);
		} catch {
			toast.error("Erro ao excluir cobrança");
		}
	};

	const openEditModal = (billing: Billing) => {
		setEditingBilling(billing);
		setEditDueDate(billing.due_date ? billing.due_date.slice(0, 10) : "");
		setEditNotes(billing.notes ?? "");
		setEditPaymentMethod(billing.payment_method || "cash");
		setActiveMenu(null);
	};

	const openPaymentModal = (billing: Billing) => {
		setUpdatingBilling(billing);
		setPartialAmount(billing.total_amount - billing.paid_amount);
		setPaymentMethod(billing.payment_method || "cash");
		setActiveMenu(null);
	};

	// Filtering
	const filteredBillings = billings.filter((b) => {
		const matchesStatus = statusFilter === "all" || b.status === statusFilter;
		const term = searchTerm.toLowerCase();
		const matchesSearch =
			!term ||
			b.billing_number.toLowerCase().includes(term) ||
			b.order?.order_number?.toLowerCase().includes(term) ||
			b.order?.customer?.name?.toLowerCase().includes(term);
		return matchesStatus && matchesSearch;
	});

	// Stats (always computed from all billings, not filtered)
	const totalPending = billings
		.filter((b) => b.status === "pending" || b.status === "partial")
		.reduce((acc, b) => acc + (b.total_amount - b.paid_amount), 0);
	const totalPaid = billings
		.filter((b) => b.status === "paid")
		.reduce((acc, b) => acc + b.paid_amount, 0);
	const totalOverdue = billings
		.filter((b) => b.status === "overdue")
		.reduce((acc, b) => acc + (b.total_amount - b.paid_amount), 0);
	const totalSales = billings
		.filter((b) => b.status !== "canceled")
		.reduce((acc, b) => acc + b.total_amount, 0);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cobranças</h1>
				<p className="text-gray-500 mt-1">Gerencie suas cobranças e pagamentos</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: "Total de Vendas", value: totalSales, color: "blue", icon: DollarSign },
					{ label: "Pendente", value: totalPending, color: "yellow", icon: Clock },
					{ label: "Recebido", value: totalPaid, color: "green", icon: CheckCircle },
					{ label: "Vencido", value: totalOverdue, color: "red", icon: AlertCircle },
				].map(({ label, value, color, icon: Icon }) => (
					<Card key={label}>
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								<div className={`p-3 bg-${color}-100 rounded-lg`}>
									<Icon className={`h-6 w-6 text-${color}-600`} />
								</div>
								<div>
									<p className="text-sm text-gray-500">{label}</p>
									<p className="text-xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(value)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-primary-500" />
								Lista de Cobranças
							</CardTitle>
							<div className="relative w-full sm:w-64">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar cobranças..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>
						</div>

						{/* Status filter tabs */}
						<div className="flex gap-1 overflow-x-auto pb-1">
							{STATUS_TABS.map((tab) => {
								const count =
									tab.value === "all"
										? billings.length
										: billings.filter((b) => b.status === tab.value).length;
								return (
									<button
										key={tab.value}
										type="button"
										onClick={() => setStatusFilter(tab.value)}
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
											statusFilter === tab.value
												? "bg-primary-600 text-white"
												: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
										}`}
									>
										{tab.label}
										<span
											className={`text-xs px-1.5 py-0.5 rounded-full ${
												statusFilter === tab.value
													? "bg-white/20 text-white"
													: "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
											}`}
										>
											{count}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
						</div>
					) : filteredBillings.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<FileText className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">Nenhuma cobrança encontrada</p>
							<p className="text-sm">As cobranças são geradas a partir dos pedidos</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Cobrança</TableCell>
									<TableCell as="th">Pedido / Cliente</TableCell>
									<TableCell as="th">Pedido</TableCell>
									<TableCell as="th">Vencimento</TableCell>
									<TableCell as="th">Forma de Pgto</TableCell>
									<TableCell as="th">Valor</TableCell>
									<TableCell as="th">Pago</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">Ações</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBillings.map((billing, index) => {
									const status = statusConfig[billing.status] ?? statusConfig.pending;
									const StatusIcon = status.icon;
									return (
										<motion.tr
											key={billing.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.03 }}
											className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
										>
											<TableCell>
												<code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
													{billing.billing_number}
												</code>
											</TableCell>
											<TableCell>
												<div>
													<p className="text-sm font-medium text-gray-900 dark:text-white">
														{billing.order?.order_number ?? "-"}
													</p>
													<p className="text-xs text-gray-500">
														{billing.order?.customer?.name ?? "Cliente não encontrado"}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{(() => {
													const os = orderStatusConfig[billing.order?.status ?? ""];
													if (!os) return "-";
													const OsIcon = os.icon;
													return (
														<Badge variant={os.variant} className="flex items-center gap-1 w-fit">
															<OsIcon className="h-3 w-3" />
															{os.label}
														</Badge>
													);
												})()}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
													<Calendar className="h-3.5 w-3.5" />
													{formatDate(billing.due_date)}
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{paymentMethodLabel(billing.payment_method)}
												</span>
											</TableCell>
											<TableCell>
												<span className="font-medium text-gray-900 dark:text-white">
													{formatCurrency(billing.total_amount)}
												</span>
											</TableCell>
											<TableCell>
												<div>
													<span className="text-green-600 font-medium">
														{formatCurrency(billing.paid_amount)}
													</span>
													{billing.paid_amount > 0 && billing.paid_amount < billing.total_amount && (
														<p className="text-xs text-gray-400">
															Falta {formatCurrency(billing.total_amount - billing.paid_amount)}
														</p>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={status.variant} className="flex items-center gap-1 w-fit">
													<StatusIcon className="h-3 w-3" />
													{status.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="relative inline-block">
													<button
														type="button"
														onClick={() =>
															setActiveMenu(activeMenu === billing.id ? null : billing.id)
														}
														className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
													>
														<MoreVertical className="h-4 w-4 text-gray-500" />
													</button>
													{activeMenu === billing.id && (
														<motion.div
															initial={{ opacity: 0, scale: 0.95 }}
															animate={{ opacity: 1, scale: 1 }}
															className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
														>
															<button
																type="button"
																onClick={() => { setViewingBilling(billing); setActiveMenu(null); }}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
															>
																<FileText className="h-4 w-4" />
																Ver Detalhes
															</button>
															{billing.status !== "paid" && billing.status !== "canceled" && (
																<>
																	<div className="border-t border-gray-100 dark:border-gray-700 my-1" />
																	<button
																		type="button"
																		onClick={() => openPaymentModal(billing)}
																		className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
																	>
																		<CreditCard className="h-4 w-4" />
																		Registrar Pagamento
																	</button>
																	<button
																		type="button"
																		onClick={() => openEditModal(billing)}
																		className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
																	>
																		<Pencil className="h-4 w-4" />
																		Editar Cobrança
																	</button>
																	<button
																		type="button"
																		onClick={() => {
																			if (confirm("Cancelar esta cobrança?")) {
																				handleUpdateStatus(billing.id, "canceled");
																			}
																		}}
																		className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
																	>
																		<XCircle className="h-4 w-4" />
																		Cancelar
																	</button>
																</>
															)}
															<div className="border-t border-gray-100 dark:border-gray-700 my-1" />
															<button
																type="button"
																onClick={() => handleDelete(billing.id)}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
															>
																<Trash2 className="h-4 w-4" />
																Excluir
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

			{/* Details Modal */}
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
								<p className="font-medium">{viewingBilling.order?.order_number}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Cliente</p>
								<p className="font-medium">{viewingBilling.order?.customer?.name ?? "-"}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Vencimento</p>
								<p className="font-medium">{formatDate(viewingBilling.due_date)}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Forma de Pagamento</p>
								<p className="font-medium">{paymentMethodLabel(viewingBilling.payment_method)}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Valor Total</p>
								<p className="font-medium text-lg">{formatCurrency(viewingBilling.total_amount)}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Valor Pago</p>
								<p className="font-medium text-lg text-green-600">
									{formatCurrency(viewingBilling.paid_amount)}
								</p>
							</div>
							{viewingBilling.total_amount > viewingBilling.paid_amount && viewingBilling.status !== "canceled" && (
								<div>
									<p className="text-sm text-gray-500">Saldo Pendente</p>
									<p className="font-medium text-orange-600">
										{formatCurrency(viewingBilling.total_amount - viewingBilling.paid_amount)}
									</p>
								</div>
							)}
							<div>
								<p className="text-sm text-gray-500">Status</p>
								<Badge variant={statusConfig[viewingBilling.status]?.variant ?? "default"}>
									{statusConfig[viewingBilling.status]?.label ?? viewingBilling.status}
								</Badge>
							</div>
							{viewingBilling.payment_date && (
								<div>
									<p className="text-sm text-gray-500">Data do Pagamento</p>
									<p className="font-medium">{formatDate(viewingBilling.payment_date)}</p>
								</div>
							)}
						</div>
						{viewingBilling.notes && (
							<div>
								<p className="text-sm text-gray-500">Observações</p>
								<p className="text-gray-700 dark:text-gray-300">{viewingBilling.notes}</p>
							</div>
						)}
						<div className="flex justify-end pt-2">
							<Button type="button" variant="outline" onClick={() => setViewingBilling(null)}>
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
							<p className="text-2xl font-bold text-gray-900 dark:text-white">
								{formatCurrency(updatingBilling.total_amount - updatingBilling.paid_amount)}
							</p>
						</div>

						<CurrencyInput
							label="Valor do Pagamento"
							value={partialAmount}
							onChange={setPartialAmount}
						/>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Forma de Pagamento
							</label>
							<select
								value={paymentMethod}
								onChange={(e) => setPaymentMethod(e.target.value)}
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							>
								{PAYMENT_METHODS.map((m) => (
									<option key={m.value} value={m.value}>{m.label}</option>
								))}
							</select>
						</div>

						{partialAmount > updatingBilling.total_amount - updatingBilling.paid_amount && (
							<p className="text-sm text-red-500">Valor excede o pendente</p>
						)}

						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								className="flex-1"
								disabled={
									partialAmount <= 0 ||
									partialAmount > updatingBilling.total_amount - updatingBilling.paid_amount
								}
								onClick={() => {
									const remaining = updatingBilling.total_amount - updatingBilling.paid_amount;
									const newPaid = updatingBilling.paid_amount + Math.min(partialAmount, remaining);
									const newStatus = newPaid >= updatingBilling.total_amount ? "paid" : "partial";
									handleUpdateStatus(updatingBilling.id, newStatus, newPaid, paymentMethod);
								}}
							>
								Registrar Parcial
							</Button>
							<Button
								type="button"
								className="flex-1"
								onClick={() =>
									handleUpdateStatus(
										updatingBilling.id,
										"paid",
										updatingBilling.total_amount,
										paymentMethod,
									)
								}
							>
								Pago Total
							</Button>
						</div>
						<div className="flex justify-end">
							<Button type="button" variant="ghost" onClick={() => setUpdatingBilling(null)}>
								Voltar
							</Button>
						</div>
					</div>
				)}
			</Modal>

			{/* Edit Modal */}
			<Modal
				isOpen={!!editingBilling}
				onClose={() => setEditingBilling(null)}
				title="Editar Cobrança"
				size="sm"
			>
				{editingBilling && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Data de Vencimento
							</label>
							<input
								type="date"
								value={editDueDate}
								onChange={(e) => setEditDueDate(e.target.value)}
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Forma de Pagamento
							</label>
							<select
								value={editPaymentMethod}
								onChange={(e) => setEditPaymentMethod(e.target.value)}
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							>
								{PAYMENT_METHODS.map((m) => (
									<option key={m.value} value={m.value}>{m.label}</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Observações
							</label>
							<textarea
								value={editNotes}
								onChange={(e) => setEditNotes(e.target.value)}
								rows={3}
								className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
								placeholder="Observações sobre esta cobrança..."
							/>
						</div>

						<div className="flex gap-3 pt-2">
							<Button type="button" variant="outline" className="flex-1" onClick={() => setEditingBilling(null)}>
								Cancelar
							</Button>
							<Button type="button" className="flex-1" onClick={handleEdit}>
								Salvar
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
}
