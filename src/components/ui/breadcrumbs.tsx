"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
	dashboard: "Dashboard",
	products: "Produtos",
	customers: "Clientes",
	orders: "Pedidos",
	billings: "Cobranças",
	settings: "Configurações",
	reports: "Relatórios",
	stock: "Estoque",
};

interface BreadcrumbsProps {
	className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);

	if (segments.length <= 1) {
		return null;
	}

	const breadcrumbs = segments.map((segment, index) => {
		const href = `/${segments.slice(0, index + 1).join("/")}`;
		const label =
			routeLabels[segment] ||
			segment.charAt(0).toUpperCase() + segment.slice(1);
		const isLast = index === segments.length - 1;

		return { href, label, isLast };
	});

	return (
		<nav
			className={cn("flex items-center text-sm", className)}
			aria-label="Breadcrumb"
		>
			<Link
				href="/dashboard"
				className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
			>
				<Home className="h-4 w-4" />
			</Link>
			{breadcrumbs.map((crumb) => (
				<div key={crumb.href} className="flex items-center">
					<ChevronRight className="h-4 w-4 mx-2 text-gray-300 dark:text-gray-600" />
					{crumb.isLast ? (
						<span className="font-medium text-gray-900 dark:text-white">
							{crumb.label}
						</span>
					) : (
						<Link
							href={crumb.href}
							className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
						>
							{crumb.label}
						</Link>
					)}
				</div>
			))}
		</nav>
	);
}
