"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
						className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Voltar
					</button>

					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
								<Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Política de Privacidade
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Última atualização: 25 de janeiro de 2026
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								No <strong>Vendinhas.app</strong>, valorizamos sua{" "}
								<strong>privacidade</strong> e estamos comprometidos em proteger
								seus <strong>dados pessoais</strong>. Esta{" "}
								<strong>Política de Privacidade</strong> explica como{" "}
								<strong>coletamos</strong>, <strong>usamos</strong>,{" "}
								<strong>compartilhamos</strong> e <strong>protegemos</strong>{" "}
								suas informações ao usar nosso aplicativo web para gerenciamento
								de vendas e estoque. Ao usar o <strong>Vendinhas.app</strong>,
								você consente com as práticas descritas aqui.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								1. Informações que Coletamos
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Coletamos os seguintes tipos de informações:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-3 mb-4">
								<li>
									<strong>Informações de Registro</strong>: Nome, e-mail,
									endereço, dados de pagamento e detalhes de contato ao criar
									uma conta.
								</li>
								<li>
									<strong>Dados de Uso</strong>: Informações sobre seu estoque,
									pedidos de fornecedores, pedidos de clientes, vendas e custos
									operacionais que você insere no app.
								</li>
								<li>
									<strong>Dados Automáticos</strong>: Endereço IP, tipo de
									navegador, dados de acesso, <strong>cookies</strong> e logs de
									uso para melhorar o serviço.
								</li>
								<li>
									<strong>Dados de Terceiros</strong>: Se você integrar com
									fornecedores ou serviços externos, podemos coletar dados
									relacionados.
								</li>
							</ul>
							<p className="text-gray-600 dark:text-gray-300">
								<strong>Não coletamos dados sensíveis</strong>, como informações
								de saúde ou financeiras além do necessário para o funcionamento
								do app.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								2. Como Usamos Suas Informações
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Usamos seus dados para:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
								<li>
									Fornecer e melhorar o <strong>Vendinhas.app</strong>,
									incluindo verificação de estoque, cadastro de pedidos e
									relatórios de vendas.
								</li>
								<li>
									Enviar <strong>notificações</strong> sobre atualizações,
									pedidos ou alertas de estoque.
								</li>
								<li>
									Analisar o uso para otimizar a plataforma (ex:{" "}
									<strong>estatísticas anônimas</strong>).
								</li>
								<li>
									Cumprir <strong>obrigações legais</strong>, como relatórios
									fiscais.
								</li>
								<li>
									Prevenir <strong>fraudes</strong> e garantir a{" "}
									<strong>segurança</strong>.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								3. Compartilhamento de Informações
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								<strong>Não vendemos seus dados</strong>. Podemos compartilhar
								informações com:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
								<li>
									<strong>Fornecedores de serviços</strong> (ex: hospedagem ou
									processamento de pagamentos) sob{" "}
									<strong>contratos de confidencialidade</strong>.
								</li>
								<li>
									<strong>Autoridades legais</strong> se exigido por lei ou para
									proteger nossos direitos.
								</li>
								<li>
									Em caso de <strong>fusão ou aquisição</strong>, com o
									comprador.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								4. Armazenamento e Segurança
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Seus dados são armazenados em{" "}
								<strong>servidores seguros</strong> usando{" "}
								<strong>PostgreSQL</strong> e infraestrutura{" "}
								<strong>Docker</strong>. Implementamos medidas de segurança,
								como <strong>criptografia</strong> e{" "}
								<strong>controles de acesso</strong>, para proteger contra
								acessos não autorizados. No entanto,{" "}
								<strong>nenhum sistema é 100% seguro</strong>, e não podemos
								garantir proteção absoluta.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								5. Seus Direitos
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Você pode:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
								<li>
									<strong>Acessar</strong>, <strong>corrigir</strong> ou{" "}
									<strong>excluir</strong> seus dados pessoais via configurações
									da conta.
								</li>
								<li>
									Solicitar a <strong>portabilidade de dados</strong>.
								</li>
								<li>
									<strong>Optar por não receber</strong> comunicações
									promocionais.
								</li>
							</ul>
							<p className="text-gray-600 dark:text-gray-300">
								Para exercer esses direitos, contate-nos em{" "}
								<a
									href="mailto:privacidade@vendinhas.app"
									className="text-indigo-600 dark:text-indigo-400 hover:underline"
								>
									privacidade@vendinhas.app
								</a>
								. Responderemos em até <strong>30 dias</strong>, conforme a{" "}
								<strong>LGPD</strong> (Lei Geral de Proteção de Dados Pessoais)
								no Brasil.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								6. Cookies e Tecnologias Semelhantes
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Usamos <strong>cookies</strong> para melhorar a experiência (ex:
								lembrar login). Você pode gerenciar cookies nas configurações do
								navegador, mas isso pode afetar funcionalidades.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								7. Retenção de Dados
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Retemos dados enquanto sua conta estiver <strong>ativa</strong>{" "}
								ou conforme necessário para fins legais. Após exclusão, podemos
								reter <strong>backups</strong> por até <strong>90 dias</strong>.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								8. Privacidade de Crianças
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								O <strong>Vendinhas.app</strong> não é destinado a{" "}
								<strong>menores de 18 anos</strong>. Não coletamos
								intencionalmente dados de crianças.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								9. Alterações na Política
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Podemos atualizar esta Política periodicamente. Notificaremos
								você sobre mudanças significativas via <strong>e-mail</strong>{" "}
								ou no app. O uso continuado constitui <strong>aceitação</strong>
								.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								10. Contato
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Para dúvidas ou reclamações sobre privacidade, entre em contato
								em{" "}
								<a
									href="mailto:privacidade@vendinhas.app"
									className="text-indigo-600 dark:text-indigo-400 hover:underline"
								>
									privacidade@vendinhas.app
								</a>
								. Somos o <strong>controlador de dados</strong> sob a{" "}
								<strong>LGPD</strong>.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
