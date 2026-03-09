"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Code, Key, Lock, Server, Webhook } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const endpoints = [
	{
		method: "GET",
		path: "/products",
		description: "Listar todos os produtos",
	},
	{
		method: "POST",
		path: "/orders",
		description: "Criar novo pedido",
	},
	{
		method: "GET",
		path: "/customers",
		description: "Listar clientes",
	},
	{
		method: "GET",
		path: "/reports/sales",
		description: "Relatório de vendas",
	},
	{
		method: "GET",
		path: "/stock",
		description: "Consultar estoque",
	},
];

const methodColors: Record<string, string> = {
	GET: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function APIPage() {
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
							<div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
								<Code className="w-7 h-7 text-orange-600 dark:text-orange-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									API
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Integre o Vendinhas ao seu sistema
								</p>
							</div>
						</div>

						<div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 mb-8">
							<p className="text-orange-700 dark:text-orange-300 font-medium text-center">
								🚧 A API pública do Vendinhas está em desenvolvimento e será
								disponibilizada no plano Empresarial. Abaixo está uma prévia dos
								endpoints planejados.
							</p>
						</div>

						<div className="grid sm:grid-cols-3 gap-4 mb-8">
							<div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
								<Server className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
								<h3 className="font-medium text-gray-900 dark:text-white text-sm">
									REST API
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									JSON over HTTPS
								</p>
							</div>
							<div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
								<Lock className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
								<h3 className="font-medium text-gray-900 dark:text-white text-sm">
									OAuth 2.0
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Autenticação segura
								</p>
							</div>
							<div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
								<Webhook className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
								<h3 className="font-medium text-gray-900 dark:text-white text-sm">
									Webhooks
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Eventos em tempo real
								</p>
							</div>
						</div>

						<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
							Endpoints Planejados
						</h2>

						<div className="space-y-2 mb-8">
							{endpoints.map((endpoint) => (
								<div
									key={`${endpoint.method}-${endpoint.path}`}
									className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm"
								>
									<span
										className={`px-2 py-0.5 rounded text-xs font-bold ${methodColors[endpoint.method]}`}
									>
										{endpoint.method}
									</span>
									<span className="text-gray-900 dark:text-white">
										{endpoint.path}
									</span>
									<span className="text-gray-400 dark:text-gray-500 font-sans text-xs ml-auto hidden sm:block">
										{endpoint.description}
									</span>
								</div>
							))}
						</div>

						<div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center">
							<Key className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
							<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
								Quer acesso antecipado à API?
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
								Registre seu interesse e avisaremos quando a API estiver
								disponível.
							</p>
							<a
								href="mailto:api@vendinhas.app"
								className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
							>
								Registrar Interesse
							</a>
						</div>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Veja a{" "}
								<Link
									href="/docs"
									className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
								>
									documentação completa
								</Link>{" "}
								para mais informações.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
