import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	themeColor: "#4f46e5",
};

const SITE_URL = "https://vendinhas.app";
const SITE_NAME = "Vendinhas";
const DEFAULT_TITLE = "Vendinhas — Sistema de Gestão de Vendas com IA";
const DEFAULT_DESCRIPTION =
	"Gestão de vendas, controle de estoque e CRM com inteligência artificial. Comece grátis, sem cartão de crédito.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: DEFAULT_TITLE,
		template: "%s | Vendinhas",
	},
	description: DEFAULT_DESCRIPTION,
	manifest: "/manifest.json",
	applicationName: SITE_NAME,
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: SITE_NAME,
	},
	icons: {
		icon: "/v-de-vendinhas.svg",
		shortcut: "/v-de-vendinhas.svg",
		apple: "/v-de-vendinhas.svg",
	},
	// Default social card for every shared link. The actual image is generated
	// by src/app/opengraph-image.tsx (and twitter-image.tsx) and injected by Next.
	openGraph: {
		type: "website",
		locale: "pt_BR",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		creator: "@vendinhas",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
			<body
				className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
			>
				<ThemeProvider>
					<AuthProvider>
						<SubscriptionProvider>
							{children}
							<ToastProvider />
						</SubscriptionProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
