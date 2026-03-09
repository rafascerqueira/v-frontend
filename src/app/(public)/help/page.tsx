"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	BarChart3,
	BookOpen,
	CreditCard,
	HelpCircle,
	Mail,
	MessageCircle,
	Package,
	ShoppingCart,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
	{
		icon: ShoppingCart,
		title: "Vendas e Pedidos",
		description:
			"Como registrar vendas, gerenciar pedidos e acompanhar o fluxo de caixa.",
	},
	{
		icon: Package,
		title: "Produtos e Estoque",
		description:
			"Cadastro de produtos, controle de estoque e alertas de reposição.",
	},
	{
		icon: Users,
		title: "Clientes",
		description: "Gestão de clientes, histórico de compras e CRM integrado.",
	},
	{
		icon: CreditCard,
		title: "Planos e Pagamentos",
		description:
			"Informações sobre planos, upgrade, downgrade e formas de pagamento.",
	},
	{
		icon: BarChart3,
		title: "Relatórios",
		description:
			"Como usar os dashboards e relatórios para tomar decisões melhores.",
	},
	{
		icon: BookOpen,
		title: "Catálogo Digital",
		description: "Como criar, personalizar e compartilhar seu catálogo online.",
	},
];

export default function HelpPage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<button
						type="button"
						onClick={() => router.back()}
						className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Voltar
					</button>

					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
								<HelpCircle className="w-7 h-7 text-primary-600 dark:text-primary-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Central de Ajuda
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Encontre respostas para suas dúvidas
								</p>
							</div>
						</div>

						<div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mb-8">
							<p className="text-primary-700 dark:text-primary-300 font-medium text-center">
								🔧 Estamos construindo nossa base de conhecimento completa.
								Enquanto isso, explore as categorias abaixo ou entre em contato
								diretamente.
							</p>
						</div>

						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
							Categorias de Ajuda
						</h2>

						<div className="grid sm:grid-cols-2 gap-4 mb-8">
							{categories.map((category) => (
								<div
									key={category.title}
									className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
								>
									<category.icon className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-3" />
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
										{category.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{category.description}
									</p>
								</div>
							))}
						</div>

						<div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
								Não encontrou o que procurava?
							</h2>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<a
									href="mailto:suporte@vendinhas.app"
									className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
								>
									<Mail className="w-4 h-4" />
									Email de Suporte
								</a>
								<Link
									href="/contact"
									className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									<MessageCircle className="w-4 h-4" />
									Outros canais de contato
								</Link>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
