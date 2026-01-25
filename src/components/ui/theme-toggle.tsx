"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
		);
	}

	const themes = [
		{ id: "light", icon: Sun, label: "Claro" },
		{ id: "dark", icon: Moon, label: "Escuro" },
		{ id: "system", icon: Monitor, label: "Sistema" },
	];

	return (
		<div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
			{themes.map((t) => (
				<button
					key={t.id}
					type="button"
					onClick={() => setTheme(t.id)}
					className={cn(
						"flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
						theme === t.id
							? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
					)}
				>
					<t.icon className="h-4 w-4" />
					<span className="hidden sm:inline">{t.label}</span>
				</button>
			))}
		</div>
	);
}
