"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Bell,
	CheckCheck,
	CheckCircle,
	Info,
	Trash2,
	XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Notification, useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeIcons = {
	info: Info,
	success: CheckCircle,
	warning: AlertTriangle,
	error: XCircle,
};

const typeColors = {
	info: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
	success: "text-green-500 bg-green-50 dark:bg-green-900/20",
	warning: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
	error: "text-red-500 bg-red-50 dark:bg-red-900/20",
};

function formatTime(date: Date) {
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return "Agora";
	if (minutes < 60) return `${minutes}m atrás`;
	if (hours < 24) return `${hours}h atrás`;
	return `${days}d atrás`;
}

function NotificationItem({
	notification,
	onMarkAsRead,
}: {
	notification: Notification;
	onMarkAsRead: (id: string) => void;
}) {
	const Icon = typeIcons[notification.type];

	return (
		<div
			className={cn(
				"p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
				!notification.read && "bg-indigo-50/50 dark:bg-indigo-900/10",
			)}
			onClick={() => !notification.read && onMarkAsRead(notification.id)}
		>
			<div className="flex gap-3">
				<div className={cn("p-2 rounded-full", typeColors[notification.type])}>
					<Icon className="w-4 h-4" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
							{notification.title}
						</p>
						{!notification.read && (
							<span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
						)}
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
						{notification.message}
					</p>
					<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
						{formatTime(notification.timestamp)}
					</p>
				</div>
			</div>
		</div>
	);
}

export function NotificationsDropdown() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
		useNotifications();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={dropdownRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
					>
						<div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Notificações
							</h3>
							<div className="flex gap-1">
								{unreadCount > 0 && (
									<button
										type="button"
										onClick={markAllAsRead}
										className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
										title="Marcar todas como lidas"
									>
										<CheckCheck className="w-4 h-4 text-gray-500" />
									</button>
								)}
								{notifications.length > 0 && (
									<button
										type="button"
										onClick={clearAll}
										className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
										title="Limpar todas"
									>
										<Trash2 className="w-4 h-4 text-gray-500" />
									</button>
								)}
							</div>
						</div>

						<div className="max-h-96 overflow-y-auto">
							{notifications.length === 0 ? (
								<div className="p-8 text-center">
									<Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Nenhuma notificação
									</p>
								</div>
							) : (
								notifications.map((notification) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onMarkAsRead={markAsRead}
									/>
								))
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
