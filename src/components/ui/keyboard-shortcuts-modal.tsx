"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { shortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function KeyboardShortcutsModal({
	isOpen,
	onClose,
}: KeyboardShortcutsModalProps) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "?" && !e.ctrlKey && !e.altKey) {
				e.preventDefault();
			}
		};

		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-50"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
								<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
									Atalhos de Teclado
								</h2>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<X className="w-5 h-5 text-gray-500" />
							</button>
						</div>

						<div className="space-y-3">
							{shortcuts.map((shortcut, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
								>
									<span className="text-sm text-gray-600 dark:text-gray-300">
										{shortcut.description}
									</span>
									<div className="flex items-center gap-1">
										{shortcut.ctrl && (
											<kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
												Ctrl
											</kbd>
										)}
										{shortcut.alt && (
											<kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
												Alt
											</kbd>
										)}
										{shortcut.shift && (
											<kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
												Shift
											</kbd>
										)}
										{(shortcut.ctrl || shortcut.alt || shortcut.shift) && (
											<span className="text-gray-400 mx-1">+</span>
										)}
										<kbd className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded uppercase">
											{shortcut.key}
										</kbd>
									</div>
								</div>
							))}
						</div>

						<p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
							Pressione{" "}
							<kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
								?
							</kbd>{" "}
							para abrir este menu
						</p>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

export function useShortcutsModal() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" || target.tagName === "TEXTAREA";

			if (e.key === "?" && !isInput) {
				e.preventDefault();
				setIsOpen(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return {
		isOpen,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
	};
}
