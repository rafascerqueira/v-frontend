import type { Metadata } from "next";

export const metadata: Metadata = {
	title:
		"Vendinhas - Sistema de Gestão de Vendas com Inteligência Artificial | CRM para Pequenos Negócios",
	description:
		"Revolucione seu negócio com o Vendinhas! Sistema completo de gestão de vendas, controle de estoque e CRM potencializado por inteligência artificial. Comece grátis e aumente suas vendas em até 40%.",
	keywords: [
		"sistema de vendas",
		"gestão de vendas",
		"controle de estoque",
		"CRM para pequenas empresas",
		"software de vendas",
		"PDV online",
		"catálogo digital",
		"inteligência artificial vendas",
		"automação comercial",
		"gestão de clientes",
		"sistema para loja",
		"controle de pedidos",
		"relatórios de vendas",
		"sistema grátis vendas",
	],
	authors: [{ name: "Vendinhas", url: "https://vendinhas.app" }],
	creator: "Vendinhas",
	publisher: "Vendinhas",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: "https://vendinhas.app",
	},
	openGraph: {
		type: "website",
		locale: "pt_BR",
		url: "https://vendinhas.app",
		title: "Vendinhas - Sistema de Gestão de Vendas com IA",
		description:
			"Sistema completo de gestão de vendas, estoque e clientes com inteligência artificial. Comece grátis!",
		siteName: "Vendinhas",
		// Point at the dynamically generated card (src/app/opengraph-image.tsx).
		// Defining `openGraph` here overrides the root layout, so the image must
		// be declared explicitly or the landing card would render blank.
		images: [
			{
				url: "https://vendinhas.app/opengraph-image",
				width: 1200,
				height: 630,
				type: "image/png",
				alt: "Vendinhas - Sistema de Gestão Inteligente para seu Negócio",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Vendinhas - Sistema de Gestão de Vendas com IA",
		description:
			"Sistema completo de gestão de vendas, estoque e clientes com inteligência artificial. Comece grátis!",
		images: ["https://vendinhas.app/twitter-image"],
		creator: "@vendinhas",
	},
	category: "Business Software",
	classification: "Sales Management System",
};

export const structuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "WebSite",
			"@id": "https://vendinhas.app/#website",
			url: "https://vendinhas.app",
			name: "Vendinhas",
			description: "Sistema de Gestão de Vendas com Inteligência Artificial",
			publisher: {
				"@id": "https://vendinhas.app/#organization",
			},
			inLanguage: "pt-BR",
		},
		{
			"@type": "Organization",
			"@id": "https://vendinhas.app/#organization",
			name: "Vendinhas",
			url: "https://vendinhas.app",
			logo: {
				"@type": "ImageObject",
				url: "https://vendinhas.app/vendinhas.svg",
				width: 200,
				height: 48,
			},
			sameAs: [
				"https://instagram.com/vendinhas.app",
				"https://linkedin.com/company/vendinhas",
				"https://youtube.com/@vendinhas",
			],
			contactPoint: {
				"@type": "ContactPoint",
				contactType: "customer service",
				availableLanguage: "Portuguese",
			},
		},
		{
			"@type": "SoftwareApplication",
			"@id": "https://vendinhas.app/#software",
			name: "Vendinhas",
			description:
				"Sistema completo de gestão de vendas, controle de estoque e CRM potencializado por inteligência artificial",
			url: "https://vendinhas.app",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			offers: [
				{
					"@type": "Offer",
					name: "Plano Grátis",
					price: "0",
					priceCurrency: "BRL",
					description: "Até 50 produtos, 100 clientes e 30 vendas/mês",
				},
				{
					"@type": "Offer",
					name: "Plano Profissional",
					price: "14.90",
					priceCurrency: "BRL",
					priceValidUntil: "2026-12-31",
					description: "Até 500 produtos, 1.000 clientes e 500 vendas/mês",
				},
			],
			featureList: [
				"Gestão de vendas em tempo real",
				"Controle de estoque automatizado",
				"CRM integrado",
				"Catálogo digital",
				"Relatórios avançados",
				"Inteligência artificial",
				"Multi-usuários",
				"Múltiplas formas de pagamento",
			],
		},
		{
			"@type": "FAQPage",
			"@id": "https://vendinhas.app/#faq",
			mainEntity: [
				{
					"@type": "Question",
					name: "O Vendinhas é realmente gratuito?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Sim! O plano gratuito é para sempre e inclui até 50 produtos, 100 clientes e 30 vendas por mês. Perfeito para quem está começando.",
					},
				},
				{
					"@type": "Question",
					name: "Posso usar no celular?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Sim! O Vendinhas funciona em qualquer dispositivo com navegador. É totalmente responsivo e otimizado para mobile.",
					},
				},
				{
					"@type": "Question",
					name: "Como funciona a inteligência artificial?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Nossa IA analisa seus dados de vendas para oferecer insights, previsões de demanda e sugestões personalizadas para melhorar seu negócio.",
					},
				},
				{
					"@type": "Question",
					name: "Posso cancelar a qualquer momento?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Sim! Não há fidelidade. Você pode fazer upgrade, downgrade ou cancelar quando quiser.",
					},
				},
				{
					"@type": "Question",
					name: "Meus dados estão seguros?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Absolutamente! Utilizamos criptografia de ponta a ponta e seguimos todas as normas da LGPD para proteger seus dados.",
					},
				},
			],
		},
	],
};
