"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 4000,
				// Drive colours from the semantic CSS variables (defined in
				// globals.css :root / .dark) so toasts track light/dark
				// automatically — no useTheme() round-trip, reactive to theme
				// switches with zero JS.
				style: {
					background: "var(--surface)",
					color: "var(--foreground)",
					border: "1px solid var(--border)",
					padding: "16px",
					borderRadius: "12px",
					boxShadow:
						"0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.12)",
				},
				success: {
					iconTheme: {
						primary: "#10b981",
						secondary: "var(--surface)",
					},
				},
				error: {
					iconTheme: {
						primary: "#ef4444",
						secondary: "var(--surface)",
					},
				},
			}}
		/>
	);
}

export { toast } from "react-hot-toast";
