"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 4000,
				style: {
					background: "#fff",
					color: "#1f2937",
					padding: "16px",
					borderRadius: "8px",
					boxShadow:
						"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
				},
				success: {
					iconTheme: {
						primary: "#10b981",
						secondary: "#fff",
					},
				},
				error: {
					iconTheme: {
						primary: "#ef4444",
						secondary: "#fff",
					},
				},
			}}
		/>
	);
}

export { toast } from "react-hot-toast";
