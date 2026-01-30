"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	Bell,
	Camera,
	Check,
	Copy,
	Eye,
	EyeOff,
	Key,
	Lock,
	Mail,
	MapPin,
	Monitor,
	Moon,
	Palette,
	Phone,
	Save,
	Shield,
	ShieldCheck,
	Sun,
	User,
	X,
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
	phone: z.string().optional(),
	address: z.string().optional(),
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(6, "Senha atual é obrigatória"),
		newPassword: z
			.string()
			.min(8, "Nova senha deve ter pelo menos 8 caracteres"),
		confirmPassword: z.string().min(8, "Confirmação é obrigatória"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
	const { user, refreshUser } = useAuth();
	const { theme, setTheme } = useTheme();
	const [activeTab, setActiveTab] = useState("profile");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(
		user?.two_factor_enabled || false,
	);
	const [twoFactorSetup, setTwoFactorSetup] = useState<{
		qrCode: string;
		secret: string;
	} | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [isEnabling2FA, setIsEnabling2FA] = useState(false);
	const [profileImage, setProfileImage] = useState<string | null>(
		user?.avatar || null,
	);
	const [uploadingImage, setUploadingImage] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name || "",
			phone: user?.phone || "",
			address: user?.address || "",
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
		reset: resetPasswordForm,
	} = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
	});

	const onSubmit = async (data: ProfileFormData) => {
		try {
			await api.patch("/auth/profile", { ...data, avatar: profileImage });
			toast.success("Perfil atualizado com sucesso!");
			refreshUser?.();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao atualizar perfil";
			toast.error(message);
		}
	};

	const onPasswordSubmit = async (data: PasswordFormData) => {
		try {
			await api.post("/auth/change-password", {
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
			toast.success("Senha alterada com sucesso!");
			resetPasswordForm();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao alterar senha";
			toast.error(message);
		}
	};

	const handleEnable2FA = async () => {
		try {
			setIsEnabling2FA(true);
			const response = await api.post("/auth/2fa/setup");
			setTwoFactorSetup(response.data);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao configurar 2FA";
			toast.error(message);
		} finally {
			setIsEnabling2FA(false);
		}
	};

	const handleVerify2FA = async () => {
		try {
			await api.post("/auth/2fa/verify", { code: verificationCode });
			setTwoFactorEnabled(true);
			setTwoFactorSetup(null);
			setVerificationCode("");
			toast.success("Autenticação em duas etapas ativada!");
			refreshUser?.();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Código inválido";
			toast.error(message);
		}
	};

	const handleDisable2FA = async () => {
		try {
			await api.post("/auth/2fa/disable");
			setTwoFactorEnabled(false);
			toast.success("Autenticação em duas etapas desativada!");
			refreshUser?.();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao desativar 2FA";
			toast.error(message);
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		try {
			setUploadingImage(true);
			const response = await api.post("/upload/profile", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setProfileImage(response.data.url);
			toast.success("Foto atualizada!");
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao enviar foto";
			toast.error(message);
		} finally {
			setUploadingImage(false);
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
							className="space-y-6"
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
										<div className="flex items-center gap-6 pb-4 border-b border-gray-100">
											<div className="relative">
												<div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
													{profileImage ? (
														<img
															src={profileImage}
															alt="Avatar"
															className="w-full h-full object-cover"
														/>
													) : (
														<User className="w-8 h-8 text-gray-400" />
													)}
												</div>
												<label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
													<Camera className="w-3.5 h-3.5 text-white" />
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={handleImageUpload}
														disabled={uploadingImage}
													/>
												</label>
											</div>
											<div>
												<p className="font-medium text-gray-900">
													{user?.name}
												</p>
												<p className="text-sm text-gray-500">{user?.email}</p>
											</div>
										</div>
										<Input
											label="Nome Completo"
											placeholder="Seu nome"
											error={errors.name?.message}
											{...register("name")}
										/>
										<div className="grid md:grid-cols-2 gap-4">
											<div className="relative">
												<Input
													label="Telefone"
													placeholder="(00) 00000-0000"
													error={errors.phone?.message}
													{...register("phone")}
												/>
												<Phone className="absolute right-3 top-9 h-4 w-4 text-gray-400" />
											</div>
											<div className="relative">
												<Input
													label="Endereço"
													placeholder="Cidade, Estado"
													error={errors.address?.message}
													{...register("address")}
												/>
												<MapPin className="absolute right-3 top-9 h-4 w-4 text-gray-400" />
											</div>
										</div>
										<div>
											<span className="block text-sm font-medium text-gray-700 mb-1">
												Email
											</span>
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
							className="space-y-6"
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Lock className="h-5 w-5 text-indigo-500" />
										Alterar Senha
									</CardTitle>
									<CardDescription>
										É recomendado usar uma senha forte com letras, números e
										caracteres especiais
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={handlePasswordSubmit(onPasswordSubmit)}
										className="space-y-4"
									>
										<div className="relative">
											<Input
												label="Senha Atual"
												type={showCurrentPassword ? "text" : "password"}
												placeholder="Digite sua senha atual"
												error={passwordErrors.currentPassword?.message}
												{...registerPassword("currentPassword")}
											/>
											<button
												type="button"
												onClick={() =>
													setShowCurrentPassword(!showCurrentPassword)
												}
												className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
											>
												{showCurrentPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										<div className="relative">
											<Input
												label="Nova Senha"
												type={showNewPassword ? "text" : "password"}
												placeholder="Digite sua nova senha"
												error={passwordErrors.newPassword?.message}
												{...registerPassword("newPassword")}
											/>
											<button
												type="button"
												onClick={() => setShowNewPassword(!showNewPassword)}
												className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
											>
												{showNewPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										<div className="relative">
											<Input
												label="Confirmar Nova Senha"
												type={showConfirmPassword ? "text" : "password"}
												placeholder="Confirme sua nova senha"
												error={passwordErrors.confirmPassword?.message}
												{...registerPassword("confirmPassword")}
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										<div className="flex justify-end pt-2">
											<Button type="submit" isLoading={isChangingPassword}>
												<Key className="h-4 w-4 mr-2" />
												Alterar Senha
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<ShieldCheck className="h-5 w-5 text-indigo-500" />
										Autenticação em Duas Etapas (2FA)
									</CardTitle>
									<CardDescription>
										Adicione uma camada extra de segurança à sua conta
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{twoFactorEnabled ? (
										<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
													<Check className="w-5 h-5 text-green-600" />
												</div>
												<div>
													<p className="font-medium text-green-800">
														2FA Ativado
													</p>
													<p className="text-sm text-green-600">
														Sua conta está protegida com autenticação em duas
														etapas
													</p>
												</div>
											</div>
											<Button
												variant="outline"
												className="mt-4 text-red-600 border-red-200 hover:bg-red-50"
												onClick={handleDisable2FA}
											>
												<X className="h-4 w-4 mr-2" />
												Desativar 2FA
											</Button>
										</div>
									) : twoFactorSetup ? (
										<div className="space-y-4">
											<div className="p-4 bg-gray-50 rounded-lg text-center">
												<p className="text-sm text-gray-600 mb-4">
													Escaneie o QR Code com seu aplicativo autenticador
												</p>
												<img
													src={twoFactorSetup.qrCode}
													alt="QR Code 2FA"
													className="mx-auto mb-4"
												/>
												<div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded">
													<code className="text-sm font-mono">
														{twoFactorSetup.secret}
													</code>
													<button
														type="button"
														onClick={() => {
															navigator.clipboard.writeText(
																twoFactorSetup.secret,
															);
															toast.success("Código copiado!");
														}}
														className="p-1 hover:bg-gray-200 rounded"
													>
														<Copy className="h-4 w-4 text-gray-500" />
													</button>
												</div>
											</div>
											<Input
												label="Código de Verificação"
												placeholder="000000"
												value={verificationCode}
												onChange={(e) => setVerificationCode(e.target.value)}
												maxLength={6}
											/>
											<div className="flex gap-2">
												<Button
													variant="outline"
													onClick={() => setTwoFactorSetup(null)}
												>
													Cancelar
												</Button>
												<Button
													onClick={handleVerify2FA}
													disabled={verificationCode.length !== 6}
												>
													Verificar e Ativar
												</Button>
											</div>
										</div>
									) : (
										<div className="p-4 bg-gray-50 rounded-lg">
											<p className="text-sm text-gray-600 mb-4">
												A autenticação em duas etapas adiciona uma camada extra
												de segurança exigindo um código do seu celular além da
												senha.
											</p>
											<Button
												onClick={handleEnable2FA}
												isLoading={isEnabling2FA}
											>
												<ShieldCheck className="h-4 w-4 mr-2" />
												Configurar 2FA
											</Button>
										</div>
									)}
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
