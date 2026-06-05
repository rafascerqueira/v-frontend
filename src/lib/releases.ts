export type ChangeType = "feature" | "improvement" | "fix" | "security";

export interface ReleaseChange {
	type: ChangeType;
	text: string;
}

export interface Release {
	version: string;
	/** ISO date (YYYY-MM-DD) */
	date: string;
	title: string;
	summary: string;
	tags: string[];
	changes: ReleaseChange[];
}

/**
 * Histórico de versões do Vendinhas, escrito a partir dos nossos commits e
 * traduzido para o que muda na prática para quem usa o produto.
 * Ordem: mais recente primeiro.
 */
export const releases: Release[] = [
	{
		version: "1.5.0",
		date: "2026-06-04",
		title: "Mais proteção na sua conta",
		summary:
			"Adicionamos verificação em duas etapas e ampliamos os dados de perfil para você manter a conta mais segura e completa.",
		tags: ["Segurança", "Conta"],
		changes: [
			{
				type: "security",
				text: "Verificação em duas etapas (2FA) com aplicativo autenticador — uma camada extra de proteção no login.",
			},
			{
				type: "feature",
				text: "Perfil de conta expandido com novos campos para personalizar suas informações.",
			},
			{
				type: "improvement",
				text: "Geração de chaves de segurança simplificada e ajustes internos de performance.",
			},
		],
	},
	{
		version: "1.4.0",
		date: "2026-05-29",
		title: "Login social e blindagem de segurança",
		summary:
			"Entrar ficou mais rápido com Google e Facebook, e reforçamos toda a camada de segurança e a busca do catálogo.",
		tags: ["Segurança", "Login", "Catálogo"],
		changes: [
			{
				type: "feature",
				text: "Login com Google e Facebook — acesse sua conta com um clique.",
			},
			{
				type: "security",
				text: "Proteção CSRF no fluxo de login social e cookies de sessão mais seguros.",
			},
			{
				type: "feature",
				text: "Seus clientes agora podem definir senha e acompanhar pedidos pelo catálogo público.",
			},
			{
				type: "improvement",
				text: "Busca por produtos e clientes ignora maiúsculas e acentos, encontrando mais resultados.",
			},
			{
				type: "security",
				text: "Hardening de produção e validação reforçada dos tokens de acesso.",
			},
		],
	},
	{
		version: "1.3.0",
		date: "2026-05-01",
		title: "Painel administrativo e limites flexíveis",
		summary:
			"Mais controle sobre os dados da conta e regras de plano que se adaptam ao seu momento.",
		tags: ["Conta", "Planos"],
		changes: [
			{
				type: "feature",
				text: "Atualize os dados da conta e troque a senha diretamente pelo painel.",
			},
			{
				type: "improvement",
				text: "Limites do plano grátis agora são dinâmicos, com exceções configuráveis por conta.",
			},
			{
				type: "improvement",
				text: "Tempo de espera (cooldown) no pedido de redefinição de senha e envio de e-mails mais confiável.",
			},
		],
	},
	{
		version: "1.2.0",
		date: "2026-04-21",
		title: "Assinaturas e catálogo com conta de cliente",
		summary:
			"Lançamos a cobrança recorrente com Stripe e demos mais autonomia aos seus clientes no catálogo.",
		tags: ["Pagamentos", "Catálogo"],
		changes: [
			{
				type: "feature",
				text: "Assinaturas com Stripe: checkout seguro e portal para gerenciar seu plano.",
			},
			{
				type: "feature",
				text: "Clientes podem criar conta e acompanhar o status dos pedidos no catálogo público.",
			},
			{
				type: "fix",
				text: "Correção no cálculo das datas de vencimento para evitar diferenças de fuso horário.",
			},
		],
	},
	{
		version: "1.1.0",
		date: "2026-04-11",
		title: "Combos, promoções e fornecedores",
		summary:
			"Um pacote grande de novidades para vender mais e organizar melhor o seu estoque.",
		tags: ["Vendas", "Estoque"],
		changes: [
			{
				type: "feature",
				text: "Combos de produtos (bundles) para montar ofertas com vários itens.",
			},
			{ type: "feature", text: "Módulo de promoções para criar descontos." },
			{
				type: "feature",
				text: "Cadastro de fornecedores para acompanhar de onde vêm seus produtos.",
			},
			{
				type: "feature",
				text: "Dia de cobrança por cliente e central de cobranças (fiado).",
			},
			{
				type: "improvement",
				text: "Dashboard mais rápido com cache das métricas principais.",
			},
		],
	},
	{
		version: "1.0.0",
		date: "2026-01-25",
		title: "Lançamento do Vendinhas",
		summary:
			"O começo de tudo: a primeira versão pública com o essencial para gerenciar suas vendas.",
		tags: ["Lançamento"],
		changes: [
			{
				type: "feature",
				text: "Gestão de vendas, controle de estoque e cadastro de clientes.",
			},
			{
				type: "feature",
				text: "Catálogo digital compartilhável por link, ideal para WhatsApp.",
			},
			{
				type: "feature",
				text: "Suporte a múltiplas empresas e infraestrutura pronta para produção.",
			},
		],
	},
];
