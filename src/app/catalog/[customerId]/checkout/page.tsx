"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	CheckCircle,
	CreditCard,
	Loader2,
	MapPin,
	Package,
	ShoppingCart,
	Store,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { type CatalogCustomer, catalogApi } from "@/lib/api-public";
import { validateCNPJ, validateCPF } from "@/lib/validators";

const checkoutSchema = z.object({
	name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
	email: z.string().email("Email inválido"),
	phone: z.string().min(10, "Telefone inválido"),
	document: z.string().refine(
		(val) => {
			const clean = val.replace(/\D/g, "");
			return clean.length === 11
				? validateCPF(clean)
				: clean.length === 14
					? validateCNPJ(clean)
					: false;
		},
		{ message: "CPF/CNPJ inválido" },
	),
	address: z.string().min(3, "Endereço é obrigatório"),
	number: z.string().min(1, "Número é obrigatório"),
	complement: z.string().optional(),
	neighborhood: z.string().min(2, "Bairro é obrigatório"),
	city: z.string().min(2, "Cidade é obrigatória"),
	state: z.string().length(2, "Estado deve ter 2 caracteres"),
	zip_code: z.string().min(8, "CEP inválido"),
	notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

function formatPhone(value: string) {
	const clean = value.replace(/\D/g, "");
	if (clean.length <= 10) {
		return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function formatDocument(value: string) {
	const clean = value.replace(/\D/g, "");
	if (clean.length <= 11) {
		return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}
	return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatZipCode(value: string) {
	return value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
}

export default function PersonalizedCheckoutPage() {
	const params = useParams();
	const customerId = params.customerId as string;
	const { items, total, clearCart, itemCount, customer } = useCart();
	const [loading, setLoading] = useState(false);
	const [orderComplete, setOrderComplete] = useState(false);
	const [orderNumber, setOrderNumber] = useState("");

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<CheckoutForm>({
		resolver: zodResolver(checkoutSchema),
	});

	const phone = watch("phone");
	const document = watch("document");
	const zipCode = watch("zip_code");

	// Pre-fill form with customer data
	useEffect(() => {
		if (customer) {
			reset({
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				document: customer.document,
				address: customer.address,
				number: customer.number,
				complement: customer.complement || "",
				neighborhood: customer.neighborhood,
				city: customer.city,
				state: customer.state,
				zip_code: customer.zip_code,
			});
		}
	}, [customer, reset]);

	const onSubmit = async (data: CheckoutForm) => {
		if (items.length === 0) {
			toast.error("Adicione produtos ao carrinho");
			return;
		}

		setLoading(true);
		try {
			const customerData: CatalogCustomer = {
				name: data.name,
				email: data.email,
				phone: data.phone.replace(/\D/g, ""),
				document: data.document.replace(/\D/g, ""),
				address: data.address,
				number: data.number,
				complement: data.complement,
				neighborhood: data.neighborhood,
				city: data.city,
				state: data.state.toUpperCase(),
				zip_code: data.zip_code.replace(/\D/g, ""),
			};

			const response = await catalogApi.createOrder({
				customer: customerData,
				items: items.map((item) => ({
					product_id: item.product.id,
					quantity: item.quantity,
				})),
				notes: data.notes,
			});

			setOrderNumber(response.data.order_number);
			setOrderComplete(true);
			clearCart();
			toast.success("Pedido realizado com sucesso!");
		} catch (error: unknown) {
			const axiosError = error as {
				response?: { data?: { message?: string } };
			};
			const message =
				axiosError.response?.data?.message || "Erro ao criar pedido";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	if (orderComplete) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
				>
					<div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-10 h-10 text-green-600" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						Pedido Realizado!
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mb-4">
						Seu pedido foi registrado com sucesso. Em breve entraremos em
						contato para confirmar os detalhes.
					</p>
					<div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Número do pedido
						</p>
						<p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
							{orderNumber}
						</p>
					</div>
					<Link
						href={`/catalog/${customerId}`}
						className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
					>
						<Store className="w-5 h-5" />
						Continuar Comprando
					</Link>
				</motion.div>
			</div>
		);
	}

	if (itemCount === 0) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
				<div className="text-center">
					<ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
					<h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
						Carrinho Vazio
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mb-6">
						Adicione produtos ao carrinho para finalizar o pedido.
					</p>
					<Link
						href={`/catalog/${customerId}`}
						className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Ver Catálogo
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<header className="bg-white dark:bg-gray-800 shadow-sm">
				<div className="max-w-5xl mx-auto px-4 py-4">
					<div className="flex items-center gap-4">
						<Link
							href={`/catalog/${customerId}`}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
						</Link>
						<div className="flex-1">
							<h1 className="font-bold text-xl text-gray-900 dark:text-white">
								Finalizar Pedido
							</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
							</p>
						</div>
						{customer && (
							<div className="hidden sm:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
								<User className="w-4 h-4 text-green-600 dark:text-green-400" />
								<span className="text-sm font-medium text-green-700 dark:text-green-300">
									{customer.firstName}
								</span>
							</div>
						)}
					</div>
				</div>
			</header>

			<main className="max-w-5xl mx-auto px-4 py-6">
				{customer && (
					<div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
						<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
						<div>
							<p className="font-medium text-green-800 dark:text-green-200">
								Seus dados foram preenchidos automaticamente
							</p>
							<p className="text-sm text-green-600 dark:text-green-400">
								Você pode revisar e editar antes de confirmar o pedido.
							</p>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid lg:grid-cols-3 gap-6">
						{/* Form */}
						<div className="lg:col-span-2 space-y-6">
							{/* Personal Info */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<div className="flex items-center gap-2 mb-4">
									<User className="w-5 h-5 text-indigo-600" />
									<h2 className="font-semibold text-gray-900 dark:text-white">
										Dados Pessoais
									</h2>
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Nome completo *
										</label>
										<input
											{...register("name")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.name && (
											<p className="text-red-500 text-sm mt-1">
												{errors.name.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Email *
										</label>
										<input
											type="email"
											{...register("email")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.email && (
											<p className="text-red-500 text-sm mt-1">
												{errors.email.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Telefone *
										</label>
										<input
											{...register("phone")}
											value={phone ? formatPhone(phone) : ""}
											onChange={(e) =>
												setValue("phone", e.target.value.replace(/\D/g, ""))
											}
											maxLength={15}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.phone && (
											<p className="text-red-500 text-sm mt-1">
												{errors.phone.message}
											</p>
										)}
									</div>
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											CPF/CNPJ *
										</label>
										<input
											{...register("document")}
											value={document ? formatDocument(document) : ""}
											onChange={(e) =>
												setValue("document", e.target.value.replace(/\D/g, ""))
											}
											maxLength={18}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.document && (
											<p className="text-red-500 text-sm mt-1">
												{errors.document.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Address */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="w-5 h-5 text-indigo-600" />
									<h2 className="font-semibold text-gray-900 dark:text-white">
										Endereço de Entrega
									</h2>
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											CEP *
										</label>
										<input
											{...register("zip_code")}
											value={zipCode ? formatZipCode(zipCode) : ""}
											onChange={(e) =>
												setValue("zip_code", e.target.value.replace(/\D/g, ""))
											}
											maxLength={9}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.zip_code && (
											<p className="text-red-500 text-sm mt-1">
												{errors.zip_code.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Estado *
										</label>
										<input
											{...register("state")}
											maxLength={2}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
										/>
										{errors.state && (
											<p className="text-red-500 text-sm mt-1">
												{errors.state.message}
											</p>
										)}
									</div>
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Cidade *
										</label>
										<input
											{...register("city")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.city && (
											<p className="text-red-500 text-sm mt-1">
												{errors.city.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Bairro *
										</label>
										<input
											{...register("neighborhood")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.neighborhood && (
											<p className="text-red-500 text-sm mt-1">
												{errors.neighborhood.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Endereço *
										</label>
										<input
											{...register("address")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.address && (
											<p className="text-red-500 text-sm mt-1">
												{errors.address.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Número *
										</label>
										<input
											{...register("number")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
										{errors.number && (
											<p className="text-red-500 text-sm mt-1">
												{errors.number.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Complemento
										</label>
										<input
											{...register("complement")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
									</div>
								</div>
							</div>

							{/* Notes */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<div className="flex items-center gap-2 mb-4">
									<CreditCard className="w-5 h-5 text-indigo-600" />
									<h2 className="font-semibold text-gray-900 dark:text-white">
										Observações
									</h2>
								</div>
								<textarea
									{...register("notes")}
									rows={3}
									placeholder="Instruções especiais para entrega, horário preferido, etc..."
									className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
								/>
							</div>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-24">
								<div className="flex items-center gap-2 mb-4">
									<ShoppingCart className="w-5 h-5 text-indigo-600" />
									<h2 className="font-semibold text-gray-900 dark:text-white">
										Resumo do Pedido
									</h2>
								</div>

								<div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
									{items.map((item) => (
										<div
											key={item.product.id}
											className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
										>
											<div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
												{item.product.images?.[0] ? (
													<img
														src={item.product.images[0]}
														alt={item.product.name}
														className="w-full h-full object-cover rounded-lg"
													/>
												) : (
													<Package className="w-6 h-6 text-gray-400" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900 dark:text-white truncate">
													{item.product.name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{item.quantity}x {formatCurrency(item.product.price)}
												</p>
											</div>
											<p className="text-sm font-medium text-gray-900 dark:text-white">
												{formatCurrency(item.product.price * item.quantity)}
											</p>
										</div>
									))}
								</div>

								<div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											Subtotal
										</span>
										<span className="text-gray-900 dark:text-white">
											{formatCurrency(total)}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">
											Frete
										</span>
										<span className="text-green-600">A combinar</span>
									</div>
									<div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
										<span className="text-gray-900 dark:text-white">Total</span>
										<span className="text-indigo-600 dark:text-indigo-400">
											{formatCurrency(total)}
										</span>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
								>
									{loading ? (
										<>
											<Loader2 className="w-5 h-5 animate-spin" />
											Processando...
										</>
									) : (
										<>
											<CheckCircle className="w-5 h-5" />
											Confirmar Pedido
										</>
									)}
								</button>

								<p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
									Ao confirmar, você concorda com nossos termos de serviço.
									Entraremos em contato para confirmar o pedido e agendar a
									entrega.
								</p>
							</div>
						</div>
					</div>
				</form>
			</main>
		</div>
	);
}
