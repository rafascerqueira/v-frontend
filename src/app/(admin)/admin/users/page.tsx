"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Ban,
	Check,
	ChevronLeft,
	ChevronRight,
	Crown,
	Edit2,
	Gift,
	RotateCcw,
	Search,
	Shield,
	Star,
	User,
	Users,
	X,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	ActionMenu,
	ActionMenuDivider,
	ActionMenuItem,
	ActionMenuLabel,
} from "@/components/ui/action-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface Account {
	id: string;
	name: string;
	email: string;
	role: string;
	plan_type: string;
	is_active: boolean;
	last_login_at: string | null;
	createdAt: string;
	// Active plan_grant exception, included inline by the accounts endpoint.
	activeGrant?: ExceptionRecord | null;
}

interface PlanGrantStat {
	active: number;
	quota: number;
	exceeded: boolean;
}

interface PlanGrantStats {
	pro: PlanGrantStat;
	enterprise: PlanGrantStat;
}

interface ExceptionRecord {
	id: string;
	account_id: string;
	type: string;
	status: string;
	effective_from: string;
	effective_until: string | null;
	metadata: Record<string, unknown>;
	reason: string;
}

interface AccountsResponse {
	data: Account[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

function formatDate(date: string | null) {
	if (!date) return "Nunca";
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(date));
}

const planOptions = [
	{ value: "free", label: "Gratuito", icon: Zap, color: "gray" },
	{ value: "pro", label: "Profissional", icon: Star, color: "indigo" },
	{ value: "enterprise", label: "Empresarial", icon: Crown, color: "purple" },
];

const roleOptions = [
	{ value: "seller", label: "Vendedor" },
	{ value: "admin", label: "Administrador" },
];

export default function AdminUsersPage() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [editingUser, setEditingUser] = useState<Account | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState({
		name: "",
		email: "",
		role: "seller",
		plan_type: "free",
	});
	const [saving, setSaving] = useState(false);

	// Grant plan flow
	const [grantTarget, setGrantTarget] = useState<Account | null>(null);
	const [grantForm, setGrantForm] = useState({
		grantedPlan: "pro" as "pro" | "enterprise",
		effectiveUntil: "",
		reason: "",
	});
	const [grantSubmitting, setGrantSubmitting] = useState(false);
	const [planGrantStats, setPlanGrantStats] = useState<PlanGrantStats | null>(
		null,
	);

	// Revoke plan grant flow
	const [revokeTarget, setRevokeTarget] = useState<{
		account: Account;
		exception: ExceptionRecord;
	} | null>(null);
	const [revokeReason, setRevokeReason] = useState("");
	const [revokeSubmitting, setRevokeSubmitting] = useState(false);
	const [activeGrants, setActiveGrants] = useState<
		Record<string, ExceptionRecord | undefined>
	>({});

