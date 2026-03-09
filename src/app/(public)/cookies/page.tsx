"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Cookie } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CookiesPage() {
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
							<div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
								<Cookie className="w-7 h-7 text-amber-600 dark:text-amber-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Política de Cookies
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Última atualização: 25 de janeiro de 2026
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								Esta <strong>Política de Cookies</strong> explica como o{" "}
								<strong>Vendinhas.app</strong> utiliza cookies e tecnologias
								semelhantes para reconhecê-lo quando você visita nosso site. Ela
								explica o que são essas tecnologias e por que as usamos, bem
								como seus direitos de controlar o uso delas.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								1. O que são Cookies?
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Cookies são pequenos arquivos de dados que são colocados no seu
								computador ou dispositivo móvel quando você visita um site.
								Cookies são amplamente utilizados por proprietários de sites
								para fazer seus sites funcionarem, ou funcionarem de forma mais
								eficiente, bem como para fornecer informações de relatório.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								2. Cookies que Utilizamos
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Utilizamos os seguintes tipos de cookies:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
								<li>
									<strong>Cookies Essenciais</strong>: Necessários para o
									funcionamento do site. Incluem cookies de autenticação e
									segurança. Sem eles, o serviço não pode ser fornecido.
								</li>
								<li>
									<strong>Cookies de Preferência</strong>: Permitem que o site
									lembre suas escolhas, como tema (claro/escuro) e preferências
									de idioma.
								</li>
								<li>
									<strong>Cookies de Desempenho</strong>: Coletam informações
									sobre como você usa o site, como páginas visitadas e erros
									encontrados. Esses dados são anônimos e usados apenas para
									melhorar o funcionamento do site.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								3. Cookies de Terceiros
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Não utilizamos cookies de terceiros para fins de publicidade.
								Eventualmente, cookies de serviços integrados (como
								processadores de pagamento) podem ser definidos para garantir a
								segurança das transações.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								4. Como Gerenciar Cookies
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Você pode configurar seu navegador para{" "}
								<strong>recusar cookies</strong> ou para alertá-lo quando
								cookies estão sendo enviados. No entanto, se você desativar ou
								recusar cookies, algumas partes do{" "}
								<strong>Vendinhas.app</strong> podem ficar inacessíveis ou não
								funcionar corretamente.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								5. Tempo de Retenção
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Cookies essenciais e de preferência são retidos enquanto sua
								sessão estiver ativa ou por até <strong>30 dias</strong> após
								sua última visita. Cookies de desempenho são retidos por até{" "}
								<strong>12 meses</strong>.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								6. Contato
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Se tiver dúvidas sobre o uso de cookies, entre em contato em{" "}
								<a
									href="mailto:privacidade@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									privacidade@vendinhas.app
								</a>
								.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
