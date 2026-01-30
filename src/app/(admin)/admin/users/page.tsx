"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Ban,
	Check,
	ChevronLeft,
	ChevronRight,
	Crown,
	Edit2,
	MoreVertical,
	Search,
	Shield,
	Star,
	User,
	Users,
	X,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
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
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [editingUser, setEditingUser] = useState<Account | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState({
		name: "",
		email: "",
		role: "seller",
		plan_type: "free",
	});
	const [saving, setSaving] = useState(false);

	const loadAccounts = useCallback(async (page = 1) => {
		setLoading(true);
		try {
			const response = await api.get<AccountsResponse>(
				`/admin/accounts?page=${page}&limit=20`,
			);
			setAccounts(response.data.data);
			setMeta(response.data.meta);
		} catch (_error) {
			toast.error("Erro ao carregar usuários");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadAccounts();
	}, [loadAccounts]);

	const openEditModal = (account: Account) => {
		setEditingUser(account);
		setEditForm({
			name: account.name,
			email: account.email,
			role: account.role,
			plan_type: account.plan_type || "free",
		});
		setShowEditModal(true);
		setActiveMenu(null);
	};

	const handleSaveUser = async () => {
		if (!editingUser) return;
		try {
			setSaving(true);
			await api.patch(`/admin/accounts/${editingUser.id}`, editForm);
			toast.success("Usuário atualizado!");
			setShowEditModal(false);
			setEditingUser(null);
			loadAccounts(meta.page);
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
			loadAccounts(meta.page);
		} catch (_error) {
			toast.error("Erro ao alterar status");
		}
		setActiveMenu(null);
	};

	const handleChangePlan = async (account: Account, plan: string) => {
		try {
			await api.patch(`/admin/accounts/${account.id}`, { plan_type: plan });
			toast.success("Plano alterado!");
			loadAccounts(meta.page);
		} catch (_error) {
			toast.error("Erro ao alterar plano");
		}
		setActiveMenu(null);
	};

	const handleChangeRole = async (account: Account, role: string) => {
		try {
			await api.patch(`/admin/accounts/${account.id}`, { role });
			toast.success("Função alterada!");
			loadAccounts(meta.page);
		} catch (_error) {
			toast.error("Erro ao alterar função");
		}
		setActiveMenu(null);
	};

	const filteredAccounts = accounts.filter(
		(account) =>
			account.name?.toLowerCase().includes(search.toLowerCase()) ||
			account.email?.toLowerCase().includes(search.toLowerCase()),
	);

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
							<thead className="bg-gray-50 dark:bg-gray-700/50">
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
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
														plan.color === "indigo"
															? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
															: plan.color === "purple"
																? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
																: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
													}`}
												>
													<PlanIcon className="w-3 h-3" />
													{plan.label}
												</span>
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
												<div className="relative">
													<button
														type="button"
														onClick={() =>
															setActiveMenu(
																activeMenu === account.id ? null : account.id,
															)
														}
														className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
													>
														<MoreVertical className="w-4 h-4 text-gray-500" />
													</button>
													<AnimatePresence>
														{activeMenu === account.id && (
															<motion.div
																initial={{ opacity: 0, scale: 0.95 }}
																animate={{ opacity: 1, scale: 1 }}
																exit={{ opacity: 0, scale: 0.95 }}
																className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1"
															>
																<button
																	type="button"
																	onClick={() => openEditModal(account)}
																	className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
																>
																	<Edit2 className="w-4 h-4" />
																	Editar
																</button>
																<button
																	type="button"
																	onClick={() => handleToggleActive(account)}
																	className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
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
																</button>
																<div className="border-t border-gray-200 dark:border-gray-700 my-1" />
																<div className="px-4 py-1 text-xs text-gray-500 uppercase">
																	Alterar Plano
																</div>
																{planOptions.map((p) => (
																	<button
																		key={p.value}
																		type="button"
																		onClick={() =>
																			handleChangePlan(account, p.value)
																		}
																		disabled={account.plan_type === p.value}
																		className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
																	>
																		<p.icon className="w-4 h-4" />
																		{p.label}
																	</button>
																))}
																<div className="border-t border-gray-200 dark:border-gray-700 my-1" />
																<div className="px-4 py-1 text-xs text-gray-500 uppercase">
																	Alterar Função
																</div>
																{roleOptions.map((r) => (
																	<button
																		key={r.value}
																		type="button"
																		onClick={() =>
																			handleChangeRole(account, r.value)
																		}
																		disabled={account.role === r.value}
																		className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
																	>
																		{r.value === "admin" ? (
																			<Shield className="w-4 h-4" />
																		) : (
																			<User className="w-4 h-4" />
																		)}
																		{r.label}
																	</button>
																))}
															</motion.div>
														)}
													</AnimatePresence>
												</div>
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
		</div>
	);
}
