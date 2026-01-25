"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	Lock,
	Mail,
	ShoppingBag,
	User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FadeIn } from "@/components/page-transition";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const registerSchema = z
	.object({
		name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
		email: z.string().email("Email inválido"),
		password: z
			.string()
			.min(8, "Senha deve ter no mínimo 8 caracteres")
			.regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
			.regex(/[0-9]/, "Senha deve conter pelo menos um número"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRequirements = [
	{ regex: /.{8,}/, label: "Mínimo 8 caracteres" },
	{ regex: /[A-Z]/, label: "Uma letra maiúscula" },
	{ regex: /[0-9]/, label: "Um número" },
];

export default function RegisterPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const { register: registerUser } = useAuth();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const password = watch("password", "");

	const onSubmit = async (data: RegisterFormData) => {
		try {
			setError("");
			await registerUser(data.name, data.email, data.password);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao criar conta";
			if (
				errorMessage.includes("400") ||
				errorMessage.includes("already exists")
			) {
				setError("Este email já está cadastrado");
			} else {
				setError("Erro ao conectar com o servidor. Tente novamente.");
			}
		}
	};

	return (
		<>
			{/* Mobile Logo */}
			<div className="lg:hidden flex items-center justify-center gap-2 mb-8">
				<div className="p-2.5 bg-indigo-600 rounded-xl">
					<ShoppingBag className="h-6 w-6 text-white" />
				</div>
				<span className="text-2xl font-bold text-gray-900">Vendinhas</span>
			</div>

			<Card className="shadow-xl border-0">
				<CardHeader className="space-y-1 pb-4">
					<FadeIn>
						<CardTitle className="text-2xl">Criar sua conta</CardTitle>
					</FadeIn>
					<FadeIn delay={0.1}>
						<CardDescription>
							Preencha os dados abaixo para começar a usar o sistema
						</CardDescription>
					</FadeIn>
				</CardHeader>

				<CardContent className="space-y-5">
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Alert variant="error">{error}</Alert>
						</motion.div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<FadeIn delay={0.15}>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									{...register("name")}
									type="text"
									placeholder="Seu nome completo"
									className="pl-10"
									error={errors.name?.message}
									autoComplete="name"
								/>
							</div>
						</FadeIn>

						<FadeIn delay={0.2}>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									{...register("email")}
									type="email"
									placeholder="seu@email.com"
									className="pl-10"
									error={errors.email?.message}
									autoComplete="email"
								/>
							</div>
						</FadeIn>

						<FadeIn delay={0.25}>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									{...register("password")}
									type={showPassword ? "text" : "password"}
									placeholder="Crie uma senha forte"
									className="pl-10 pr-10"
									error={errors.password?.message}
									autoComplete="new-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</FadeIn>

						{/* Password strength indicator */}
						<FadeIn delay={0.28}>
							<div className="space-y-2">
								{passwordRequirements.map((req) => (
									<div
										key={req.label}
										className="flex items-center gap-2 text-sm"
									>
										<div
											className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
												req.regex.test(password)
													? "bg-green-500 text-white"
													: "bg-gray-200 text-gray-400"
											}`}
										>
											<Check className="w-3 h-3" />
										</div>
										<span
											className={
												req.regex.test(password)
													? "text-green-600"
													: "text-gray-500"
											}
										>
											{req.label}
										</span>
									</div>
								))}
							</div>
						</FadeIn>

						<FadeIn delay={0.3}>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									{...register("confirmPassword")}
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirme sua senha"
									className="pl-10 pr-10"
									error={errors.confirmPassword?.message}
									autoComplete="new-password"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</FadeIn>

						<FadeIn delay={0.35}>
							<label className="flex items-start gap-2 cursor-pointer">
								<input
									type="checkbox"
									required
									className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm text-gray-600">
									Aceito os{" "}
									<Link
										href="/terms"
										className="text-indigo-600 hover:text-indigo-700 font-medium"
									>
										Termos de Uso
									</Link>{" "}
									e a{" "}
									<Link
										href="/privacy"
										className="text-indigo-600 hover:text-indigo-700 font-medium"
									>
										Política de Privacidade
									</Link>
								</span>
							</label>
						</FadeIn>

						<FadeIn delay={0.4}>
							<Button
								type="submit"
								className="w-full"
								size="lg"
								isLoading={isSubmitting}
							>
								Criar conta
								<ArrowRight className="h-4 w-4" />
							</Button>
						</FadeIn>
					</form>

					<FadeIn delay={0.45}>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white text-gray-500">ou</span>
							</div>
						</div>
					</FadeIn>

					<FadeIn delay={0.5}>
						<p className="text-center text-sm text-gray-600">
							Já tem uma conta?{" "}
							<Link
								href="/login"
								className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
							>
								Faça login
							</Link>
						</p>
					</FadeIn>
				</CardContent>
			</Card>
		</>
	);
}
