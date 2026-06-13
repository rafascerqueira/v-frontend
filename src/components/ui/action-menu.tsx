"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ActionMenuContextValue {
	close: () => void;
}

const ActionMenuContext = createContext<ActionMenuContextValue | null>(null);

interface ActionMenuProps {
	children: React.ReactNode;
	className?: string;
	triggerClassName?: string;
	label?: string;
}

/**
 * Inline row action menu. Renders the dropdown in a portal with fixed
 * positioning (anchored to the trigger) so it escapes table/card overflow
 * containers instead of being clipped. Closes on outside click, scroll or
 * resize.
 */
export function ActionMenu({
	children,
	className,
	triggerClassName,
	label = "Ações",
}: ActionMenuProps) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const close = useCallback(() => {
		setOpen(false);
		setPos(null);
	}, []);

	useEffect(() => {
		if (!open) return;
		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				triggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}
			close();
		};
		document.addEventListener("mousedown", handlePointerDown);
		window.addEventListener("scroll", close, true);
		window.addEventListener("resize", close);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			window.removeEventListener("scroll", close, true);
			window.removeEventListener("resize", close);
		};
	}, [open, close]);

	const toggle = () => {
		if (open) {
			close();
			return;
		}
		const el = triggerRef.current;
		if (el) {
			const rect = el.getBoundingClientRect();
			setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
		}
		setOpen(true);
	};

	return (
		<div className="inline-block">
			<button
				ref={triggerRef}
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={label}
				onClick={toggle}
				className={cn(
					"p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
					triggerClassName,
				)}
			>
				<MoreVertical className="h-4 w-4 text-gray-500" />
			</button>
			{typeof document !== "undefined" &&
				createPortal(
					<AnimatePresence>
						{open && pos && (
							<motion.div
								ref={menuRef}
								role="menu"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.12 }}
								style={{
									position: "fixed",
									top: pos.top,
									right: pos.right,
									zIndex: 50,
								}}
								className={cn(
									"w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1",
									className,
								)}
							>
								<ActionMenuContext.Provider value={{ close }}>
									{children}
								</ActionMenuContext.Provider>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</div>
	);
}

const itemVariants = {
	default:
		"text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
	danger:
		"text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
	success:
		"text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
	info: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
	warning:
		"text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20",
};

interface ActionMenuItemProps {
	children: React.ReactNode;
	onClick?: () => void;
	variant?: keyof typeof itemVariants;
	disabled?: boolean;
	className?: string;
	closeOnClick?: boolean;
}

export function ActionMenuItem({
	children,
	onClick,
	variant = "default",
	disabled,
	className,
	closeOnClick = true,
}: ActionMenuItemProps) {
	const ctx = useContext(ActionMenuContext);
	return (
		<button
			type="button"
			role="menuitem"
			disabled={disabled}
			onClick={() => {
				onClick?.();
				if (closeOnClick) ctx?.close();
			}}
			className={cn(
				"flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
				itemVariants[variant],
				className,
			)}
		>
			{children}
		</button>
	);
}

export function ActionMenuDivider() {
	return <div className="my-1 border-t border-gray-100 dark:border-gray-700" />;
}

export function ActionMenuLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="px-4 py-1 text-xs uppercase text-gray-500 dark:text-gray-400">
			{children}
		</p>
	);
}
