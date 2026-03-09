"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	Heart,
	Lightbulb,
	Rocket,
	ShieldCheck,
	Target,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

const values = [
	{
		icon: Lightbulb,
		title: "Inovação",
		description:
			"Buscamos constantemente novas formas de simplificar a gestão de vendas com tecnologia de ponta.",
		color: "bg-yellow-100 dark:bg-yellow-900/30",
		iconColor: "text-yellow-600 dark:text-yellow-400",
	},
	{
		icon: Heart,
		title: "Empatia",
		description:
			"Entendemos os desafios do pequeno empreendedor porque nascemos dessa realidade.",
		color: "bg-red-100 dark:bg-red-900/30",
		iconColor: "text-red-600 dark:text-red-400",
	},
	{
		icon: ShieldCheck,
		title: "Confiança",
		description:
			"Seus dados e seu negócio estão seguros conosco. Transparência é nossa prioridade.",
		color: "bg-green-100 dark:bg-green-900/30",
		iconColor: "text-green-600 dark:text-green-400",
	},
	{
		icon: Target,
		title: "Simplicidade",
		description:
			"Tecnologia poderosa não precisa ser complicada. Facilitamos o complexo.",
		color: "bg-primary-100 dark:bg-primary-900/30",
		iconColor: "text-primary-600 dark:text-primary-400",
	},
];

export default function AboutPage() {
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
								<Rocket className="w-7 h-7 text-primary-600 dark:text-primary-400" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
									Sobre Nós
								</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Conheça a história do Vendinhas
								</p>
							</div>
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
								O <strong>Vendinhas</strong> nasceu da necessidade real de
								pequenos empreendedores brasileiros que precisavam de uma
								ferramenta <strong>simples, acessível e poderosa</strong> para
								gerenciar suas vendas, estoque e clientes — sem a complexidade
								dos sistemas tradicionais.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								Nossa Missão
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								<strong>Democratizar a gestão de vendas</strong> para micro e
								pequenos empreendedores, oferecendo tecnologia de ponta com
								inteligência artificial a um preço justo — ou até mesmo de
								graça.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								Nossa História
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								Tudo começou quando percebemos que a maioria dos consultores de
								cosméticos e pequenos vendedores ainda controlava tudo em{" "}
								<strong>cadernos e planilhas</strong>. Muitos sistemas
								disponíveis eram caros demais ou complexos demais para quem está
								começando.
							</p>
							<p className="text-gray-600 dark:text-gray-300">
								Decidimos criar algo diferente: uma plataforma que qualquer
								pessoa pudesse usar em <strong>menos de 2 minutos</strong>, com
								um plano gratuito generoso e recursos profissionais para quem
								quer crescer. Hoje, o Vendinhas ajuda centenas de empreendedores
								a venderem mais e melhor.
							</p>

							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-10 mb-6">
								Nossos Valores
							</h2>
						</div>

						<div className="grid sm:grid-cols-2 gap-4 mb-8">
							{values.map((value) => (
								<div
									key={value.title}
									className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50"
								>
									<div
										className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center shrink-0`}
									>
										<value.icon className={`w-6 h-6 ${value.iconColor}`} />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
											{value.title}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{value.description}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="prose prose-gray dark:prose-invert max-w-none">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
								<Users className="w-5 h-5 inline-block mr-2 mb-1" />
								Nosso Time
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Somos uma equipe enxuta e apaixonada por tecnologia e
								empreendedorismo. Cada funcionalidade do Vendinhas é pensada com
								carinho e baseada no feedback real dos nossos usuários.
								Acreditamos que{" "}
								<strong>
									grandes negócios começam com ferramentas simples
								</strong>
								.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
