"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CareersPage() {
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
							<div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
								<Briefcase className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Carreiras
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Faça parte do time Vendinhas
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								No <strong>Vendinhas</strong>, estamos construindo o futuro da
								gestão de vendas para pequenos empreendedores brasileiros. Se
								você é apaixonado por tecnologia e quer fazer a diferença na
								vida de milhares de negócios, esse é o lugar certo.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								Por que trabalhar conosco?
							</h2>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
								<li>
									<strong>100% remoto</strong> — trabalhe de onde quiser no
									Brasil.
								</li>
								<li>
									<strong>Impacto real</strong> — seu trabalho ajuda
									empreendedores reais a crescerem.
								</li>
								<li>
									<strong>Stack moderna</strong> — Next.js, React, TypeScript,
									NestJS, PostgreSQL, IA.
								</li>
								<li>
									<strong>Cultura aberta</strong> — feedback constante,
									autonomia e colaboração.
								</li>
							</ul>
						</div>

						<div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
							<Heart className="w-10 h-10 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Não temos vagas abertas no momento
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Mas adoramos conhecer pessoas talentosas! Envie seu currículo e
								entraremos em contato quando surgir uma oportunidade.
							</p>
							<div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
								<MapPin className="w-4 h-4" />
								Remoto — Brasil
							</div>
							<a
								href="mailto:carreiras@vendinhas.app"
								className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
							>
								Enviar Currículo
							</a>
						</div>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Conheça mais sobre nós na{" "}
								<Link
									href="/about"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									página Sobre Nós
								</Link>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
