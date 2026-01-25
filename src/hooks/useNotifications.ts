"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/contexts/auth-context";

export interface Notification {
	id: string;
	type: "info" | "success" | "warning" | "error";
	title: string;
	message: string;
	timestamp: Date;
	read: boolean;
	data?: Record<string, unknown>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useNotifications() {
	const { user } = useAuth();
	const [socket, setSocket] = useState<Socket | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!user?.id) return;

		// Delay connection to avoid React StrictMode double-invoke issues
		const timeoutId = setTimeout(() => {
			if (socketRef.current?.connected) return;

			const newSocket = io(`${API_URL}/notifications`, {
				query: { userId: user.id },
				transports: ["polling", "websocket"],
				withCredentials: true,
				reconnectionAttempts: 3,
				reconnectionDelay: 1000,
				autoConnect: true,
			});

			newSocket.on("connect", () => {
				if (process.env.NODE_ENV === "development") {
					console.log("[WS] Connected to notifications");
				}
			});

			newSocket.on("notification", (notification: Notification) => {
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
			});

			newSocket.on("notificationRead", (notificationId: string) => {
				setNotifications((prev) =>
					prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
				);
				setUnreadCount((prev) => Math.max(0, prev - 1));
			});

			newSocket.on("disconnect", () => {
				if (process.env.NODE_ENV === "development") {
					console.log("[WS] Disconnected from notifications");
				}
			});

			newSocket.on("connect_error", () => {
				// Silently handle connection errors
			});

			socketRef.current = newSocket;
			setSocket(newSocket);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [user?.id]);

	const markAsRead = useCallback(
		(notificationId: string) => {
			if (socket) {
				socket.emit("markAsRead", notificationId);
			}
		},
		[socket],
	);

	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		setUnreadCount(0);
	}, []);

	const clearAll = useCallback(() => {
		setNotifications([]);
		setUnreadCount(0);
	}, []);

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		clearAll,
		isConnected: socket?.connected ?? false,
	};
}
