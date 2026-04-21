"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
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
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
}

interface StoreSettings {
	slug: string | null;
	catalogUrl: string | null;
}

export default function CatalogSharePage() {
	const [copied, setCopied] = useState(false);
	const [copiedCustomerId, setCopiedCustomerId] = useState<string | null>(null);
	const [slug, setSlug] = useState<string | null>(null);
	const [catalogUrl, setCatalogUrl] = useState<string | null>(null);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const [storeRes, customersRes] = await Promise.all([
					api.get<StoreSettings>("/store/settings"),
					api.get("/customers"),
				]);

				setSlug(storeRes.data.slug);
				if (storeRes.data.slug) {
					const origin = window.location.origin;
					setCatalogUrl(`${origin}/loja/${storeRes.data.slug}`);
				}

				setCustomers(customersRes.data.data || customersRes.data);
			} catch (_error) {
				toast.error("Erro ao carregar dados");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone.includes(searchTerm),
	);

	const getCustomerLink = (customerId: string) => {
		if (!catalogUrl) return "";
		return `${catalogUrl}/c/${customerId}`;
	};

	const handleCopyCustomerLink = async (customerId: string) => {
		const link = getCustomerLink(customerId);
		if (!link) return;
		try {
			await navigator.clipboard.writeText(link);
			setCopiedCustomerId(customerId);
			toast.success("Link personalizado copiado!");
			setTimeout(() => setCopiedCustomerId(null), 2000);
		} catch {
			toast.error("Erro ao copiar link");
		}
	};

	const handleShareCustomerWhatsApp = (customer: Customer) => {
		const link = getCustomerLink(customer.id);
		if (!link) return;
		const text = encodeURIComponent(
			`Olá ${customer.name.split(" ")[0]}!\n\nPreparei um catálogo especial para você. Seus dados já estarão preenchidos no checkout:\n\n${link}\n\nQualquer dúvida é só me chamar!`,
		);
		window.open(`https://wa.me/${customer.phone}?text=${text}`, "_blank");
	};

	const handleCopy = async () => {
		if (!catalogUrl) return;
		try {
			await navigator.clipboard.writeText(catalogUrl);
			setCopied(true);
			toast.success("Link copiado!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Erro ao copiar link");
		}
	};

	const shareOptions = catalogUrl
		? [
				{
					name: "WhatsApp",
					icon: MessageCircle,
					color: "bg-green-500 hover:bg-green-600",
					action: () => {
						const text = encodeURIComponent(
							`Confira meu catálogo de produtos: ${catalogUrl}`,
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
							`Olá!\n\nConfira meu catálogo de produtos disponíveis para entrega:\n\n${catalogUrl}\n\nAtenciosamente`,
						);
						window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
					},
				},
			]
		: [];

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!slug) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Compartilhar Catálogo
					</h1>
				</div>

				<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 flex gap-4">
					<AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0" />
					<div className="space-y-3">
						<p className="text-gray-900 dark:text-white font-medium">
							Defina o slug da sua loja para habilitar o catálogo público.
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							O slug é usado na URL do catálogo que você compartilha com seus
							clientes — algo como{" "}
							<code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
								/loja/minha-loja
							</code>
							.
						</p>
						<Link
							href="/settings"
							className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium"
						>
							Ir para Configurações → Loja
						</Link>
					</div>
				</div>
			</div>
		);
	}

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
						<div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
							<LinkIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
							value={catalogUrl ?? ""}
							readOnly
							className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm"
						/>
						<button
							type="button"
							onClick={handleCopy}
							className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
								copied
									? "bg-green-500 text-white"
									: "bg-primary-600 hover:bg-primary-700 text-white"
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

					{catalogUrl && (
						<div className="mt-4">
							<a
								href={catalogUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline text-sm"
							>
								<ExternalLink className="w-4 h-4" />
								Abrir catálogo em nova aba
							</a>
						</div>
					)}
				</motion.div>

				{/* Share Options */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
				>
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
							<Share2 className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
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
						className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
				</div>

				<div className="space-y-3 max-h-96 overflow-y-auto">
					{filteredCustomers.length === 0 ? (
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
								className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
										<User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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
										className={`p-2 rounded-lg transition-colors ${
											copiedCustomerId === customer.id
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
										className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
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
				className="bg-linear-to-r from-primary-500 to-secondary-600 rounded-xl p-6 text-white"
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
