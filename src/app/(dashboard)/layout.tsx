"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BarChart3,
	Box,
	Building2,
	ChevronDown,
	CreditCard,
	FileText,
	Gift,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	Settings,
	Share2,
	ShoppingCart,
	Users,
	Warehouse,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
	KeyboardShortcutsModal,
	useShortcutsModal,
} from "@/components/ui/keyboard-shortcuts-modal";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";
import { useAuth } from "@/contexts/auth-context";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Produtos", href: "/products", icon: Package },
	{ name: "Kits", href: "/bundles", icon: Box },
	{ name: "Estoque", href: "/stock", icon: Warehouse },
	{ name: "Promoções", href: "/promotions", icon: Gift },
	{ name: "Clientes", href: "/customers", icon: Users },
	{ name: "Pedidos", href: "/orders", icon: ShoppingCart },
	{ name: "Cobranças", href: "/billings", icon: FileText },
	{ name: "Fornecedores", href: "/suppliers", icon: Building2 },
	{ name: "Catálogo", href: "/catalog-share", icon: Share2 },
	{ name: "Relatórios", href: "/reports", icon: BarChart3 },
	{ name: "Planos", href: "/plans", icon: CreditCard },
	{ name: "Configurações", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const shortcutsModal = useShortcutsModal();

	useKeyboardShortcuts();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		} else if (!isLoading && isAuthenticated && isAdmin) {
			router.push("/admin");
		}
	}, [isAuthenticated, isLoading, isAdmin, router]);

	if (isLoading || !isAuthenticated || isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Mobile sidebar overlay */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
						<Link href="/dashboard" className="flex items-center gap-2">
							<Image
								src="/v-de-vendinhas.svg"
								alt="Vendinhas"
								width={36}
								height={36}
								className="rounded-lg"
							/>
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								Vendinhas
							</span>
						</Link>
						<button
							type="button"
							className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
						{navigation.map((item) => {
							const isActive =
								pathname === item.href || pathname.startsWith(`${item.href}/`);
							return (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
										isActive
											? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
											: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
									)}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon
										className={cn(
											"h-5 w-5",
											isActive ? "text-indigo-600" : "text-gray-400",
										)}
									/>
									{item.name}
									{isActive && (
										<motion.div
											layoutId="activeNav"
											className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
											initial={false}
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 30,
											}}
										/>
									)}
								</Link>
							);
						})}
					</nav>

					{/* User section */}
					<div className="p-4 border-t border-gray-200 dark:border-gray-700">
						<button
							type="button"
							onClick={logout}
							className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
						>
							<LogOut className="h-5 w-5" />
							Sair
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar */}
				<header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
					<button
						type="button"
						className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="h-6 w-6" />
					</button>

					<div className="flex-1" />

					{/* Notifications */}
					<NotificationsDropdown />

					{/* User menu */}
					<div className="relative">
						<button
							type="button"
							onClick={() => setUserMenuOpen(!userMenuOpen)}
							className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
								<span className="text-sm font-medium text-white">
									{user?.email?.charAt(0).toUpperCase()}
								</span>
							</div>
							<div className="hidden md:block text-left">
								<p className="text-sm font-medium text-gray-900 dark:text-white">
									{user?.email}
								</p>
							</div>
							<ChevronDown className="h-4 w-4 text-gray-400" />
						</button>

						<AnimatePresence>
							{userMenuOpen && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
								>
									<Link
										href="/settings"
										className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										onClick={() => setUserMenuOpen(false)}
									>
										Configurações
									</Link>
									<button
										type="button"
										onClick={() => {
											setUserMenuOpen(false);
											logout();
										}}
										className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
									>
										Sair
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</header>

				{/* Page content */}
				<main className="p-4 lg:p-8">
					<Breadcrumbs className="mb-4" />
					<motion.div
						key={pathname}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						{children}
					</motion.div>
				</main>
			</div>

			<KeyboardShortcutsModal
				isOpen={shortcutsModal.isOpen}
				onClose={shortcutsModal.close}
			/>
		</div>
	);
}
