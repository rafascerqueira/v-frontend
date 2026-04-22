"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();
	const searchParams = useSearchParams();
	const registered = searchParams.get("registered");
	const oauthError = searchParams.get("error") === "oauth_failed";

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			setError("");
			await login(data.email, data.password);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao fazer login";
			if (
				errorMessage.includes("401") ||
				errorMessage.includes("Unauthorized")
			) {
				setError("Email ou senha inválidos");
			} else {
				setError("Erro ao conectar com o servidor. Tente novamente.");
			}
		}
	};

	return (
		<>
			{/* Mobile Logo */}
			<div className="lg:hidden flex items-center justify-center gap-2 mb-8">
				<div className="p-2.5 bg-primary-600 rounded-xl">
					<ShoppingBag className="h-6 w-6 text-white" />
				</div>
				<span className="text-2xl font-bold text-gray-900 dark:text-white">
					Vendinhas
				</span>
			</div>

			<Card className="shadow-xl border-0">
				<CardHeader className="space-y-1 pb-4">
					<FadeIn>
						<CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
					</FadeIn>
					<FadeIn delay={0.1}>
						<CardDescription>
							Entre com suas credenciais para acessar o sistema
						</CardDescription>
					</FadeIn>
				</CardHeader>

				<CardContent className="space-y-5">
					{registered && (
						<FadeIn>
							<Alert variant="success">
								Conta criada com sucesso! Faça login para continuar.
							</Alert>
						</FadeIn>
					)}

					{oauthError && (
						<FadeIn>
							<Alert variant="error">
								Não foi possível autenticar com a rede social. Tente novamente ou use seu e-mail e senha.
							</Alert>
						</FadeIn>
					)}

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

						<FadeIn delay={0.2}>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<Input
									{...register("password")}
									type={showPassword ? "text" : "password"}
									placeholder="Sua senha"
									className="pl-10 pr-10"
									error={errors.password?.message}
									autoComplete="current-password"
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

						<FadeIn delay={0.25}>
							<div className="flex items-center justify-between">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
									<span className="text-sm text-gray-600 dark:text-gray-400">
										Lembrar de mim
									</span>
								</label>
								<Link
									href="/forgot-password"
									className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
								>
									Esqueceu a senha?
								</Link>
							</div>
						</FadeIn>

						<FadeIn delay={0.3}>
							<Button
								type="submit"
								className="w-full"
								size="lg"
								isLoading={isSubmitting}
							>
								Entrar
								<ArrowRight className="h-4 w-4" />
							</Button>
						</FadeIn>
					</form>

					<FadeIn delay={0.35}>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200 dark:border-gray-700" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
									ou continue com
								</span>
							</div>
						</div>
					</FadeIn>

					<FadeIn delay={0.4}>
						<div className="grid grid-cols-2 gap-3">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => {
									window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
								}}
							>
								<svg
									className="h-5 w-5 mr-2"
									viewBox="0 0 24 24"
									aria-label="Google"
								>
									<title>Google</title>
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Google
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => {
									window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
								}}
							>
								<svg
									className="h-5 w-5 mr-2 text-blue-600"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-label="Facebook"
								>
									<title>Facebook</title>
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
								Facebook
							</Button>
						</div>
					</FadeIn>

					<FadeIn delay={0.45}>
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							Não tem uma conta?{" "}
							<Link
								href="/register"
								className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
							>
								Cadastre-se gratuitamente
							</Link>
						</p>
					</FadeIn>

					<FadeIn delay={0.5}>
						<div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
							<Link
								href="/terms"
								className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
							>
								Termos de Uso
							</Link>
							<span className="text-gray-300">|</span>
							<Link
								href="/privacy"
								className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
							>
								Política de Privacidade
							</Link>
						</div>
					</FadeIn>
				</CardContent>
			</Card>
		</>
	);
}
