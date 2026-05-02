"use client";

import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	ChevronDown,
	FileText,
	KeyRound,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Shield,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

const navigation = [
	{ name: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ name: "Usuários", href: "/admin/users", icon: Users },
	{ name: "Logs", href: "/admin/logs", icon: FileText },
	{ name: "Atividade", href: "/admin/activity", icon: Activity },
	{ name: "Configurações", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { isLoading, isAuthenticated, isAdmin, logout } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [changingPassword, setChangingPassword] = useState(false);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		} else if (!isLoading && isAuthenticated && !isAdmin) {
			router.push("/dashboard");
		}
	}, [isLoading, isAuthenticated, isAdmin, router]);

	if (isLoading || !isAuthenticated || !isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-900">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" />
			</div>
		);
	}

	const handleLogout = async () => {
		await logout();
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setChangingPassword(true);
		try {
			await api.post("/auth/change-password", { currentPassword, newPassword });
			toast.success("Senha alterada com sucesso!");
			setPasswordModalOpen(false);
			setCurrentPassword("");
			setNewPassword("");
		} catch {
			toast.error("Erro ao alterar senha. Verifique a senha atual.");
		} finally {
			setChangingPassword(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900">
			{/* Mobile sidebar */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="fixed inset-0 bg-black/50"
						onClick={() => setSidebarOpen(false)}
					/>
					<motion.div
						initial={{ x: -280 }}
						animate={{ x: 0 }}
						exit={{ x: -280 }}
						className="fixed inset-y-0 left-0 w-72 bg-gray-900 dark:bg-gray-800"
					>
						<div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 dark:border-gray-700">
							<div className="flex items-center gap-2">
								<Shield className="w-8 h-8 text-red-500" />
								<span className="font-bold text-white text-lg">
									Admin Panel
								</span>
							</div>
							<button
								type="button"
								onClick={() => setSidebarOpen(false)}
								className="p-2 text-gray-400 hover:text-white"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<nav className="flex-1 px-4 py-4 space-y-1">
							{navigation.map((item) => {
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.name}
										href={item.href}
										onClick={() => setSidebarOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
											isActive
												? "bg-red-600 text-white"
												: "text-gray-400 hover:bg-gray-800 hover:text-white"
										}`}
									>
										<item.icon className="w-5 h-5" />
										{item.name}
									</Link>
								);
							})}
						</nav>
						<div className="p-4 border-t border-gray-800 dark:border-gray-700">
							<Link
								href="/dashboard"
								onClick={() => setSidebarOpen(false)}
								className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
							>
								<BarChart3 className="w-5 h-5" />
								Voltar ao App
							</Link>
						</div>
					</motion.div>
				</div>
			)}

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
				<div className="flex flex-col flex-1 bg-gray-900 dark:bg-gray-800">
					<div className="flex items-center h-16 px-6 border-b border-gray-800 dark:border-gray-700">
						<Shield className="w-8 h-8 text-red-500" />
						<span className="ml-2 font-bold text-white text-lg">
							Admin Panel
						</span>
					</div>
					<nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
						{navigation.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
										isActive
											? "bg-red-600 text-white"
											: "text-gray-400 hover:bg-gray-800 hover:text-white"
									}`}
								>
									<item.icon className="w-5 h-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>
					<div className="p-4 border-t border-gray-800 dark:border-gray-700">
						<Link
							href="/dashboard"
							className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
						>
							<BarChart3 className="w-5 h-5" />
							Voltar ao App
						</Link>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:pl-72">
				{/* Top bar */}
				<header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
					<div className="flex items-center justify-between h-16 px-4 sm:px-6">
						<button
							type="button"
							onClick={() => setSidebarOpen(true)}
							className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<Menu className="w-6 h-6" />
						</button>

						<div className="flex-1 lg:flex-none" />

						<div className="relative">
							<button
								type="button"
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
									<Shield className="w-4 h-4 text-white" />
								</div>
								<span className="hidden sm:block">Administrador</span>
								<ChevronDown className="w-4 h-4" />
							</button>

							{userMenuOpen && (
								<div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
									<button
										type="button"
										onClick={() => {
											setUserMenuOpen(false);
											setPasswordModalOpen(true);
										}}
										className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<KeyRound className="w-4 h-4" />
										Alterar senha
									</button>
									<button
										type="button"
										onClick={handleLogout}
										className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<LogOut className="w-4 h-4" />
										Sair
									</button>
								</div>
							)}
						</div>
					</div>
				</header>

				{/* Page content */}
				<main className="p-4 sm:p-6 lg:p-8">{children}</main>
			</div>

			{/* Change password modal */}
			{passwordModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Alterar senha
						</h2>
						<form onSubmit={handleChangePassword} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Senha atual
								</label>
								<input
									type="password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									required
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									Nova senha
								</label>
								<input
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									minLength={8}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
								/>
							</div>
							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={() => {
										setPasswordModalOpen(false);
										setCurrentPassword("");
										setNewPassword("");
									}}
									className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={changingPassword}
									className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
								>
									{changingPassword ? "Salvando..." : "Salvar"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
