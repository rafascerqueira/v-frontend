"use client";

import { motion } from "framer-motion";
import {
	Check,
	Copy,
	ExternalLink,
	Link as LinkIcon,
	Mail,
	MessageCircle,
	Search,
	Share2,
	Smartphone,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
}

export default function CatalogSharePage() {
	const [copied, setCopied] = useState(false);
	const [copiedCustomerId, setCopiedCustomerId] = useState<string | null>(null);
	const [catalogUrl, setCatalogUrl] = useState("");
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const baseUrl = window.location.origin;
		setCatalogUrl(`${baseUrl}/catalog`);

		async function loadCustomers() {
			try {
				const response = await api.get("/customers");
				setCustomers(response.data.data || response.data);
			} catch (_error) {
				toast.error("Erro ao carregar clientes");
			} finally {
				setLoading(false);
			}
		}
		loadCustomers();
	}, []);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone.includes(searchTerm),
	);

	const getCustomerLink = (customerId: string) => {
		return `${catalogUrl}/${customerId}`;
	};

	const handleCopyCustomerLink = async (customerId: string) => {
		try {
			await navigator.clipboard.writeText(getCustomerLink(customerId));
			setCopiedCustomerId(customerId);
			toast.success("Link personalizado copiado!");
			setTimeout(() => setCopiedCustomerId(null), 2000);
		} catch {
			toast.error("Erro ao copiar link");
		}
	};

	const handleShareCustomerWhatsApp = (customer: Customer) => {
		const link = getCustomerLink(customer.id);
		const text = encodeURIComponent(
			`Olá ${customer.name.split(" ")[0]}!\n\nPreparei um catálogo especial para você. Seus dados já estarão preenchidos no checkout:\n\n${link}\n\nQualquer dúvida é só me chamar!`,
		);
		window.open(`https://wa.me/${customer.phone}?text=${text}`, "_blank");
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(catalogUrl);
			setCopied(true);
			toast.success("Link copiado!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Erro ao copiar link");
		}
	};

	const shareOptions = [
		{
			name: "WhatsApp",
			icon: MessageCircle,
			color: "bg-green-500 hover:bg-green-600",
			action: () => {
				const text = encodeURIComponent(
					`Confira nosso catálogo de produtos: ${catalogUrl}`,
				);
				window.open(`https://wa.me/?text=${text}`, "_blank");
			},
		},
		{
			name: "Email",
			icon: Mail,
			color: "bg-blue-500 hover:bg-blue-600",
			action: () => {
				const subject = encodeURIComponent("Catálogo de Produtos");
				const body = encodeURIComponent(
					`Olá!\n\nConfira nosso catálogo de produtos disponíveis para entrega:\n\n${catalogUrl}\n\nAtenciosamente,\nVendinhas`,
				);
				window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
			},
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Compartilhar Catálogo
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-1">
					Compartilhe o link do catálogo com seus clientes para que possam fazer
					pedidos online.
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Link Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
							<LinkIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 dark:text-white">
								Link do Catálogo
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Copie e compartilhe com seus clientes
							</p>
						</div>
					</div>

					<div className="flex gap-2">
						<input
							type="text"
							value={catalogUrl}
							readOnly
							className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm"
						/>
						<button
							type="button"
							onClick={handleCopy}
							className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${copied
									? "bg-green-500 text-white"
									: "bg-indigo-600 hover:bg-indigo-700 text-white"
								}`}
						>
							{copied ? (
								<>
									<Check className="w-5 h-5" />
									Copiado
								</>
							) : (
								<>
									<Copy className="w-5 h-5" />
									Copiar
								</>
							)}
						</button>
					</div>

					<div className="mt-4">
						<a
							href={catalogUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
						>
							<ExternalLink className="w-4 h-4" />
							Abrir catálogo em nova aba
						</a>
					</div>
				</motion.div>

				{/* Share Options */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
							<Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 dark:text-white">
								Compartilhar via
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Envie diretamente para seus clientes
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{shareOptions.map((option) => (
							<button
								key={option.name}
								type="button"
								onClick={option.action}
								className={`${option.color} text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
							>
								<option.icon className="w-5 h-5" />
								{option.name}
							</button>
						))}
					</div>
				</motion.div>

				{/* Preview */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
							<Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 dark:text-white">
								Preview do Catálogo
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Veja como seus clientes visualizarão o catálogo
							</p>
						</div>
					</div>

					<div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
						<div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center gap-2">
							<div className="flex gap-1.5">
								<div className="w-3 h-3 rounded-full bg-red-500" />
								<div className="w-3 h-3 rounded-full bg-yellow-500" />
								<div className="w-3 h-3 rounded-full bg-green-500" />
							</div>
							<div className="flex-1 mx-4">
								<div className="bg-white dark:bg-gray-600 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-300 truncate">
									{catalogUrl}
								</div>
							</div>
						</div>
						{catalogUrl && (
							<iframe
								src={catalogUrl}
								className="w-full h-[500px] border-0"
								title="Catalog Preview"
							/>
						)}
					</div>
				</motion.div>
			</div>

			{/* Personalized Links */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
			>
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
							<Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 dark:text-white">
								Links Personalizados por Cliente
							</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Gere links exclusivos com dados pré-preenchidos
							</p>
						</div>
					</div>
				</div>

				<div className="mb-4 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar cliente por nome, email ou telefone..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					/>
				</div>

				<div className="space-y-3 max-h-96 overflow-y-auto">
					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
							<p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
								Carregando clientes...
							</p>
						</div>
					) : filteredCustomers.length === 0 ? (
						<div className="text-center py-8">
							<User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
							<p className="text-gray-500 dark:text-gray-400">
								{searchTerm
									? "Nenhum cliente encontrado"
									: "Nenhum cliente cadastrado"}
							</p>
						</div>
					) : (
						filteredCustomers.slice(0, 10).map((customer) => (
							<div
								key={customer.id}
								className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0">
										<User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
									</div>
									<div className="min-w-0">
										<p className="font-medium text-gray-900 dark:text-white truncate">
											{customer.name}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400 truncate">
											{customer.email}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onClick={() => handleCopyCustomerLink(customer.id)}
										className={`p-2 rounded-lg transition-colors ${copiedCustomerId === customer.id
												? "bg-green-500 text-white"
												: "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
											}`}
										title="Copiar link personalizado"
									>
										{copiedCustomerId === customer.id ? (
											<Check className="w-4 h-4" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</button>
									<button
										type="button"
										onClick={() => handleShareCustomerWhatsApp(customer)}
										className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
										title="Enviar via WhatsApp"
									>
										<MessageCircle className="w-4 h-4" />
									</button>
									<a
										href={getCustomerLink(customer.id)}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
										title="Abrir catálogo personalizado"
									>
										<ExternalLink className="w-4 h-4" />
									</a>
								</div>
							</div>
						))
					)}
					{filteredCustomers.length > 10 && (
						<p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
							Mostrando 10 de {filteredCustomers.length} clientes. Use a busca
							para encontrar mais.
						</p>
					)}
				</div>
			</motion.div>

			{/* Instructions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
			>
				<h3 className="font-semibold text-lg mb-4">Como funciona?</h3>
				<div className="grid md:grid-cols-3 gap-6">
					<div className="flex gap-3">
						<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">
							1
						</div>
						<div>
							<p className="font-medium">Compartilhe o link</p>
							<p className="text-sm text-white/80">
								Envie o link do catálogo para seus clientes via WhatsApp, email
								ou redes sociais.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">
							2
						</div>
						<div>
							<p className="font-medium">Cliente faz o pedido</p>
							<p className="text-sm text-white/80">
								O cliente navega pelo catálogo, adiciona produtos ao carrinho e
								finaliza o pedido.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">
							3
						</div>
						<div>
							<p className="font-medium">Você recebe o pedido</p>
							<p className="text-sm text-white/80">
								O pedido aparece na sua lista de pedidos. Confirme, gere a
								fatura e faça a entrega.
							</p>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
