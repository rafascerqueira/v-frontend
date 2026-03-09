"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const posts = [
	{
		title: "5 dicas para organizar seu estoque de forma eficiente",
		excerpt:
			"Aprenda estratégias simples para nunca mais perder vendas por falta de produtos ou excesso de estoque parado.",
		date: "Em breve",
		category: "Gestão",
		readTime: "5 min",
	},
	{
		title: "Como a inteligência artificial pode ajudar seu negócio",
		excerpt:
			"Descubra como o Vendinhas usa IA para gerar insights valiosos e previsões de demanda para pequenos negócios.",
		date: "Em breve",
		category: "Tecnologia",
		readTime: "7 min",
	},
	{
		title: "Guia completo: Catálogo digital para vendas pelo WhatsApp",
		excerpt:
			"Passo a passo para criar e compartilhar seu catálogo online e aumentar suas vendas via redes sociais.",
		date: "Em breve",
		category: "Vendas",
		readTime: "6 min",
	},
];

export default function BlogPage() {
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
							<div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
								<BookOpen className="w-7 h-7 text-secondary-600 dark:text-secondary-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Blog
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Dicas, novidades e conteúdo para seu negócio
								</p>
							</div>
						</div>

						<div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mb-8">
							<p className="text-primary-700 dark:text-primary-300 font-medium text-center">
								🚀 Nosso blog está em construção! Em breve teremos conteúdos
								incríveis para ajudar seu negócio a crescer.
							</p>
						</div>

						<div className="space-y-6">
							{posts.map((post) => (
								<div
									key={post.title}
									className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
								>
									<div className="flex items-center gap-3 mb-3">
										<span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full">
											{post.category}
										</span>
										<span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
											<Clock className="w-3 h-3" />
											{post.readTime}
										</span>
									</div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
										{post.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
										{post.excerpt}
									</p>
									<span className="text-xs text-gray-400 dark:text-gray-500 italic">
										{post.date}
									</span>
								</div>
							))}
						</div>

						<div className="mt-8 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Quer ser notificado quando publicarmos novos artigos?{" "}
								<Link
									href="/register"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									Crie sua conta gratuita
								</Link>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
