import { Trash2 } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function DataDeletionPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<div className="animate-fade-in-up">
					<BackButton />

					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 md:p-12">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
								<Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Exclusão de Dados
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Como solicitar a anonimização da sua conta
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								No <strong>Vendinhas.app</strong>, respeitamos seu direito de
								controlar seus dados pessoais. Esta página explica como você
								pode solicitar a <strong>exclusão</strong> ou{" "}
								<strong>anonimização</strong> da sua conta, em conformidade com
								a <strong>LGPD</strong> (Lei Geral de Proteção de Dados) e os
								requisitos das plataformas de login social que utilizamos
								(Google e Facebook).
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								1. O que acontece quando você exclui sua conta
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Ao confirmar a exclusão, executamos um processo de{" "}
								<strong>anonimização</strong> dos seus dados pessoais:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
								<li>
									Seu <strong>nome</strong> e <strong>e-mail</strong> são
									substituídos por valores anônimos.
								</li>
								<li>
									Suas <strong>credenciais de login</strong> (senha e vínculos
									com Google/Facebook) são removidas. A conta deixa de poder ser
									acessada.
								</li>
								<li>
									Histórico operacional vinculado a obrigações fiscais (ex:
									notas, vendas) pode ser <strong>retido</strong> em formato
									anônimo conforme exigido por lei.
								</li>
								<li>
									<strong>Backups</strong> podem manter dados por até{" "}
									<strong>90 dias</strong> antes de serem rotacionados.
								</li>
							</ul>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								2. Como solicitar a exclusão
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Você tem duas formas de solicitar a anonimização da sua conta:
							</p>

							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
								Opção A — Pelo aplicativo (recomendado)
							</h3>
							<ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
								<li>
									Faça login em{" "}
									<a
										href="https://vendinhas.app/login"
										className="text-primary-600 dark:text-primary-400 hover:underline"
									>
										vendinhas.app/login
									</a>
									.
								</li>
								<li>
									Acesse <strong>Configurações</strong> → <strong>Conta</strong>{" "}
									→ <strong>Excluir minha conta</strong>.
								</li>
								<li>
									Confirme a senha atual e digite{" "}
									<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
										DELETAR MINHA CONTA
									</code>{" "}
									para confirmar.
								</li>
								<li>
									O processo é executado imediatamente e não pode ser desfeito.
								</li>
							</ol>

							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
								Opção B — Por e-mail
							</h3>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Caso não consiga acessar a conta (ex: perdeu acesso ao e-mail ou
								à conta do Facebook/Google que usou para entrar), envie uma
								solicitação para{" "}
								<a
									href="mailto:privacidade@vendinhas.app"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									privacidade@vendinhas.app
								</a>{" "}
								informando:
							</p>
							<ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
								<li>
									O <strong>e-mail</strong> usado no cadastro.
								</li>
								<li>
									Se aplicável, o <strong>provedor</strong> usado no login
									social (Google ou Facebook).
								</li>
								<li>
									Documento que comprove a titularidade da conta (apenas se
									necessário para validar a solicitação).
								</li>
							</ul>
							<p className="text-gray-600 dark:text-gray-300 mt-4">
								Responderemos em até <strong>30 dias</strong>, conforme a{" "}
								<strong>LGPD</strong>.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								3. Login com Facebook
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Se você se cadastrou usando o{" "}
								<strong>Login com Facebook</strong> e quer apenas remover a
								permissão concedida ao Vendinhas no Facebook (sem excluir sua
								conta no Vendinhas), acesse{" "}
								<a
									href="https://www.facebook.com/settings?tab=applications"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-600 dark:text-primary-400 hover:underline"
								>
									Facebook → Configurações → Aplicativos e Sites
								</a>
								, localize <strong>Vendinhas</strong> e remova o aplicativo.
								Para excluir os dados que armazenamos sobre você, use uma das
								opções da seção 2 acima.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								4. Contato
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Dúvidas sobre privacidade ou exclusão de dados:{" "}
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
				</div>
			</div>
		</div>
	);
}
