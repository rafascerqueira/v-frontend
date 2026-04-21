"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	CheckCircle,
	ClipboardList,
	Loader2,
	Lock,
	LogIn,
	MapPin,
	Package,
	Search,
	ShoppingCart,
	Store,
	User,
	UserCheck,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import {
	type AuthenticatedCustomer,
	type CatalogCustomer,
	catalogApi,
} from "@/lib/api-public";
import { validateCNPJ, validateCPF } from "@/lib/validators";

// ─── Schemas ────────────────────────────────────────────────────────────────

const lookupSchema = z.object({
	contact: z.string().min(5, "Informe seu email ou telefone"),
});

const passwordSchema = z.object({
	password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const newPasswordSchema = z
	.object({
		password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Senhas não conferem",
		path: ["confirmPassword"],
	});

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

type LookupForm = z.infer<typeof lookupSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type NewPasswordForm = z.infer<typeof newPasswordSchema>;
type CheckoutForm = z.infer<typeof checkoutSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

function formatPhone(value: string) {
	const clean = value.replace(/\D/g, "");
	if (clean.length <= 10)
		return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function formatDocument(value: string) {
	const clean = value.replace(/\D/g, "");
	if (clean.length <= 11)
		return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatZipCode(value: string) {
	return value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
}

// ─── Step types ─────────────────────────────────────────────────────────────

type Step =
	| "lookup"
	| "confirm-identity"
	| "enter-password"
	| "set-password"
	| "form"
	| "success";

// ─── Main page ───────────────────────────────────────────────────────────────

export default function StoreCheckoutPage() {
	const params = useParams();
	const slug = params.slug as string;
	const {
		items,
		total,
		clearCart,
		itemCount,
		authenticatedCustomer,
		setAuthenticatedCustomer,
	} = useCart();

	const [step, setStep] = useState<Step>(
		authenticatedCustomer ? "form" : "lookup",
	);
	const [contactValue, setContactValue] = useState("");
	const [foundFirstName, setFoundFirstName] = useState("");
	const [hasPassword, setHasPassword] = useState(false);
	const [lookupLoading, setLookupLoading] = useState(false);
	const [authLoading, setAuthLoading] = useState(false);
	const [orderNumber, setOrderNumber] = useState("");
	const [submitLoading, setSubmitLoading] = useState(false);

	// ─── Forms ──────────────────────────────────────────────────────────────

	const lookupForm = useForm<LookupForm>({
		resolver: zodResolver(lookupSchema),
	});

	const passwordForm = useForm<PasswordForm>({
		resolver: zodResolver(passwordSchema),
	});

	const newPasswordForm = useForm<NewPasswordForm>({
		resolver: zodResolver(newPasswordSchema),
	});

	const checkoutForm = useForm<CheckoutForm>({
		resolver: zodResolver(checkoutSchema),
	});

	const phone = checkoutForm.watch("phone");
	const document = checkoutForm.watch("document");
	const zipCode = checkoutForm.watch("zip_code");

	// ─── Pre-fill checkout from authenticated customer ───────────────────────

	function prefillCheckout(customer: AuthenticatedCustomer) {
		checkoutForm.reset({
			name: customer.name,
			email: customer.email ?? "",
			phone: customer.phone ?? "",
			document: customer.document ?? "",
			address: customer.address,
			number: customer.number,
			complement: customer.complement,
			neighborhood: customer.neighborhood,
			city: customer.city ?? "",
			state: customer.state ?? "",
			zip_code: customer.zip_code ?? "",
		});
	}

	// ─── Step: lookup ────────────────────────────────────────────────────────

	async function handleLookup(data: LookupForm) {
		setLookupLoading(true);
		try {
			const res = await catalogApi.lookupCustomer(slug, data.contact);
			setContactValue(data.contact);

			if (!res.data.found) {
				setStep("form");
				return;
			}

			setFoundFirstName(res.data.firstName ?? "");
			setHasPassword(res.data.hasPassword ?? false);
			setStep("confirm-identity");
		} catch {
			toast.error("Erro ao verificar cliente. Tente novamente.");
		} finally {
			setLookupLoading(false);
		}
	}

	// ─── Step: confirm-identity ──────────────────────────────────────────────

	function handleConfirmYes() {
		if (hasPassword) {
			setStep("enter-password");
		} else {
			setStep("set-password");
		}
	}

	function handleConfirmNo() {
		// Not the same person — treat as new customer
		setStep("form");
	}

	// ─── Step: enter-password ────────────────────────────────────────────────

	async function handleLogin(data: PasswordForm) {
		setAuthLoading(true);
		try {
			const res = await catalogApi.authCustomer(
				slug,
				contactValue,
				data.password,
			);
			setAuthenticatedCustomer(res.data.customer, res.data.token);
			prefillCheckout(res.data.customer);
			setStep("form");
			toast.success(`Bem-vindo(a), ${res.data.customer.firstName}!`);
		} catch (err: unknown) {
			const e = err as { response?: { data?: { message?: string } } };
			if (e.response?.data?.message?.includes("Senha incorreta")) {
				toast.error("Senha incorreta");
			} else {
				toast.error("Erro ao autenticar. Tente novamente.");
			}
		} finally {
			setAuthLoading(false);
		}
	}

	// ─── Step: set-password ──────────────────────────────────────────────────

	async function handleSetPassword(data: NewPasswordForm) {
		setAuthLoading(true);
		try {
			const res = await catalogApi.setCustomerPassword(
				slug,
				contactValue,
				data.password,
			);
			setAuthenticatedCustomer(res.data.customer, res.data.token);
			prefillCheckout(res.data.customer);
			setStep("form");
			toast.success("Senha criada! Seus dados foram preenchidos.");
		} catch {
			toast.error("Erro ao salvar senha. Tente novamente.");
		} finally {
			setAuthLoading(false);
		}
	}

	// ─── Step: form (submit order) ───────────────────────────────────────────

	async function handleSubmitOrder(data: CheckoutForm) {
		if (items.length === 0) {
			toast.error("Adicione produtos ao carrinho");
			return;
		}

		setSubmitLoading(true);
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

			const res = await catalogApi.createOrder({
				customer: customerData,
				items: items.map((item) => ({
					product_id: item.product.id,
					quantity: item.quantity,
				})),
				notes: data.notes,
			});

			setOrderNumber(res.data.order_number);
			setStep("success");
			clearCart();
			toast.success("Pedido realizado com sucesso!");
		} catch (err: unknown) {
			const e = err as { response?: { data?: { message?: string } } };
			toast.error(e.response?.data?.message ?? "Erro ao criar pedido");
		} finally {
			setSubmitLoading(false);
		}
	}

	// ─── Empty cart ──────────────────────────────────────────────────────────

	if (itemCount === 0 && step !== "success") {
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
						href={`/loja/${slug}`}
						className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Ver Catálogo
					</Link>
				</div>
			</div>
		);
	}

	// ─── Success ─────────────────────────────────────────────────────────────

	if (step === "success") {
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
						Seu pedido foi registrado. Em breve entraremos em contato para
						confirmar os detalhes.
					</p>
					<div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Número do pedido
						</p>
						<p className="text-xl font-bold text-primary-600 dark:text-primary-400">
							{orderNumber}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link
							href={`/pedido/${orderNumber}`}
							className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
						>
							<ClipboardList className="w-5 h-5" />
							Acompanhar Pedido
						</Link>
						<Link
							href={`/loja/${slug}`}
							className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-xl font-medium transition-colors"
						>
							<Store className="w-5 h-5" />
							Continuar
						</Link>
					</div>
				</motion.div>
			</div>
		);
	}

	// ─── Shared header ───────────────────────────────────────────────────────

	const Header = () => (
		<header className="bg-white dark:bg-gray-800 shadow-sm">
			<div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
				<Link
					href={`/loja/${slug}`}
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
				{authenticatedCustomer && (
					<div className="hidden sm:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
						<UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
						<span className="text-sm font-medium text-green-700 dark:text-green-300">
							{authenticatedCustomer.firstName}
						</span>
					</div>
				)}
			</div>
		</header>
	);

	// ─── Step: lookup ────────────────────────────────────────────────────────

	if (step === "lookup") {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<Header />
				<main className="max-w-md mx-auto px-4 py-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8"
					>
						<div className="flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto mb-6">
							<Search className="w-7 h-7 text-primary-600 dark:text-primary-400" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
							Identificação
						</h2>
						<p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
							Informe seu email ou telefone para preencher seus dados
							automaticamente.
						</p>

						<form
							onSubmit={lookupForm.handleSubmit(handleLookup)}
							className="space-y-4"
						>
							<div>
								<input
									{...lookupForm.register("contact")}
									placeholder="Email ou telefone"
									className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
								{lookupForm.formState.errors.contact && (
									<p className="text-red-500 text-sm mt-1">
										{lookupForm.formState.errors.contact.message}
									</p>
								)}
							</div>
							<button
								type="submit"
								disabled={lookupLoading}
								className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
							>
								{lookupLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										<Search className="w-5 h-5" />
										Continuar
									</>
								)}
							</button>
						</form>

						<div className="mt-4 text-center">
							<button
								type="button"
								onClick={() => setStep("form")}
								className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
							>
								Pular e preencher manualmente
							</button>
						</div>
					</motion.div>
				</main>
			</div>
		);
	}

	// ─── Step: confirm-identity ──────────────────────────────────────────────

	if (step === "confirm-identity") {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<Header />
				<main className="max-w-md mx-auto px-4 py-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center"
					>
						<div className="flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-6">
							<User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							Encontramos um cadastro
						</h2>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							Você é <span className="font-semibold">{foundFirstName}</span>?
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleConfirmYes}
								className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
							>
								<CheckCircle className="w-5 h-5" />
								Sim, sou eu
							</button>
							<button
								type="button"
								onClick={handleConfirmNo}
								className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-xl font-medium transition-colors"
							>
								Não sou eu
							</button>
						</div>
					</motion.div>
				</main>
			</div>
		);
	}

	// ─── Step: enter-password ────────────────────────────────────────────────

	if (step === "enter-password") {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<Header />
				<main className="max-w-md mx-auto px-4 py-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8"
					>
						<div className="flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full mx-auto mb-6">
							<LogIn className="w-7 h-7 text-primary-600 dark:text-primary-400" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
							Olá, {foundFirstName}!
						</h2>
						<p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
							Digite sua senha para acessar seus dados.
						</p>

						<form
							onSubmit={passwordForm.handleSubmit(handleLogin)}
							className="space-y-4"
						>
							<div>
								<input
									type="password"
									{...passwordForm.register("password")}
									placeholder="Senha"
									className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
								{passwordForm.formState.errors.password && (
									<p className="text-red-500 text-sm mt-1">
										{passwordForm.formState.errors.password.message}
									</p>
								)}
							</div>
							<button
								type="submit"
								disabled={authLoading}
								className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
							>
								{authLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										<LogIn className="w-5 h-5" />
										Entrar
									</>
								)}
							</button>
						</form>

						<div className="mt-4 text-center">
							<button
								type="button"
								onClick={() => setStep("form")}
								className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
							>
								Preencher dados manualmente
							</button>
						</div>
					</motion.div>
				</main>
			</div>
		);
	}

	// ─── Step: set-password ──────────────────────────────────────────────────

	if (step === "set-password") {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<Header />
				<main className="max-w-md mx-auto px-4 py-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8"
					>
						<div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-6">
							<Lock className="w-7 h-7 text-green-600 dark:text-green-400" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
							Crie uma senha
						</h2>
						<p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
							Olá, {foundFirstName}! Crie uma senha para agilizar seus próximos
							pedidos.
						</p>

						<form
							onSubmit={newPasswordForm.handleSubmit(handleSetPassword)}
							className="space-y-4"
						>
							<div>
								<input
									type="password"
									{...newPasswordForm.register("password")}
									placeholder="Nova senha"
									className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
								{newPasswordForm.formState.errors.password && (
									<p className="text-red-500 text-sm mt-1">
										{newPasswordForm.formState.errors.password.message}
									</p>
								)}
							</div>
							<div>
								<input
									type="password"
									{...newPasswordForm.register("confirmPassword")}
									placeholder="Confirmar senha"
									className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
								{newPasswordForm.formState.errors.confirmPassword && (
									<p className="text-red-500 text-sm mt-1">
										{newPasswordForm.formState.errors.confirmPassword.message}
									</p>
								)}
							</div>
							<button
								type="submit"
								disabled={authLoading}
								className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
							>
								{authLoading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										<UserPlus className="w-5 h-5" />
										Criar conta e continuar
									</>
								)}
							</button>
						</form>

						<div className="mt-4 text-center">
							<button
								type="button"
								onClick={() => setStep("form")}
								className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
							>
								Pular e preencher manualmente
							</button>
						</div>
					</motion.div>
				</main>
			</div>
		);
	}

	// ─── Step: form ──────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Header />
			<main className="max-w-5xl mx-auto px-4 py-6">
				{authenticatedCustomer && (
					<div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
						<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
						<div>
							<p className="font-medium text-green-800 dark:text-green-200">
								Seus dados foram preenchidos automaticamente
							</p>
							<p className="text-sm text-green-600 dark:text-green-400">
								Você pode revisar e editar antes de confirmar.
							</p>
						</div>
					</div>
				)}

				<form onSubmit={checkoutForm.handleSubmit(handleSubmitOrder)}>
					<div className="grid lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							{/* Personal Info */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<div className="flex items-center gap-2 mb-4">
									<User className="w-5 h-5 text-primary-600" />
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
											{...checkoutForm.register("name")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.name && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.name.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Email *
										</label>
										<input
											type="email"
											{...checkoutForm.register("email")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.email && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.email.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Telefone *
										</label>
										<input
											{...checkoutForm.register("phone")}
											value={phone ? formatPhone(phone) : ""}
											onChange={(e) =>
												checkoutForm.setValue(
													"phone",
													e.target.value.replace(/\D/g, ""),
												)
											}
											maxLength={15}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.phone && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.phone.message}
											</p>
										)}
									</div>
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											CPF/CNPJ *
										</label>
										<input
											{...checkoutForm.register("document")}
											value={document ? formatDocument(document) : ""}
											onChange={(e) =>
												checkoutForm.setValue(
													"document",
													e.target.value.replace(/\D/g, ""),
												)
											}
											maxLength={18}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.document && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.document.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Address */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="w-5 h-5 text-primary-600" />
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
											{...checkoutForm.register("zip_code")}
											value={zipCode ? formatZipCode(zipCode) : ""}
											onChange={(e) =>
												checkoutForm.setValue(
													"zip_code",
													e.target.value.replace(/\D/g, ""),
												)
											}
											maxLength={9}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.zip_code && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.zip_code.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Estado *
										</label>
										<input
											{...checkoutForm.register("state")}
											maxLength={2}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
										/>
										{checkoutForm.formState.errors.state && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.state.message}
											</p>
										)}
									</div>
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Cidade *
										</label>
										<input
											{...checkoutForm.register("city")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.city && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.city.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Bairro *
										</label>
										<input
											{...checkoutForm.register("neighborhood")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.neighborhood && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.neighborhood.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Endereço *
										</label>
										<input
											{...checkoutForm.register("address")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.address && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.address.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Número *
										</label>
										<input
											{...checkoutForm.register("number")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
										{checkoutForm.formState.errors.number && (
											<p className="text-red-500 text-sm mt-1">
												{checkoutForm.formState.errors.number.message}
											</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
											Complemento
										</label>
										<input
											{...checkoutForm.register("complement")}
											className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
										/>
									</div>
								</div>
							</div>

							{/* Notes */}
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
								<h2 className="font-semibold text-gray-900 dark:text-white mb-4">
									Observações
								</h2>
								<textarea
									{...checkoutForm.register("notes")}
									rows={3}
									placeholder="Instruções especiais, horário preferido..."
									className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
								/>
							</div>
						</div>

						{/* Order summary */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-24">
								<div className="flex items-center gap-2 mb-4">
									<ShoppingCart className="w-5 h-5 text-primary-600" />
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
										<span className="text-primary-600 dark:text-primary-400">
											{formatCurrency(total)}
										</span>
									</div>
								</div>

								<button
									type="submit"
									disabled={submitLoading}
									className="w-full mt-6 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
								>
									{submitLoading ? (
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
