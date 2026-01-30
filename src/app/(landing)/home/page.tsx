"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	BarChart3,
	BrainCircuit,
	CheckCircle2,
	ChevronDown,
	Clock,
	CreditCard,
	Globe,
	Layers,
	MessageSquare,
	Package,
	Rocket,
	ShoppingCart,
	Sparkles,
	Star,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

function HeroSection() {
	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-400 rounded-full blur-3xl opacity-30" />
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={staggerContainer}
					className="text-center max-w-4xl mx-auto"
				>
					<motion.div
						variants={fadeInUp}
						className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8"
					>
						<Sparkles className="h-4 w-4" />
						<span>Novo: Inteligência Artificial integrada</span>
					</motion.div>

					<motion.h1
						variants={fadeInUp}
						className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
					>
						A gestão de vendas que o seu{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
							negócio precisa
						</span>
					</motion.h1>

					<motion.p
						variants={fadeInUp}
						className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto"
					>
						Simplifique suas vendas, controle seu estoque e entenda seus
						clientes com uma única ferramenta potencializada por inteligência
						artificial.
					</motion.p>

					<motion.div
						variants={fadeInUp}
						className="flex flex-col sm:flex-row items-center justify-center gap-4"
					>
						<Link
							href="/register"
							className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg shadow-indigo-900/30"
						>
							Começar Grátis
							<ArrowRight className="h-5 w-5" />
						</Link>
						<a
							href="#features"
							className="inline-flex items-center gap-2 text-white/90 hover:text-white px-6 py-4 text-lg font-medium transition-colors"
						>
							Ver funcionalidades
							<ChevronDown className="h-5 w-5" />
						</a>
					</motion.div>

					<motion.div
						variants={fadeInUp}
						className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
					>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-white">
								500+
							</div>
							<div className="text-indigo-200 text-sm">Empresas ativas</div>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-white">
								50k+
							</div>
							<div className="text-indigo-200 text-sm">Vendas processadas</div>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-white">
								99.9%
							</div>
							<div className="text-indigo-200 text-sm">Disponibilidade</div>
						</div>
					</motion.div>
				</motion.div>
			</div>

			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
				<ChevronDown className="h-8 w-8 text-white/50" />
			</div>
		</section>
	);
}

const features = [
	{
		icon: ShoppingCart,
		title: "Gestão de Vendas",
		description:
			"Acompanhe suas vendas em tempo real, de forma simples e intuitiva. PDV completo e integrado.",
	},
	{
		icon: Package,
		title: "Controle de Estoque",
		description:
			"Evite perdas e saiba exatamente quando repor seus produtos. Alertas automáticos de estoque baixo.",
	},
	{
		icon: Users,
		title: "CRM Integrado",
		description:
			"Organize os pedidos e melhore o relacionamento com seus clientes. Histórico completo de compras.",
	},
	{
		icon: BarChart3,
		title: "Relatórios Avançados",
		description:
			"Dashboards intuitivos com métricas importantes para tomar decisões baseadas em dados.",
	},
	{
		icon: Globe,
		title: "Catálogo Digital",
		description:
			"Crie seu catálogo online e compartilhe com clientes via link. Ideal para WhatsApp e redes sociais.",
	},
	{
		icon: CreditCard,
		title: "Múltiplas Formas de Pagamento",
		description:
			"PIX, cartões, dinheiro, fiado. Controle todos os recebimentos em um só lugar.",
	},
];

