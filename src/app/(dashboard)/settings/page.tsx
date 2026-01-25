"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	Bell,
	Mail,
	Monitor,
	Moon,
	Palette,
	Save,
	Shield,
	Sun,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

const profileSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
	const { user } = useAuth();
	const { theme, setTheme } = useTheme();
	const [activeTab, setActiveTab] = useState("profile");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name || "",
		},
	});

	const onSubmit = async (data: ProfileFormData) => {
		try {
			await api.patch("/auth/profile", data);
			toast.success("Perfil atualizado com sucesso!");
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao atualizar perfil";
			toast.error(message);
		}
	};

	const tabs = [
		{ id: "profile", label: "Perfil", icon: User },
		{ id: "security", label: "Segurança", icon: Shield },
		{ id: "notifications", label: "Notificações", icon: Bell },
		{ id: "appearance", label: "Aparência", icon: Palette },
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Configurações
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-1">
					Gerencie suas preferências e configurações da conta
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Sidebar */}
				<div className="lg:w-64 flex-shrink-0">
					<Card>
						<CardContent className="p-2">
							<nav className="space-y-1">
								{tabs.map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
											activeTab === tab.id
												? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
												: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										}`}
									>
										<tab.icon
											className={`h-5 w-5 ${activeTab === tab.id ? "text-indigo-600" : "text-gray-400"}`}
										/>
										{tab.label}
									</button>
								))}
							</nav>
						</CardContent>
					</Card>
				</div>

				{/* Content */}
				<div className="flex-1">
					{activeTab === "profile" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5 text-indigo-500" />
										Informações do Perfil
									</CardTitle>
									<CardDescription>
										Atualize suas informações pessoais
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
										<Input
											label="Nome Completo"
											placeholder="Seu nome"
											error={errors.name?.message}
											{...register("name")}
										/>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Email
											</label>
											<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
												<Mail className="h-4 w-4 text-gray-400" />
												<span className="text-sm text-gray-600">
													{user?.email}
												</span>
											</div>
											<p className="text-xs text-gray-500 mt-1">
												O email não pode ser alterado
											</p>
										</div>
										<div className="flex justify-end pt-4">
											<Button type="submit" isLoading={isSubmitting}>
												<Save className="h-4 w-4 mr-2" />
												Salvar Alterações
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{activeTab === "security" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-indigo-500" />
										Segurança
									</CardTitle>
									<CardDescription>
										Gerencie a segurança da sua conta
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="p-4 bg-gray-50 rounded-lg">
										<h3 className="font-medium text-gray-900 mb-2">
											Alterar Senha
										</h3>
										<p className="text-sm text-gray-500 mb-4">
											É recomendado usar uma senha forte com letras, números e
											caracteres especiais
										</p>
										<Button variant="outline" disabled>
											Em breve
										</Button>
									</div>
									<div className="p-4 bg-gray-50 rounded-lg">
										<h3 className="font-medium text-gray-900 mb-2">
											Autenticação em Duas Etapas
										</h3>
										<p className="text-sm text-gray-500 mb-4">
											Adicione uma camada extra de segurança à sua conta
										</p>
										<Button variant="outline" disabled>
											Em breve
										</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{activeTab === "notifications" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Bell className="h-5 w-5 text-indigo-500" />
										Notificações
									</CardTitle>
									<CardDescription>
										Configure suas preferências de notificação
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{[
										{
											label: "Novos pedidos",
											description:
												"Receba notificações quando um novo pedido for criado",
										},
										{
											label: "Pagamentos",
											description: "Notificações sobre pagamentos recebidos",
										},
										{
											label: "Estoque baixo",
											description:
												"Alerta quando produtos estiverem com estoque baixo",
										},
										{
											label: "Relatórios",
											description: "Relatórios semanais de desempenho",
										},
									].map((item) => (
										<div
											key={item.label}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div>
												<h3 className="font-medium text-gray-900">
													{item.label}
												</h3>
												<p className="text-sm text-gray-500">
													{item.description}
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													className="sr-only peer"
													defaultChecked
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
											</label>
										</div>
									))}
								</CardContent>
							</Card>
						</motion.div>
					)}

					{activeTab === "appearance" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Palette className="h-5 w-5 text-indigo-500" />
										Aparência
									</CardTitle>
									<CardDescription>
										Personalize a aparência do sistema
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div>
										<h3 className="font-medium text-gray-900 dark:text-white mb-3">
											Tema
										</h3>
										<div className="grid grid-cols-3 gap-3">
											{[
												{ id: "light", label: "Claro", icon: Sun },
												{ id: "dark", label: "Escuro", icon: Moon },
												{ id: "system", label: "Sistema", icon: Monitor },
											].map((t) => (
												<button
													key={t.id}
													type="button"
													onClick={() => setTheme(t.id)}
													className={`p-4 rounded-lg border-2 text-center transition-colors ${
														theme === t.id
															? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
															: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
													}`}
												>
													<t.icon
														className={`w-6 h-6 mx-auto mb-2 ${
															theme === t.id
																? "text-indigo-600 dark:text-indigo-400"
																: "text-gray-500 dark:text-gray-400"
														}`}
													/>
													<span
														className={`text-sm font-medium ${
															theme === t.id
																? "text-indigo-600 dark:text-indigo-400"
																: "text-gray-700 dark:text-gray-300"
														}`}
													>
														{t.label}
													</span>
												</button>
											))}
										</div>
									</div>
									<div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
										<p className="text-sm text-indigo-800 dark:text-indigo-300">
											✓ Tema{" "}
											{theme === "dark"
												? "escuro"
												: theme === "light"
													? "claro"
													: "do sistema"}{" "}
											selecionado. As alterações são salvas automaticamente.
										</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}