	// `silent` refreshes data in the background without blanking the table to a spinner
	// (used after mutations so the list doesn't flash on every action).
	const loadAccounts = useCallback(async (page = 1, silent = false) => {
		if (!silent) setLoading(true);
		try {
			const response = await api.get<AccountsResponse>(
				`/admin/accounts?page=${page}&limit=20`,
			);
			setAccounts(response.data.data);
			setMeta(response.data.meta);

			// Active plan_grant now arrives inline with each account — no per-account
			// requests (previously an N+1 that made the list slow to load).
			const grants: Record<string, ExceptionRecord | undefined> = {};
			for (const acc of response.data.data) {
				if (acc.activeGrant) grants[acc.id] = acc.activeGrant;
			}
			setActiveGrants(grants);
		} catch (_error) {
			toast.error("Erro ao carregar usuários");
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	const loadGrantStats = useCallback(async () => {
		try {
			const { data } = await api.get<PlanGrantStats>("/admin/exceptions/stats");
			setPlanGrantStats(data);
		} catch {
			/* swallow */
		}
	}, []);

	useEffect(() => {
		loadAccounts();
	}, [loadAccounts]);

	useEffect(() => {
		loadGrantStats();
	}, [loadGrantStats]);

	const openEditModal = (account: Account) => {
		setEditingUser(account);
		setEditForm({
			name: account.name,
			email: account.email,
			role: account.role,
			plan_type: account.plan_type || "free",
		});
		setShowEditModal(true);
	};

	const handleSaveUser = async () => {
		if (!editingUser) return;
		try {
			setSaving(true);
			await api.patch(`/admin/accounts/${editingUser.id}`, editForm);
			toast.success("Usuário atualizado!");
			// Optimistic local update — avoids a full refetch (and its N+1 grant calls).
			setAccounts((prev) =>
				prev.map((a) => (a.id === editingUser.id ? { ...a, ...editForm } : a)),
			);
			setShowEditModal(false);
			setEditingUser(null);
		} catch (_error) {
			toast.error("Erro ao atualizar usuário");
		} finally {
			setSaving(false);
		}
	};

	const handleToggleActive = async (account: Account) => {
		try {
			await api.patch(`/admin/accounts/${account.id}`, {
				is_active: !account.is_active,
			});
			toast.success(
				account.is_active ? "Usuário desativado" : "Usuário ativado",
			);
			setAccounts((prev) =>
				prev.map((a) =>
					a.id === account.id ? { ...a, is_active: !account.is_active } : a,
				),
			);
		} catch (_error) {
			toast.error("Erro ao alterar status");
		}
	};

	const openGrantModal = (account: Account, plan: "pro" | "enterprise") => {
		setGrantTarget(account);
		setGrantForm({ grantedPlan: plan, effectiveUntil: "", reason: "" });
	};

	const handleSubmitGrant = async () => {
		if (!grantTarget) return;
		if (!grantForm.effectiveUntil) {
			toast.error("Informe a data de expiração");
			return;
		}
		if (grantForm.reason.trim().length < 3) {
			toast.error("Informe a razão (mínimo 3 caracteres)");
			return;
		}

		const previousPlan = (
			activeGrants[grantTarget.id]?.metadata as { grantedPlan?: string }
		)?.grantedPlan
			? (activeGrants[grantTarget.id]?.metadata as { grantedPlan: string })
					.grantedPlan
			: grantTarget.plan_type === "pro" || grantTarget.plan_type === "free"
				? grantTarget.plan_type
				: "free";

		const payload = {
			type: "plan_grant",
			effectiveFrom: new Date().toISOString(),
			effectiveUntil: new Date(grantForm.effectiveUntil).toISOString(),
			reason: grantForm.reason,
			metadata: {
				grantedPlan: grantForm.grantedPlan,
				previousPlan,
			},
		};

		try {
			setGrantSubmitting(true);
			// If there's an existing active grant, revoke it first (replacement flow)
			const existing = activeGrants[grantTarget.id];
			if (existing) {
				await api.post(
					`/admin/sellers/${grantTarget.id}/exceptions/${existing.id}/revoke`,
					{ reason: `Substituído por nova concessão: ${grantForm.reason}` },
				);
			}
			await api.post(`/admin/sellers/${grantTarget.id}/exceptions`, payload);
			toast.success("Plano concedido!");
			setGrantTarget(null);
			loadAccounts(meta.page, true);
			loadGrantStats();
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao conceder plano";
			toast.error(message);
		} finally {
			setGrantSubmitting(false);
		}
	};

	const openRevokeModal = (account: Account) => {
		const grant = activeGrants[account.id];
		if (!grant) {
			toast.error("Este usuário não tem concessão ativa");
			return;
		}
		setRevokeTarget({ account, exception: grant });
		setRevokeReason("");
	};

	const handleSubmitRevoke = async () => {
		if (!revokeTarget) return;
		if (revokeReason.trim().length < 3) {
			toast.error("Informe a razão da revogação");
			return;
		}
		try {
			setRevokeSubmitting(true);
			await api.post(
				`/admin/sellers/${revokeTarget.account.id}/exceptions/${revokeTarget.exception.id}/revoke`,
				{ reason: revokeReason },
			);
			toast.success("Concessão revogada");
			setRevokeTarget(null);
			loadAccounts(meta.page, true);
			loadGrantStats();
		} catch (error: unknown) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ?? "Erro ao revogar concessão";
			toast.error(message);
		} finally {
			setRevokeSubmitting(false);
		}
	};

	const handleChangeRole = async (account: Account, role: string) => {
		try {
			await api.patch(`/admin/accounts/${account.id}`, { role });
			toast.success("Função alterada!");
			setAccounts((prev) =>
				prev.map((a) => (a.id === account.id ? { ...a, role } : a)),
			);
		} catch (_error) {
			toast.error("Erro ao alterar função");
		}
	};

	const filteredAccounts = useMemo(() => {
		const term = search.toLowerCase();
		return accounts.filter(
			(account) =>
				account.name?.toLowerCase().includes(term) ||
				account.email?.toLowerCase().includes(term),
		);
	}, [accounts, search]);

	const getPlanInfo = (planType: string) => {
		return planOptions.find((p) => p.value === planType) || planOptions[0];
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Usuários
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Gerenciar contas de vendedores e administradores
					</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<Users className="w-4 h-4" />
					{meta.total} usuários
				</div>
			</div>

			{/* Search */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar por nome ou email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* Users Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
			>
				{loading ? (
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto" />
						<p className="text-gray-500 dark:text-gray-400 mt-2">
							Carregando...
						</p>
					</div>
				) : filteredAccounts.length === 0 ? (
					<div className="p-8 text-center">
						<Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500 dark:text-gray-400">
							Nenhum usuário encontrado
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-800/50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Usuário
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Função
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Plano
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Último Acesso
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredAccounts.map((account) => {
									const plan = getPlanInfo(account.plan_type);
									const PlanIcon = plan.icon;
									return (
										<tr
											key={account.id}
											className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${account.is_active === false ? "opacity-50" : ""}`}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div
														className={`w-10 h-10 rounded-full flex items-center justify-center ${
															account.role === "admin"
																? "bg-red-100 dark:bg-red-900/30"
																: "bg-blue-100 dark:bg-blue-900/30"
														}`}
													>
														{account.role === "admin" ? (
															<Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
														) : (
															<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
														)}
													</div>
													<div>
														<p className="font-medium text-gray-900 dark:text-white">
															{account.name}
														</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">
															{account.email}
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
														account.role === "admin"
															? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
															: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
													}`}
												>
													{account.role === "admin"
														? "Administrador"
														: "Vendedor"}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-1.5 flex-wrap">
													<span
														className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
															plan.color === "indigo"
																? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
																: plan.color === "purple"
																	? "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400"
																	: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
														}`}
													>
														<PlanIcon className="w-3 h-3" />
														{plan.label}
													</span>
													{activeGrants[account.id] && (
														<span
															className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
															title={`Concedido até ${formatDate(activeGrants[account.id]?.effective_until ?? null)}`}
														>
															<Gift className="w-3 h-3" />
															Concedido (
															{(
																activeGrants[account.id]?.metadata as {
																	grantedPlan?: string;
																}
															)?.grantedPlan ?? ""}
															)
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
														account.is_active !== false
															? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
															: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
													}`}
												>
													{account.is_active !== false ? (
														<>
															<Check className="w-3 h-3" /> Ativo
														</>
													) : (
														<>
															<Ban className="w-3 h-3" /> Inativo
														</>
													)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{formatDate(account.last_login_at)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right">
												<ActionMenu className="w-48 rounded-xl">
													<ActionMenuItem
														onClick={() => openEditModal(account)}
													>
														<Edit2 className="w-4 h-4" />
														Editar
													</ActionMenuItem>
													<ActionMenuItem
														onClick={() => handleToggleActive(account)}
													>
														{account.is_active !== false ? (
															<>
																<Ban className="w-4 h-4" /> Desativar
															</>
														) : (
															<>
																<Check className="w-4 h-4" /> Ativar
															</>
														)}
													</ActionMenuItem>
													<ActionMenuDivider />
													<ActionMenuLabel>
														Conceder plano (com expiração)
													</ActionMenuLabel>
													<ActionMenuItem
														onClick={() => openGrantModal(account, "pro")}
													>
														<Gift className="w-4 h-4" />
														Conceder Profissional
													</ActionMenuItem>
													<ActionMenuItem
														onClick={() =>
															openGrantModal(account, "enterprise")
														}
													>
														<Gift className="w-4 h-4" />
														Conceder Empresarial
													</ActionMenuItem>
													{activeGrants[account.id] && (
														<ActionMenuItem
															variant="danger"
															onClick={() => openRevokeModal(account)}
														>
															<RotateCcw className="w-4 h-4" />
															Revogar concessão
														</ActionMenuItem>
													)}
													<ActionMenuDivider />
													<ActionMenuLabel>Alterar Função</ActionMenuLabel>
													{roleOptions.map((r) => (
														<ActionMenuItem
															key={r.value}
															onClick={() => handleChangeRole(account, r.value)}
															disabled={account.role === r.value}
														>
															{r.value === "admin" ? (
																<Shield className="w-4 h-4" />
															) : (
																<User className="w-4 h-4" />
															)}
															{r.label}
														</ActionMenuItem>
													))}
												</ActionMenu>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination */}
				{meta.totalPages > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Página {meta.page} de {meta.totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => loadAccounts(meta.page - 1)}
								disabled={meta.page === 1}
								className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => loadAccounts(meta.page + 1)}
								disabled={meta.page === meta.totalPages}
								className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</motion.div>

			{/* Edit User Modal */}
			<AnimatePresence>
				{showEditModal && editingUser && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => {
							setShowEditModal(false);
							setEditingUser(null);
						}}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Editar Usuário
								</h2>
								<button
									type="button"
									onClick={() => {
										setShowEditModal(false);
										setEditingUser(null);
									}}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="p-6 space-y-4">
								<Input
									label="Nome"
									value={editForm.name}
									onChange={(e) =>
										setEditForm({ ...editForm, name: e.target.value })
									}
								/>
								<Input
									label="Email"
									type="email"
									value={editForm.email}
									onChange={(e) =>
										setEditForm({ ...editForm, email: e.target.value })
									}
								/>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Função
									</label>
									<select
										value={editForm.role}
										onChange={(e) =>
											setEditForm({ ...editForm, role: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
									>
										{roleOptions.map((r) => (
											<option key={r.value} value={r.value}>
												{r.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Plano
									</label>
									<select
										value={editForm.plan_type}
										onChange={(e) =>
											setEditForm({ ...editForm, plan_type: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 dark:bg-gray-700"
									>
										{planOptions.map((p) => (
											<option key={p.value} value={p.value}>
												{p.label}
											</option>
										))}
									</select>
								</div>
								<div className="flex gap-3 pt-4">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => {
											setShowEditModal(false);
											setEditingUser(null);
										}}
									>
										Cancelar
									</Button>
									<Button
										className="flex-1"
										onClick={handleSaveUser}
										isLoading={saving}
									>
										Salvar
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Grant Plan Modal */}
			<AnimatePresence>
				{grantTarget && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setGrantTarget(null)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Gift className="w-5 h-5 text-primary-600" />
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										Conceder plano
									</h2>
								</div>
								<button
									type="button"
									onClick={() => setGrantTarget(null)}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="p-6 space-y-4">
								<div className="text-sm">
									<span className="text-gray-500 dark:text-gray-400">
										Vendedor:
									</span>{" "}
									<span className="font-medium text-gray-900 dark:text-white">
										{grantTarget.name}
									</span>
								</div>

								{activeGrants[grantTarget.id] && (
									<div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3">
										Este vendedor já tem uma concessão ativa (
										{(
											activeGrants[grantTarget.id]?.metadata as {
												grantedPlan?: string;
											}
										)?.grantedPlan ?? ""}
										). Ela será revogada e substituída.
									</div>
								)}

								<div>
									<label
										htmlFor="grant-plan"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Plano
									</label>
									<select
										id="grant-plan"
										value={grantForm.grantedPlan}
										onChange={(e) =>
											setGrantForm({
												...grantForm,
												grantedPlan: e.target.value as "pro" | "enterprise",
											})
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
									>
										<option value="pro">Profissional</option>
										<option value="enterprise">Empresarial</option>
									</select>
									{planGrantStats && (
										<p
											className={`text-xs mt-1 ${
												planGrantStats[grantForm.grantedPlan].exceeded
													? "text-amber-600 dark:text-amber-400"
													: "text-gray-500 dark:text-gray-400"
											}`}
										>
											{planGrantStats[grantForm.grantedPlan].active} /{" "}
											{planGrantStats[grantForm.grantedPlan].quota === 0
												? "∞"
												: planGrantStats[grantForm.grantedPlan].quota}{" "}
											concessões ativas
											{planGrantStats[grantForm.grantedPlan].exceeded
												? " — quota excedida (permitido, mas atenção)"
												: ""}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="grant-until"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Expira em
									</label>
									<Input
										id="grant-until"
										type="date"
										value={grantForm.effectiveUntil}
										onChange={(e) =>
											setGrantForm({
												...grantForm,
												effectiveUntil: e.target.value,
											})
										}
									/>
								</div>

								<div>
									<label
										htmlFor="grant-reason"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Razão (auditoria)
									</label>
									<textarea
										id="grant-reason"
										value={grantForm.reason}
										onChange={(e) =>
											setGrantForm({ ...grantForm, reason: e.target.value })
										}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
										placeholder="Ex: parceria estratégica; ticket #123…"
									/>
								</div>

								<div className="flex gap-3 pt-2">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setGrantTarget(null)}
									>
										Cancelar
									</Button>
									<Button
										className="flex-1"
										onClick={handleSubmitGrant}
										isLoading={grantSubmitting}
									>
										Conceder
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Revoke Plan Grant Modal */}
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
								<RotateCcw className="w-5 h-5 text-red-600" />
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Revogar concessão
								</h2>
							</div>
							<div className="p-6 space-y-4">
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Você está revogando a concessão de{" "}
									<strong>
										{
											(
												revokeTarget.exception.metadata as {
													grantedPlan?: string;
												}
											)?.grantedPlan
										}
									</strong>{" "}
									para <strong>{revokeTarget.account.name}</strong>. Esta ação é
									imutável e auditada.
								</p>
								<div>
									<label
										htmlFor="revoke-grant-reason"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Razão da revogação
									</label>
									<textarea
										id="revoke-grant-reason"
										value={revokeReason}
										onChange={(e) => setRevokeReason(e.target.value)}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700"
										placeholder="Ex: arrependimento de compra; ticket #456…"
									/>
								</div>
								<div className="flex gap-3">
									<Button
										variant="outline"
										className="flex-1"
										onClick={() => setRevokeTarget(null)}
									>
										Cancelar
									</Button>
									<Button
										className="flex-1"
										onClick={handleSubmitRevoke}
										isLoading={revokeSubmitting}
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
