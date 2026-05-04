"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Ban,
	CalendarRange,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Crown,
	Filter,
	Plus,
	ShieldAlert,
	Sliders,
	Sparkles,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

type ExceptionType =
	| "unlimited_window"
	| "custom_limits"
	| "billing_adjustment"
	| "plan_grant";
type ExceptionStatus = "active" | "expired" | "revoked";

interface ExceptionRecord {
	id: string;
	account_id: string;
	type: ExceptionType;
	status: ExceptionStatus;
	effective_from: string;
	effective_until: string | null;
	metadata: Record<string, unknown>;
	reason: string;
	created_by: string;
	revoked_by: string | null;
	revoked_at: string | null;
	revoke_reason: string | null;
	createdAt: string;
}

interface ListResponse {
	data: ExceptionRecord[];
	total: number;
	page: number;
	limit: number;
}

interface AccountListItem {
	id: string;
	name: string;
	email: string;
	plan_type: string;
}

const TYPE_META: Record<
	ExceptionType,
	{ label: string; icon: typeof CalendarRange; color: string }
> = {
	unlimited_window: {
		label: "Janela ilimitada",
		icon: CalendarRange,
		color: "secondary",
	},
	custom_limits: {
		label: "Limites customizados",
		icon: Sliders,
		color: "orange",
	},
	billing_adjustment: {
		label: "Ajuste de cobrança",
		icon: CreditCard,
		color: "blue",
	},
	plan_grant: { label: "Plano presenteado", icon: Crown, color: "purple" },
};

const STATUS_META: Record<ExceptionStatus, { label: string; classes: string }> =
	{
		active: {
			label: "Ativo",
			classes:
				"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		expired: {
			label: "Expirado",
			classes: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
		},
		revoked: {
			label: "Revogado",
			classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
	};

function formatDateTime(iso: string | null) {
	if (!iso) return "—";
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(iso));
}

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
	}).format(new Date(iso));
}

interface CreateForm {
	accountId: string;
	type: ExceptionType;
	effectiveFrom: string;
	effectiveUntil: string;
	reason: string;
	maxProducts: string;
	maxCustomers: string;
	maxOrdersPerMonth: string;
	grantedPlan: "pro" | "enterprise";
	previousPlan: "free" | "pro";
	nextBillingDate: string;
	previousNextBillingDate: string;
}

const emptyCreateForm: CreateForm = {
	accountId: "",
	type: "unlimited_window",
	effectiveFrom: "",
	effectiveUntil: "",
	reason: "",
	maxProducts: "",
	maxCustomers: "",
	maxOrdersPerMonth: "",
	grantedPlan: "pro",
	previousPlan: "free",
	nextBillingDate: "",
	previousNextBillingDate: "",
};

