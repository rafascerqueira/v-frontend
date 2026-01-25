"use client";

import { motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	FileText,
	Filter,
	RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface AuditLog {
	id: number;
	action: string;
	entity: string;
	entity_id: string | null;
	user_id: string | null;
	old_value: Record<string, unknown> | null;
	new_value: Record<string, unknown> | null;
	metadata: Record<string, unknown> | null;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
}

interface LogsResponse {
	data: AuditLog[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

function formatDate(date: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "medium",
	}).format(new Date(date));
}

function getActionColor(action: string) {
	switch (action.toLowerCase()) {
		case "create":
			return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
		case "update":
			return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
		case "delete":
			return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
	}
}

export default function AdminLogsPage() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
	const [loading, setLoading] = useState(true);
	const [entityFilter, setEntityFilter] = useState("");
	const [actionFilter, setActionFilter] = useState("");

	const loadLogs = useCallback(
		async (page = 1) => {
			setLoading(true);
			try {
				let url = `/admin/logs?page=${page}&limit=50`;
				if (entityFilter) url += `&entity=${entityFilter}`;
				if (actionFilter) url += `&action=${actionFilter}`;

				const response = await api.get<LogsResponse>(url);
				setLogs(response.data.data);
				setMeta(response.data.meta);
			} catch (_error) {
				toast.error("Erro ao carregar logs");
			} finally {
				setLoading(false);
			}
		},
		[entityFilter, actionFilter],
	);

	useEffect(() => {
		loadLogs();
	}, [loadLogs]);

	const entities = [...new Set(logs.map((log) => log.entity))];
	const actions = [...new Set(logs.map((log) => log.action))];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Logs de Auditoria
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Histórico de ações do sistema
					</p>
				</div>
				<button
					type="button"
					onClick={() => loadLogs(1)}
					className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
				>
					<RefreshCw className="w-4 h-4" />
					Atualizar
				</button>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
						<Filter className="w-4 h-4" />
						Filtros:
					</div>
					<select
						value={entityFilter}
						onChange={(e) => setEntityFilter(e.target.value)}
						className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
					>
						<option value="">Todas as entidades</option>
						{entities.map((entity) => (
							<option key={entity} value={entity}>
								{entity}
							</option>
						))}
					</select>
					<select
						value={actionFilter}
						onChange={(e) => setActionFilter(e.target.value)}
						className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
					>
						<option value="">Todas as ações</option>
						{actions.map((action) => (
							<option key={action} value={action}>
								{action}
							</option>
						))}
					</select>
					{(entityFilter || actionFilter) && (
						<button
							type="button"
							onClick={() => {
								setEntityFilter("");
								setActionFilter("");
							}}
							className="text-sm text-red-600 hover:underline"
						>
							Limpar filtros
						</button>
					)}
				</div>
			</div>

			{/* Logs Table */}
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
				) : logs.length === 0 ? (
					<div className="p-8 text-center">
						<FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
						<p className="text-gray-500 dark:text-gray-400">
							Nenhum log encontrado
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700/50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Data/Hora
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Ação
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Entidade
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										IP
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{logs.map((log) => (
									<tr
										key={log.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatDate(log.created_at)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}
											>
												{log.action}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											{log.entity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
											{log.entity_id || "-"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
											{log.ip_address || "-"}
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
							{meta.total} logs • Página {meta.page} de {meta.totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => loadLogs(meta.page - 1)}
								disabled={meta.page === 1}
								className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={() => loadLogs(meta.page + 1)}
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
