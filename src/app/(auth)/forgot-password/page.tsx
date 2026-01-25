"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const forgotPasswordSchema = z.object({
	email: z.string().email("Email inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			setError("");
			await api.post("/auth/forgot-password", data);
			setIsSubmitted(true);
		} catch (_err: unknown) {
			setError("Ocorreu um erro. Tente novamente.");
		}
	};

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
					Email Enviado!
				</h2>
				<p className="text-gray-600 mb-6">
					Se o email estiver cadastrado, você receberá instruções para redefinir
					sua senha.
				</p>
				<Link
					href="/login"
					className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
				>
					<ArrowLeft className="h-4 w-4" />
					Voltar para o login
				</Link>
			</motion.div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900">
					Esqueceu sua senha?
				</h2>
				<p className="text-gray-600 mt-2">
					Digite seu email e enviaremos instruções para redefinir sua senha.
				</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
						{error}
					</div>
				)}

				<Input
					label="Email"
					type="email"
					placeholder="seu@email.com"
					error={errors.email?.message}
					{...register("email")}
				/>

				<Button
					type="submit"
					className="w-full"
					size="lg"
					isLoading={isSubmitting}
				>
					<Mail className="h-4 w-4 mr-2" />
					Enviar Instruções
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
