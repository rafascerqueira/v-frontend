"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
};

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}: ModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<Fragment>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
						onClick={onClose}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							className={cn(
								"relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl",
								sizeClasses[size],
							)}
							onClick={(e) => e.stopPropagation()}
						>
							{title && (
								<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
									<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
										{title}
									</h2>
									<button
										type="button"
										onClick={onClose}
										className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
									>
										<X className="h-5 w-5" />
									</button>
								</div>
							)}
							<div className="p-6">{children}</div>
						</motion.div>
					</div>
				</Fragment>
			)}
		</AnimatePresence>
	);
}
