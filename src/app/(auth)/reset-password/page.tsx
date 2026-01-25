"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const resetPasswordSchema = z
	.object({
		password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		if (!token) return;

		try {
			setError("");
			await api.post("/auth/reset-password", {
				token,
				password: data.password,
			});
			setIsSubmitted(true);
		} catch (_err: unknown) {
			setError(
				"Token inválido ou expirado. Solicite uma nova redefinição de senha.",
			);
		}
	};

	if (!token) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center"
			>
				<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<AlertCircle className="h-8 w-8 text-red-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
				<p className="text-gray-600 mb-6">
					O link de redefinição de senha é inválido ou está incompleto.
				</p>
				<Link
					href="/forgot-password"
					className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
				>
					Solicitar novo link
				</Link>
			</motion.div>
		);
	}

	if (isSubmitted) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center"
			>
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<CheckCircle className="h-8 w-8 text-green-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Senha Redefinida!
				</h2>
				<p className="text-gray-600 mb-6">
					Sua senha foi alterada com sucesso. Você já pode fazer login.
				</p>
				<Link href="/login">
					<Button>Fazer Login</Button>
				</Link>
			</motion.div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900">Redefinir Senha</h2>
				<p className="text-gray-600 mt-2">Digite sua nova senha abaixo.</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
						{error}
					</div>
				)}

				<Input
					label="Nova Senha"
					type="password"
					placeholder="••••••••"
					error={errors.password?.message}
					{...register("password")}
				/>

				<Input
					label="Confirmar Senha"
					type="password"
					placeholder="••••••••"
					error={errors.confirmPassword?.message}
					{...register("confirmPassword")}
				/>

				<Button
					type="submit"
					className="w-full"
					size="lg"
					isLoading={isSubmitting}
				>
					<Lock className="h-4 w-4 mr-2" />
					Redefinir Senha
				</Button>

				<div className="text-center">
					<Link
						href="/login"
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
					>
						<ArrowLeft className="h-4 w-4" />
						Voltar para o login
					</Link>
				</div>
			</form>
		</motion.div>
	);
}
