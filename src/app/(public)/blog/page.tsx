"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Rocket } from "lucide-react";
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
		<div className="min-h-screen bg-transparent">
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

					<div className="bg-surface border border-border rounded-2xl shadow-sm p-8 md:p-12">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
								<BookOpen className="w-7 h-7 text-secondary-600 dark:text-secondary-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-foreground">Blog</h1>
								<p className="text-muted-foreground">
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

						{/* Cross-link to the changelog, which is already live */}
						<Link
							href="/releases"
							className="flex items-center gap-4 p-5 mb-8 rounded-xl border border-border bg-surface-muted hover:bg-surface-hover transition-colors group"
						>
							<div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
								<Rocket className="w-5 h-5 text-primary-600 dark:text-primary-400" />
							</div>
							<div className="min-w-0">
								<p className="font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
									Confira as novidades do Vendinhas
								</p>
								<p className="text-sm text-muted-foreground truncate">
									Acompanhe tudo o que lançamos, versão por versão, na página de
									Novidades.
								</p>
							</div>
						</Link>

						<div className="space-y-6">
							{posts.map((post) => (
								<div
									key={post.title}
									className="p-6 rounded-xl border border-border hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
								>
									<div className="flex items-center gap-3 mb-3">
										<span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full">
											{post.category}
										</span>
										<span className="flex items-center gap-1 text-xs text-subtle-foreground">
											<Clock className="w-3 h-3" />
											{post.readTime}
										</span>
									</div>
									<h3 className="text-lg font-semibold text-foreground mb-2">
										{post.title}
									</h3>
									<p className="text-sm text-muted-foreground mb-3">
										{post.excerpt}
									</p>
									<span className="text-xs text-subtle-foreground italic">
										{post.date}
									</span>
								</div>
							))}
						</div>

						<div className="mt-8 text-center">
							<p className="text-sm text-muted-foreground">
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
