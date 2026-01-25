"use client";

import { motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Search,
	Shield,
	User,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Account {
	id: string;
	name: string;
	email: string;
	role: string;
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

export default function AdminUsersPage() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

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

	const filteredAccounts = accounts.filter(
		(account) =>
			account.name.toLowerCase().includes(search.toLowerCase()) ||
			account.email.toLowerCase().includes(search.toLowerCase()),
	);

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
										Último Acesso
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Cadastro
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredAccounts.map((account) => (
									<tr
										key={account.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
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
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatDate(account.last_login_at)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatDate(account.createdAt)}
										</td>
									</tr>
								))}
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
		</div>
	);
}
