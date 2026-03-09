"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LGPDPage() {
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
							<div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
								<Scale className="w-7 h-7 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									LGPD — Proteção de Dados
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								O <strong>Vendinhas.app</strong> está comprometido com a
								conformidade à{" "}
								<strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>.
								Esta página detalha como tratamos seus dados pessoais e quais
								são seus direitos enquanto titular de dados.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								1. Controlador de Dados
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								O <strong>Vendinhas.app</strong> atua como{" "}
								<strong>controlador de dados pessoais</strong>, sendo
								responsável pelas decisões referentes ao tratamento dos seus
								dados. Nosso encarregado de proteção de dados (DPO) pode ser
								contatado em{" "}
								<a
									href="mailto:dpo@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									dpo@vendinhas.app
								</a>
								.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								2. Bases Legais para Tratamento
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Tratamos seus dados pessoais com base nas seguintes hipóteses
								legais previstas na LGPD:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
								<li>
									<strong>Execução de contrato</strong>: para fornecer os
									serviços contratados (gestão de vendas, estoque e pedidos).
								</li>
								<li>
									<strong>Consentimento</strong>: para envio de comunicações
									promocionais e newsletters (você pode revogar a qualquer
									momento).
								</li>
								<li>
									<strong>Legítimo interesse</strong>: para melhorias no
									serviço, segurança da plataforma e prevenção de fraudes.
								</li>
								<li>
									<strong>Obrigação legal</strong>: para cumprimento de
									obrigações fiscais e regulatórias.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								3. Seus Direitos como Titular
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Conforme a LGPD (Art. 18), você tem direito a:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3">
								<li>
									<strong>Confirmação</strong> da existência de tratamento de
									dados.
								</li>
								<li>
									<strong>Acesso</strong> aos seus dados pessoais.
								</li>
								<li>
									<strong>Correção</strong> de dados incompletos, inexatos ou
									desatualizados.
								</li>
								<li>
									<strong>Anonimização, bloqueio ou eliminação</strong> de dados
									desnecessários ou tratados em desconformidade.
								</li>
								<li>
									<strong>Portabilidade</strong> dos dados a outro fornecedor de
									serviço.
								</li>
								<li>
									<strong>Eliminação</strong> dos dados tratados com base no
									consentimento.
								</li>
								<li>
									<strong>Informação</strong> sobre compartilhamento de dados
									com terceiros.
								</li>
								<li>
									<strong>Revogação do consentimento</strong> a qualquer
									momento.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								4. Como Exercer Seus Direitos
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Para exercer qualquer um dos direitos acima, envie uma
								solicitação para{" "}
								<a
									href="mailto:dpo@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									dpo@vendinhas.app
								</a>
								. Responderemos em até <strong>15 dias úteis</strong>, conforme
								previsto na legislação.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								5. Segurança dos Dados
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Adotamos medidas técnicas e administrativas para proteger seus
								dados pessoais, incluindo <strong>criptografia</strong>,{" "}
								<strong>controle de acesso</strong>,{" "}
								<strong>monitoramento de logs</strong> e{" "}
								<strong>backups regulares</strong>. Em caso de incidente de
								segurança que possa acarretar risco ou dano relevante, a{" "}
								<strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>{" "}
								e os titulares afetados serão comunicados.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								6. Contato
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Para dúvidas sobre a LGPD e o tratamento de seus dados pessoais,
								entre em contato com nosso encarregado (DPO) em{" "}
								<a
									href="mailto:dpo@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									dpo@vendinhas.app
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
