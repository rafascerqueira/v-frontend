"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	Edit2,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Plus,
	Search,
	Trash2,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { validateDocument } from "@/lib/validators";
import type { Customer } from "@/types";

const customerSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	email: z.string().email("Email inválido"),
	phone: z.string().min(10, "Telefone inválido"),
	document: z
		.string()
		.min(11, "CPF/CNPJ inválido")
		.refine(validateDocument, "CPF/CNPJ inválido"),
	city: z.string().min(2, "Cidade é obrigatória"),
	state: z.string().length(2, "Estado deve ter 2 caracteres"),
	zip_code: z.string().min(8, "CEP inválido"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
		null,
	);
	const [activeMenu, setActiveMenu] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
	});

	const fetchCustomers = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/customers");
			setCustomers(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Erro ao carregar clientes");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCustomers();
	}, [fetchCustomers]);

	const openCreateModal = () => {
		setEditingCustomer(null);
		reset({
			name: "",
			email: "",
			phone: "",
			document: "",
			city: "",
			state: "",
			zip_code: "",
		});
		setIsModalOpen(true);
	};

	const openEditModal = (customer: Customer) => {
		setEditingCustomer(customer);
		reset({
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
			document: customer.document,
			city: customer.city,
			state: customer.state,
			zip_code: customer.zip_code,
		});
		setIsModalOpen(true);
		setActiveMenu(null);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingCustomer(null);
		reset();
	};

	const onSubmit = async (data: CustomerFormData) => {
		try {
			if (editingCustomer) {
				await api.patch(`/customers/${editingCustomer.id}`, data);
				toast.success("Cliente atualizado com sucesso!");
			} else {
				await api.post("/customers", {
					...data,
					address: {},
				});
				toast.success("Cliente criado com sucesso!");
			}
			closeModal();
			fetchCustomers();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao salvar cliente";
			toast.error(message);
		}
	};

	const handleDelete = async () => {
		if (!deletingCustomer) return;

		try {
			await api.delete(`/customers/${deletingCustomer.id}`);
			toast.success("Cliente excluído com sucesso!");
			setDeletingCustomer(null);
			fetchCustomers();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir cliente";
			toast.error(message);
		}
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.phone.includes(searchTerm),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
					<p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
				</div>
				<Button onClick={openCreateModal}>
					<Plus className="h-4 w-4 mr-2" />
					Novo Cliente
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-indigo-500" />
							Lista de Clientes
						</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar clientes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<SkeletonTable rows={5} />
					) : filteredCustomers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<Users className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">Nenhum cliente encontrado</p>
							<p className="text-sm">Comece adicionando seu primeiro cliente</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Cliente</TableCell>
									<TableCell as="th">Contato</TableCell>
									<TableCell as="th">Localização</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredCustomers.map((customer, index) => (
									<motion.tr
										key={customer.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50 transition-colors"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
													<span className="text-indigo-600 font-medium">
														{customer.name.charAt(0).toUpperCase()}
													</span>
												</div>
												<div>
													<p className="font-medium text-gray-900">
														{customer.name}
													</p>
													<p className="text-sm text-gray-500">
														{customer.document}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Mail className="h-3.5 w-3.5" />
													{customer.email}
												</div>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Phone className="h-3.5 w-3.5" />
													{customer.phone}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<MapPin className="h-3.5 w-3.5" />
												{customer.city}, {customer.state}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={customer.active ? "success" : "error"}>
												{customer.active ? "Ativo" : "Inativo"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="relative inline-block">
												<button
													type="button"
													onClick={() =>
														setActiveMenu(
															activeMenu === customer.id ? null : customer.id,
														)
													}
													className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
												>
													<MoreVertical className="h-4 w-4 text-gray-500" />
												</button>
												{activeMenu === customer.id && (
													<motion.div
														initial={{ opacity: 0, scale: 0.95 }}
														animate={{ opacity: 1, scale: 1 }}
														className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
													>
														<button
															type="button"
															onClick={() => openEditModal(customer)}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
														>
															<Edit2 className="h-4 w-4" />
															Editar
														</button>
														<button
															type="button"
															onClick={() => {
																setDeletingCustomer(customer);
																setActiveMenu(null);
															}}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
														>
															<Trash2 className="h-4 w-4" />
															Excluir
														</button>
													</motion.div>
												)}
											</div>
										</TableCell>
									</motion.tr>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={editingCustomer ? "Editar Cliente" : "Novo Cliente"}
				size="lg"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Input
						label="Nome Completo"
						placeholder="Ex: João Silva"
						error={errors.name?.message}
						{...register("name")}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Email"
							type="email"
							placeholder="email@exemplo.com"
							error={errors.email?.message}
							{...register("email")}
						/>
						<Input
							label="Telefone"
							placeholder="(11) 99999-9999"
							error={errors.phone?.message}
							{...register("phone")}
						/>
					</div>
					<Input
						label="CPF/CNPJ"
						placeholder="000.000.000-00"
						error={errors.document?.message}
						{...register("document")}
					/>
					<div className="grid grid-cols-3 gap-4">
						<Input
							label="Cidade"
							placeholder="São Paulo"
							error={errors.city?.message}
							{...register("city")}
						/>
						<Input
							label="Estado"
							placeholder="SP"
							maxLength={2}
							error={errors.state?.message}
							{...register("state")}
						/>
						<Input
							label="CEP"
							placeholder="00000-000"
							error={errors.zip_code?.message}
							{...register("zip_code")}
						/>
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={closeModal}>
							Cancelar
						</Button>
						<Button type="submit" isLoading={isSubmitting}>
							{editingCustomer ? "Salvar Alterações" : "Criar Cliente"}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={!!deletingCustomer}
				onClose={() => setDeletingCustomer(null)}
				title="Excluir Cliente"
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-gray-600">
						Tem certeza que deseja excluir o cliente{" "}
						<span className="font-semibold">{deletingCustomer?.name}</span>?
					</p>
					<p className="text-sm text-gray-500">
						Esta ação não pode ser desfeita.
					</p>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeletingCustomer(null)}
						>
							Cancelar
						</Button>
						<Button type="button" variant="danger" onClick={handleDelete}>
							Excluir
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
