"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const channels = [
	{
		icon: Mail,
		title: "Email",
		description: "Envie sua mensagem e responderemos em até 24 horas úteis.",
		value: "suporte@vendinhas.app",
		href: "mailto:suporte@vendinhas.app",
		color: "bg-primary-100 dark:bg-primary-900/30",
		iconColor: "text-primary-600 dark:text-primary-400",
	},
	{
		icon: MessageCircle,
		title: "WhatsApp",
		description: "Atendimento rápido para dúvidas simples e suporte.",
		value: "(21) 99999-0000",
		href: "https://wa.me/5521999990000",
		color: "bg-green-100 dark:bg-green-900/30",
		iconColor: "text-green-600 dark:text-green-400",
	},
	{
		icon: Clock,
		title: "Horário de Atendimento",
		description: "Segunda a sexta, das 9h às 18h (horário de Brasília).",
		value: "Seg-Sex, 9h-18h",
		color: "bg-amber-100 dark:bg-amber-900/30",
		iconColor: "text-amber-600 dark:text-amber-400",
	},
	{
		icon: MapPin,
		title: "Localização",
		description: "Somos uma empresa 100% brasileira.",
		value: "Rio de Janeiro, RJ — Brasil",
		color: "bg-secondary-100 dark:bg-secondary-900/30",
		iconColor: "text-secondary-600 dark:text-secondary-400",
	},
];

export default function ContactPage() {
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
								<Mail className="w-7 h-7 text-primary-600 dark:text-primary-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Contato
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Fale conosco — estamos aqui para ajudar
								</p>
							</div>
						</div>

						<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
							Tem alguma dúvida, sugestão ou precisa de ajuda? Entre em contato
							por um dos nossos canais abaixo. Será um prazer atendê-lo!
						</p>

						<div className="grid sm:grid-cols-2 gap-4">
							{channels.map((channel) => (
								<div
									key={channel.title}
									className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50"
								>
									<div
										className={`w-12 h-12 ${channel.color} rounded-xl flex items-center justify-center mb-4`}
									>
										<channel.icon className={`w-6 h-6 ${channel.iconColor}`} />
									</div>
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
										{channel.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
										{channel.description}
									</p>
									{channel.href ? (
										<a
											href={channel.href}
											target={
												channel.href.startsWith("http") ? "_blank" : undefined
											}
											rel={
												channel.href.startsWith("http")
													? "noopener noreferrer"
													: undefined
											}
											className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
										>
											{channel.value}
										</a>
									) : (
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{channel.value}
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