function FeaturesSection() {
	return (
		<section id="features" className="py-24 bg-white dark:bg-gray-900">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-16"
				>
					<motion.span
						variants={fadeInUp}
						className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4"
					>
						Funcionalidades
					</motion.span>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
					>
						Tudo que você precisa em um só lugar
					</motion.h2>
					<motion.p
						variants={fadeInUp}
						className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
					>
						Ferramentas poderosas e fáceis de usar para gerenciar todo o seu
						negócio
					</motion.p>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{features.map((feature) => (
						<motion.div
							key={feature.title}
							variants={fadeInUp}
							className="group p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 hover:shadow-lg"
						>
							<div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
								<feature.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
								{feature.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{feature.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

const steps = [
	{
		icon: Rocket,
		title: "Crie sua conta",
		description:
			"Cadastro rápido e gratuito. Comece a usar em menos de 2 minutos.",
	},
	{
		icon: Layers,
		title: "Configure seu negócio",
		description:
			"Adicione seus produtos, categorias e personalize conforme sua necessidade.",
	},
	{
		icon: TrendingUp,
		title: "Venda e cresça",
		description:
			"Registre vendas, acompanhe métricas e tome decisões inteligentes.",
	},
];

function HowItWorksSection() {
	return (
		<section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-800">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-16"
				>
					<motion.span
						variants={fadeInUp}
						className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4"
					>
						Como Funciona
					</motion.span>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
					>
						Simples de começar, fácil de usar
					</motion.h2>
					<motion.p
						variants={fadeInUp}
						className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
					>
						Em apenas 3 passos você está pronto para transformar seu negócio
					</motion.p>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid md:grid-cols-3 gap-8 relative"
				>
					<div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-indigo-200 dark:bg-indigo-800 -translate-y-1/2" />

					{steps.map((step, index) => (
						<motion.div
							key={step.title}
							variants={fadeInUp}
							className="relative text-center"
						>
							<div className="relative z-10 w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
								<step.icon className="w-10 h-10 text-white" />
								<div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-indigo-600 font-bold shadow">
									{index + 1}
								</div>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
								{step.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{step.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

const aiFeatures = [
	{
		icon: BarChart3,
		title: "Insights de Vendas",
		description:
			"Nossa IA analisa seus dados e oferece insights valiosos para você vender mais e melhor.",
	},
	{
		icon: MessageSquare,
		title: "Assistente Inteligente",
		description:
			"Tire dúvidas e receba sugestões personalizadas para o seu negócio com nosso assistente virtual.",
	},
	{
		icon: TrendingUp,
		title: "Previsão de Demanda",
		description:
			"Antecipe tendências e prepare seu estoque com previsões baseadas em machine learning.",
	},
	{
		icon: Zap,
		title: "Automações Inteligentes",
		description:
			"Automatize tarefas repetitivas e foque no que realmente importa: seus clientes.",
	},
];

function AISection() {
	return (
		<section
			id="ai"
			className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden"
		>
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
				<div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full blur-3xl" />
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid lg:grid-cols-2 gap-16 items-center"
				>
					<motion.div variants={fadeInUp}>
						<span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
							<BrainCircuit className="h-4 w-4" />
							Inteligência Artificial
						</span>
						<h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
							Venda mais com o poder da{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
								Inteligência Artificial
							</span>
						</h2>
						<p className="text-lg text-indigo-100 mb-8">
							Nossa IA trabalha 24 horas por dia analisando seus dados para
							ajudar você a tomar as melhores decisões para o seu negócio.
						</p>

						<div className="space-y-6">
							{aiFeatures.map((feature) => (
								<div key={feature.title} className="flex gap-4">
									<div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
										<feature.icon className="w-6 h-6 text-yellow-300" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-white mb-1">
											{feature.title}
										</h3>
										<p className="text-indigo-200 text-sm">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-yellow-300 px-4 py-2 rounded-lg text-sm font-medium">
							<Clock className="h-4 w-4" />
							Em breve: novos recursos de IA
						</div>
					</motion.div>

					<motion.div variants={fadeInUp} className="relative">
						<div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm p-8 flex items-center justify-center">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-30 animate-pulse" />
								<BrainCircuit className="w-48 h-48 text-white relative z-10" />
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

interface Plan {
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	cta: string;
	highlighted: boolean;
	originalPrice?: string;
	promoLabel?: string;
	comingSoon?: boolean;
}

const plans: Plan[] = [
	{
		name: "Grátis",
		price: "R$ 0",
		period: "para sempre",
		description: "Perfeito para quem está começando",
		features: [
			"Até 50 produtos",
			"30 vendas/mês",
			"100 clientes",
			"Catálogo digital",
			"Controle de estoque",
			"Suporte por email",
		],
		cta: "Começar Grátis",
		highlighted: false,
	},
	{
		name: "Profissional",
		price: "R$ 14,90",
		originalPrice: "R$ 19,90",
		promoLabel: "Early Adopter",
		period: "/mês",
		description: "Para vendedores em crescimento",
		features: [
			"Até 500 produtos",
			"500 vendas/mês",
			"1.000 clientes",
			"Relatórios avançados",
			"Exportação de dados",
			"Múltiplas imagens",
			"Suporte prioritário",
		],
		cta: "Assinar Agora",
		highlighted: true,
	},
	{
		name: "Empresarial",
		price: "Em breve",
		period: "",
		description: "Para grandes operações",
		comingSoon: true,
		features: [
			"Produtos ilimitados",
			"Vendas ilimitadas",
			"Clientes ilimitados",
			"Suporte 24/7",
			"API completa",
			"Marca personalizada",
			"Integrações customizadas",
			"Gerente de conta",
		],
		cta: "Em Desenvolvimento",
		highlighted: false,
	},
];

function PricingSection() {
	return (
		<section id="pricing" className="py-24 bg-white dark:bg-gray-900">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-16"
				>
					<motion.span
						variants={fadeInUp}
						className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4"
					>
						Preços
					</motion.span>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
					>
						Planos que cabem no seu bolso
					</motion.h2>
					<motion.p
						variants={fadeInUp}
						className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
					>
						Comece gratuitamente e evolua conforme seu negócio cresce
					</motion.p>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
				>
					{plans.map((plan) => (
						<motion.div
							key={plan.name}
							variants={fadeInUp}
							className={cn(
								"relative p-8 rounded-2xl border-2 transition-all duration-300",
								plan.highlighted
									? "bg-indigo-600 border-indigo-600 text-white scale-105 shadow-xl shadow-indigo-600/30"
									: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300",
							)}
						>
							{plan.highlighted && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
									Mais Popular
								</div>
							)}

							<h3
								className={cn(
									"text-xl font-semibold mb-2",
									plan.highlighted
										? "text-white"
										: "text-gray-900 dark:text-white",
								)}
							>
								{plan.name}
							</h3>
							<div className="mb-4">
								{plan.originalPrice && (
									<div className="flex items-center gap-2 mb-1">
										<span
											className={cn(
												"text-sm line-through",
												plan.highlighted ? "text-indigo-300" : "text-gray-400",
											)}
										>
											{plan.originalPrice}
										</span>
										<span className="text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-medium">
											{plan.promoLabel}
										</span>
									</div>
								)}
								<span
									className={cn(
										"text-4xl font-bold",
										plan.comingSoon
											? "text-purple-600 dark:text-purple-400"
											: plan.highlighted
												? "text-white"
												: "text-gray-900 dark:text-white",
									)}
								>
									{plan.price}
								</span>
								<span
									className={cn(
										"text-sm",
										plan.highlighted ? "text-indigo-200" : "text-gray-500",
									)}
								>
									{plan.period}
								</span>
							</div>
							<p
								className={cn(
									"text-sm mb-6",
									plan.highlighted
										? "text-indigo-200"
										: "text-gray-600 dark:text-gray-400",
								)}
							>
								{plan.description}
							</p>

							<ul className="space-y-3 mb-8">
								{plan.features.map((feature) => (
									<li key={feature} className="flex items-center gap-3">
										<CheckCircle2
											className={cn(
												"w-5 h-5 flex-shrink-0",
												plan.highlighted
													? "text-yellow-300"
													: "text-indigo-600",
											)}
										/>
										<span
											className={cn(
												"text-sm",
												plan.highlighted
													? "text-white"
													: "text-gray-600 dark:text-gray-400",
											)}
										>
											{feature}
										</span>
									</li>
								))}
							</ul>

							{plan.comingSoon ? (
								<div className="block w-full text-center py-3 rounded-xl font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 cursor-not-allowed">
									{plan.cta}
								</div>
							) : (
								<Link
									href="/register"
									className={cn(
										"block w-full text-center py-3 rounded-xl font-semibold transition-all",
										plan.highlighted
											? "bg-white text-indigo-600 hover:bg-indigo-50"
											: "bg-indigo-600 text-white hover:bg-indigo-700",
									)}
								>
									{plan.cta}
								</Link>
							)}
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

const testimonials = [
	{
		name: "Maria Silva",
		role: "Dona de Boutique",
		content:
			"O Vendinhas transformou minha loja! Agora tenho controle total do estoque e das vendas. Recomendo demais!",
		rating: 5,
	},
	{
		name: "João Santos",
		role: "Dono de Restaurante",
		content:
			"Antes eu perdia muito tempo com planilhas. Com o Vendinhas, tudo ficou mais simples e organizado.",
		rating: 5,
	},
	{
		name: "Ana Costa",
		role: "Empreendedora",
		content:
			"O catálogo digital é incrível! Meus clientes adoram e minhas vendas pelo WhatsApp aumentaram 40%.",
		rating: 5,
	},
];

function TestimonialsSection() {
	return (
		<section className="py-24 bg-gray-50 dark:bg-gray-800">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-16"
				>
					<motion.span
						variants={fadeInUp}
						className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4"
					>
						Depoimentos
					</motion.span>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
					>
						O que nossos clientes dizem
					</motion.h2>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="grid md:grid-cols-3 gap-8"
				>
					{testimonials.map((testimonial) => (
						<motion.div
							key={testimonial.name}
							variants={fadeInUp}
							className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm"
						>
							<div className="flex gap-1 mb-4">
								{Array.from({ length: testimonial.rating }).map((_, i) => (
									<Star
										key={`star-${testimonial.name}-${i}`}
										className="w-5 h-5 text-yellow-400 fill-yellow-400"
									/>
								))}
							</div>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								&quot;{testimonial.content}&quot;
							</p>
							<div>
								<div className="font-semibold text-gray-900 dark:text-white">
									{testimonial.name}
								</div>
								<div className="text-sm text-gray-500">{testimonial.role}</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

const faqs = [
	{
		question: "O Vendinhas é realmente gratuito?",
		answer:
			"Sim! O plano gratuito é para sempre e inclui até 50 produtos e 100 vendas por mês. Perfeito para quem está começando.",
	},
	{
		question: "Posso usar no celular?",
		answer:
			"Sim! O Vendinhas funciona em qualquer dispositivo com navegador. É totalmente responsivo e otimizado para mobile.",
	},
	{
		question: "Como funciona a inteligência artificial?",
		answer:
			"Nossa IA analisa seus dados de vendas para oferecer insights, previsões de demanda e sugestões personalizadas para melhorar seu negócio.",
	},
	{
		question: "Posso cancelar a qualquer momento?",
		answer:
			"Sim! Não há fidelidade. Você pode fazer upgrade, downgrade ou cancelar quando quiser.",
	},
	{
		question: "Meus dados estão seguros?",
		answer:
			"Absolutamente! Utilizamos criptografia de ponta a ponta e seguimos todas as normas da LGPD para proteger seus dados.",
	},
	{
		question: "Vocês oferecem suporte?",
		answer:
			"Sim! Oferecemos suporte por email para todos os planos e suporte prioritário para planos pagos.",
	},
];

function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section id="faq" className="py-24 bg-white dark:bg-gray-900">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-16"
				>
					<motion.span
						variants={fadeInUp}
						className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4"
					>
						Dúvidas Frequentes
					</motion.span>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
					>
						Perguntas e Respostas
					</motion.h2>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="max-w-3xl mx-auto space-y-4"
				>
					{faqs.map((faq, index) => (
						<motion.div
							key={faq.question}
							variants={fadeInUp}
							className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
						>
							<button
								type="button"
								onClick={() => setOpenIndex(openIndex === index ? null : index)}
								className="w-full flex items-center justify-between p-6 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								<span className="font-semibold text-gray-900 dark:text-white">
									{faq.question}
								</span>
								<ChevronDown
									className={cn(
										"w-5 h-5 text-gray-500 transition-transform",
										openIndex === index && "rotate-180",
									)}
								/>
							</button>
							{openIndex === index && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className="p-6 bg-white dark:bg-gray-900"
								>
									<p className="text-gray-600 dark:text-gray-400">
										{faq.answer}
									</p>
								</motion.div>
							)}
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

function CTASection() {
	return (
		<section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center max-w-3xl mx-auto"
				>
					<motion.h2
						variants={fadeInUp}
						className="text-3xl sm:text-4xl font-bold text-white mb-6"
					>
						Pronto para transformar seu negócio?
					</motion.h2>
					<motion.p
						variants={fadeInUp}
						className="text-lg text-indigo-100 mb-8"
					>
						Junte-se a mais de 500 empresas que já estão vendendo mais com o
						Vendinhas.
					</motion.p>
					<motion.div variants={fadeInUp}>
						<Link
							href="/register"
							className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg"
						>
							Começar Grátis Agora
							<ArrowRight className="h-5 w-5" />
						</Link>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

export default function LandingPage() {
	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<AISection />
			<PricingSection />
			<TestimonialsSection />
			<FAQSection />
			<CTASection />
		</>
	);
}
