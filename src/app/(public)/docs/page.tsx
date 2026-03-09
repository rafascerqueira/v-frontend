"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	BookOpen,
	Code,
	FileText,
	Layers,
	Rocket,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const sections = [
	{
		icon: Rocket,
		title: "Primeiros Passos",
		description:
			"Crie sua conta, configure seu negócio e comece a vender em minutos.",
	},
	{
		icon: Layers,
		title: "Produtos e Estoque",
		description:
			"Aprenda a cadastrar produtos, categorias e gerenciar seu estoque.",
	},
	{
		icon: FileText,
		title: "Vendas e Pedidos",
		description: "Registre vendas, gerencie pedidos e acompanhe cobranças.",
	},
	{
		icon: BookOpen,
		title: "Catálogo Digital",
		description: "Crie e compartilhe seu catálogo online com clientes.",
	},
	{
		icon: Settings,
		title: "Configurações",
		description: "Personalize o sistema, gerencie seu perfil e preferências.",
	},
	{
		icon: Code,
		title: "API (Em breve)",
		description: "Documentação da API REST para integrações avançadas.",
	},
];

export default function DocsPage() {
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
							<div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
								<BookOpen className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Documentação
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Guias e referências para usar o Vendinhas
								</p>
							</div>
						</div>

						<div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 mb-8">
							<p className="text-cyan-700 dark:text-cyan-300 font-medium text-center">
								📚 Nossa documentação está em construção. As seções abaixo serão
								expandidas com guias detalhados em breve.
							</p>
						</div>

						<div className="grid sm:grid-cols-2 gap-4 mb-8">
							{sections.map((section) => (
								<div
									key={section.title}
									className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
								>
									<section.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-3" />
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
										{section.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{section.description}
									</p>
								</div>
							))}
						</div>

						<div className="text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Precisa de ajuda agora? Visite a{" "}
								<Link
									href="/help"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									Central de Ajuda
								</Link>{" "}
								ou entre em{" "}
								<Link
									href="/contact"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									contato conosco
								</Link>
								.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
