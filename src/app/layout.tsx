import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Vendinhas - Sistema de Vendas",
	description: "Sistema completo de gestão de vendas",
	manifest: "/manifest.json",
	themeColor: "#4f46e5",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Vendinhas",
	},
	icons: {
		icon: "/v-de-vendinhas.svg",
		shortcut: "/v-de-vendinhas.svg",
		apple: "/v-de-vendinhas.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body
				className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900`}
			>
				<ThemeProvider>
					<AuthProvider>
						{children}
						<ToastProvider />
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