export default function AdminExceptionsPage() {
	const [items, setItems] = useState<ExceptionRecord[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [loading, setLoading] = useState(true);
	const [filterType, setFilterType] = useState<ExceptionType | "">("");
	const [filterStatus, setFilterStatus] = useState<ExceptionStatus | "">("");
	const [accountSearch, setAccountSearch] = useState("");

	const [createOpen, setCreateOpen] = useState(false);
	const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
	const [accountSuggestions, setAccountSuggestions] = useState<
		AccountListItem[]
	>([]);
	const [submitting, setSubmitting] = useState(false);

	const [revokeTarget, setRevokeTarget] = useState<ExceptionRecord | null>(
		null,
	);
	const [revokeReason, setRevokeReason] = useState("");
	const [revoking, setRevoking] = useState(false);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("page", String(page));
			params.set("limit", String(limit));
			if (filterType) params.set("type", filterType);
			if (filterStatus) params.set("status", filterStatus);
			if (accountSearch) params.set("account_id", accountSearch);

			const { data } = await api.get<ListResponse>(
				`/admin/exceptions?${params.toString()}`,
			);
			setItems(data.data);
			setTotal(data.total);
		} catch (_error) {
			toast.error("Erro ao carregar exceções");
		} finally {
			setLoading(false);
		}
	}, [page, limit, filterType, filterStatus, accountSearch]);

	useEffect(() => {
		load();
	}, [load]);

	useEffect(() => {
		async function loadAccounts() {
			if (!createOpen) return;
			try {
				const { data } = await api.get<{ data: AccountListItem[] }>(
					"/admin/accounts?limit=50",
				);
				setAccountSuggestions(data.data);
			} catch {
				/* swallow */
			}
		}
		loadAccounts();
	}, [createOpen]);

	const handleCreate = async () => {
		if (!createForm.accountId) {
			toast.error("Selecione uma conta");
			return;
		}
		if (!createForm.effectiveFrom) {
			toast.error("Informe a data inicial");
			return;
		}
		if (createForm.reason.trim().length < 3) {
			toast.error("Informe uma razão (mínimo 3 caracteres)");
			return;
		}

		const payload: Record<string, unknown> = {
			type: createForm.type,
			effectiveFrom: new Date(createForm.effectiveFrom).toISOString(),
			effectiveUntil: createForm.effectiveUntil
				? new Date(createForm.effectiveUntil).toISOString()
				: null,
			reason: createForm.reason,
		};

		if (createForm.type === "unlimited_window") {
			payload.metadata = {};
		} else if (createForm.type === "custom_limits") {
			const metadata: Record<string, number> = {};
			if (createForm.maxProducts) {
				metadata.maxProducts = parseInt(createForm.maxProducts, 10);
			}
			if (createForm.maxCustomers) {
				metadata.maxCustomers = parseInt(createForm.maxCustomers, 10);
			}
			if (createForm.maxOrdersPerMonth) {
				metadata.maxOrdersPerMonth = parseInt(createForm.maxOrdersPerMonth, 10);
			}
			if (Object.keys(metadata).length === 0) {
				toast.error("Informe pelo menos um limite customizado");
				return;
			}
			payload.metadata = metadata;
		} else if (createForm.type === "plan_grant") {
			payload.metadata = {
				grantedPlan: createForm.grantedPlan,
				previousPlan: createForm.previousPlan,
			};
		} else if (createForm.type === "billing_adjustment") {
			if (!createForm.nextBillingDate || !createForm.previousNextBillingDate) {
				toast.error("Informe ambas as datas de cobrança");
				return;
			}
			payload.metadata = {
				nextBillingDate: new Date(createForm.nextBillingDate).toISOString(),
				previousNextBillingDate: new Date(
					createForm.previousNextBillingDate,
				).toISOString(),
			};
		}

		try {
			setSubmitting(true);
			await api.post(
				`/admin/sellers/${createForm.accountId}/exceptions`,
				payload,
			);
			toast.success("Exceção criada!");
			setCreateOpen(false);
			setCreateForm(emptyCreateForm);
			setPage(1);
			load();
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao criar exceção";
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	const handleRevoke = async () => {
		if (!revokeTarget) return;
		if (revokeReason.trim().length < 3) {
			toast.error("Informe a razão da revogação");
			return;
		}
		try {
			setRevoking(true);
			await api.post(
				`/admin/sellers/${revokeTarget.account_id}/exceptions/${revokeTarget.id}/revoke`,
				{ reason: revokeReason },
			);
			toast.success("Exceção revogada");
			setRevokeTarget(null);
			setRevokeReason("");
			load();
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao revogar exceção";
			toast.error(message);
		} finally {
			setRevoking(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Exceções de Contas
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Gerencie ajustes manuais por vendedor (auditável)
					</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus className="w-4 h-4 mr-2" />
					Nova exceção
				</Button>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm grid md:grid-cols-3 gap-3">
				<div>
					<label
						htmlFor="filter-type"
						className="block text-xs font-medium text-gray-500 mb-1"
					>
						Tipo
					</label>
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<select
							id="filter-type"
							value={filterType}
							onChange={(e) => {
								setFilterType(e.target.value as ExceptionType | "");
								setPage(1);
							}}
							className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
						>
							<option value="">Todos os tipos</option>
							{(Object.keys(TYPE_META) as ExceptionType[]).map((t) => (
								<option key={t} value={t}>
									{TYPE_META[t].label}
								</option>
							))}
						</select>
					</div>
				</div>
				<div>
					<label
						htmlFor="filter-status"
						className="block text-xs font-medium text-gray-500 mb-1"
					>
						Status
					</label>
					<select
						id="filter-status"
						value={filterStatus}
						onChange={(e) => {
							setFilterStatus(e.target.value as ExceptionStatus | "");
							setPage(1);
						}}
						className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
					>
						<option value="">Todos</option>
						{(Object.keys(STATUS_META) as ExceptionStatus[]).map((s) => (
							<option key={s} value={s}>
								{STATUS_META[s].label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label
						htmlFor="filter-account"
						className="block text-xs font-medium text-gray-500 mb-1"
					>
						ID da conta (opcional)
					</label>
					<Input
						id="filter-account"
						value={accountSearch}
						onChange={(e) => {
							setAccountSearch(e.target.value);
							setPage(1);
						}}
						placeholder="cuid de uma conta específica"
					/>
				</div>
			</div>

			{/* Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
			>
				{loading ? (
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto" />
					</div>
				) : items.length === 0 ? (
					<div className="p-12 text-center">
						<ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500 dark:text-gray-400">
							Nenhuma exceção encontrada
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-800/50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Tipo
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Conta
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Vigência
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Razão
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{items.map((item) => {
									const typeMeta = TYPE_META[item.type];
									const statusMeta = STATUS_META[item.status];
									const TypeIcon = typeMeta.icon;
									return (
										<tr
											key={item.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<TypeIcon className="w-4 h-4 text-gray-400" />
													<span className="text-sm text-gray-900 dark:text-white">
														{typeMeta.label}
													</span>
												</div>
											</td>
											<td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
												{item.account_id.slice(0, 8)}…
											</td>
											<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
												{formatDate(item.effective_from)} →{" "}
												{formatDate(item.effective_until)}
											</td>
											<td className="px-6 py-4">
												<span
													className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${statusMeta.classes}`}
												>
													{statusMeta.label}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
												{item.reason}
											</td>
											<td className="px-6 py-4 text-right">
												{item.status === "active" ? (
													<button
														type="button"
														onClick={() => setRevokeTarget(item)}
														className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
													>
														<Ban className="w-3.5 h-3.5" />
														Revogar
													</button>
												) : (
													<span className="text-xs text-gray-400">
														{item.revoked_at
															? `revogado em ${formatDateTime(item.revoked_at)}`
															: "—"}
													</span>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Página {page} de {totalPages} • {total} exceções
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</motion.div>

			{/* Create modal */}
			<AnimatePresence>
				{createOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setCreateOpen(false)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
								<div className="flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-primary-600" />
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										Nova exceção
									</h2>
								</div>
								<button
									type="button"
									onClick={() => setCreateOpen(false)}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label
										htmlFor="acc-id"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Conta (vendedor)
									</label>
									<select
										id="acc-id"
										value={createForm.accountId}
										onChange={(e) =>
											setCreateForm({
												...createForm,
												accountId: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
									>
										<option value="">Selecione uma conta…</option>
										{accountSuggestions.map((a) => (
											<option key={a.id} value={a.id}>
												{a.name} — {a.email} ({a.plan_type})
											</option>
										))}
									</select>
								</div>

								<div>
									<label
										htmlFor="ex-type"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Tipo
									</label>
									<select
										id="ex-type"
										value={createForm.type}
										onChange={(e) =>
											setCreateForm({
												...createForm,
												type: e.target.value as ExceptionType,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
									>
										{(Object.keys(TYPE_META) as ExceptionType[]).map((t) => (
											<option key={t} value={t}>
												{TYPE_META[t].label}
											</option>
										))}
									</select>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<label
											htmlFor="ex-from"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Vigência inicial
										</label>
										<Input
											id="ex-from"
											type="date"
											value={createForm.effectiveFrom}
											onChange={(e) =>
												setCreateForm({
													...createForm,
													effectiveFrom: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<label
											htmlFor="ex-until"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Vigência final (opcional)
										</label>
										<Input
											id="ex-until"
											type="date"
											value={createForm.effectiveUntil}
											onChange={(e) =>
												setCreateForm({
													...createForm,
													effectiveUntil: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{createForm.type === "custom_limits" && (
									<div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
										<Input
											label="Max. produtos"
											type="number"
											min={0}
											value={createForm.maxProducts}
											onChange={(e) =>
												setCreateForm({
													...createForm,
													maxProducts: e.target.value,
												})
											}
										/>
										<Input
											label="Max. clientes"
											type="number"
											min={0}
											value={createForm.maxCustomers}
											onChange={(e) =>
												setCreateForm({
													...createForm,
													maxCustomers: e.target.value,
												})
											}
										/>
										<Input
											label="Max. vendas/mês"
											type="number"
											min={0}
											value={createForm.maxOrdersPerMonth}
											onChange={(e) =>
												setCreateForm({
													...createForm,
													maxOrdersPerMonth: e.target.value,
												})
											}
										/>
									</div>
								)}

								{createForm.type === "plan_grant" && (
									<div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30">
										<div>
											<label
												htmlFor="ex-prev"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												Plano anterior
											</label>
											<select
												id="ex-prev"
												value={createForm.previousPlan}
												onChange={(e) =>
													setCreateForm({
														...createForm,
														previousPlan: e.target.value as "free" | "pro",
													})
												}
												className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
											>
												<option value="free">Gratuito</option>
												<option value="pro">Profissional</option>
											</select>
										</div>
										<div>
											<label
												htmlFor="ex-granted"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												Plano concedido
											</label>
											<select
												id="ex-granted"
												value={createForm.grantedPlan}
												onChange={(e) =>
													setCreateForm({
														...createForm,
														grantedPlan: e.target.value as "pro" | "enterprise",
													})
												}
												className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
											>
												<option value="pro">Profissional</option>
												<option value="enterprise">Empresarial</option>
											</select>
										</div>
									</div>
								)}

								{createForm.type === "billing_adjustment" && (
									<div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30">
										<div>
											<label
												htmlFor="ex-prev-bill"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												Próx. cobrança anterior
											</label>
											<Input
												id="ex-prev-bill"
												type="date"
												value={createForm.previousNextBillingDate}
												onChange={(e) =>
													setCreateForm({
														...createForm,
														previousNextBillingDate: e.target.value,
													})
												}
											/>
										</div>
										<div>
											<label
												htmlFor="ex-next-bill"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												Nova próx. cobrança
											</label>
											<Input
												id="ex-next-bill"
												type="date"
												value={createForm.nextBillingDate}
												onChange={(e) =>
													setCreateForm({
														...createForm,
														nextBillingDate: e.target.value,
													})
												}
											/>
										</div>
									</div>
								)}

								<div>
									<label
										htmlFor="ex-reason"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Razão (auditoria)
									</label>
									<textarea
										id="ex-reason"
										value={createForm.reason}
										onChange={(e) =>
											setCreateForm({ ...createForm, reason: e.target.value })
										}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
										placeholder="Ex: parceria estratégica com este vendedor; ticket #123…"
									/>
								</div>

								<div className="flex gap-3 pt-2">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setCreateOpen(false)}
									>
										Cancelar
									</Button>
									<Button
										className="flex-1"
										onClick={handleCreate}
										isLoading={submitting}
									>
										Criar exceção
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Revoke modal */}
			<AnimatePresence>
				{revokeTarget && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setRevokeTarget(null)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
								<Ban className="w-5 h-5 text-red-600" />
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Revogar exceção
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Esta ação é imutável e auditada. Informe a razão.
								</p>
								<div>
									<label
										htmlFor="revoke-reason"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Razão da revogação
									</label>
									<textarea
										id="revoke-reason"
										value={revokeReason}
										onChange={(e) => setRevokeReason(e.target.value)}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
									/>
								</div>
								<div className="flex gap-3">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => {
											setRevokeTarget(null);
											setRevokeReason("");
										}}
									>
										Cancelar
									</Button>
									<Button
										className="flex-1"
										onClick={handleRevoke}
										isLoading={revoking}
									>
										Revogar
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
