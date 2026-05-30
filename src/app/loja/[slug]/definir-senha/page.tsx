"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { catalogApi } from "@/lib/api-public";

const schema = z
	.object({
		password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Senhas não conferem",
		path: ["confirmPassword"],
	});

type FormData = z.infer<typeof schema>;

function DefinirSenhaContent() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const slug = params.slug as string;
	const token = searchParams.get("invite");

	const { setAuthenticatedCustomer } = useCart();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	async function onSubmit(data: FormData) {
		if (!token) return;
		try {
			const res = await catalogApi.redeemInvite(slug, token, data.password);
			setAuthenticatedCustomer(res.data.customer, res.data.token);
			toast.success("Senha definida com sucesso!");
			router.push(`/loja/${slug}`);
		} catch (err: unknown) {
			const e = err as { response?: { status?: number } };
			if (e.response?.status === 401) {
				toast.error("Este link é inválido ou expirou. Peça um novo à loja.");
			} else {
				toast.error("Não foi possível definir a senha. Tente novamente.");
			}
		}
	}

	if (!token) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
				<div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6">
					<AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
				</div>
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
					Link inválido
				</h2>
				<p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
					Este link de definição de senha está incompleto ou expirou. Peça um
					novo link à loja.
				</p>
				<Link
					href={`/loja/${slug}`}
					className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
				>
					Voltar para a loja
				</Link>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8"
		>
			<div className="flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-6">
				<Lock className="w-7 h-7 text-green-600 dark:text-green-400" />
			</div>
			<h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
				Defina sua senha
			</h2>
			<p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
				Crie uma senha para acessar sua conta e agilizar seus próximos pedidos.
			</p>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<input
						type="password"
						{...register("password")}
						placeholder="Nova senha (mín. 8 caracteres)"
						className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
					{errors.password && (
						<p className="text-red-500 text-sm mt-1">
							{errors.password.message}
						</p>
					)}
				</div>
				<div>
					<input
						type="password"
						{...register("confirmPassword")}
						placeholder="Confirmar senha"
						className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
					/>
					{errors.confirmPassword && (
						<p className="text-red-500 text-sm mt-1">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
				>
					{isSubmitting ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<>
							<UserPlus className="w-5 h-5" />
							Definir senha
						</>
					)}
				</button>
			</form>
		</motion.div>
	);
}

export default function DefinirSenhaPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<main className="max-w-md mx-auto px-4 py-10">
				<Suspense
					fallback={
						<div className="flex justify-center py-20">
							<Loader2 className="w-6 h-6 animate-spin text-primary-500" />
						</div>
					}
				>
					<DefinirSenhaContent />
				</Suspense>
			</main>
		</div>
	);
}
