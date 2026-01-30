"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
	Building2,
	DollarSign,
	Edit,
	Mail,
	MoreVertical,
	Phone,
	Plus,
	Search,
	Trash2,
	TrendingDown,
	TrendingUp,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const supplierSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	email: z.string().email("Email inválido").optional().or(z.literal("")),
	phone: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional(),
});

const debtSchema = z.object({
	amount: z.number().min(0.01, "Valor deve ser maior que zero"),
	description: z.string().min(2, "Descrição é obrigatória"),
	due_date: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;
type DebtFormData = z.infer<typeof debtSchema>;

interface Supplier {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	notes?: string;
	total_debt: number;
	total_paid: number;
	createdAt: string;
}

interface Debt {
	id: number;
	supplier_id: string;
	amount: number;
	paid_amount: number;
	description: string;
	status: "pending" | "partial" | "paid";
	due_date?: string;
	createdAt: string;
}

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
		null,
	);
	const [debts, setDebts] = useState<Debt[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showDebtModal, setShowDebtModal] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [activeMenu, setActiveMenu] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<SupplierFormData>({
		resolver: zodResolver(supplierSchema),
	});

	const {
		register: registerDebt,
		handleSubmit: handleDebtSubmit,
		reset: resetDebt,
		formState: { errors: debtErrors, isSubmitting: isSubmittingDebt },
	} = useForm<DebtFormData>({
		resolver: zodResolver(debtSchema),
	});

	const fetchSuppliers = useCallback(async () => {
		try {
			setLoading(true);
			const response = await api.get("/suppliers");
			setSuppliers(response.data.data || response.data);
		} catch (_error) {
			toast.error("Erro ao carregar fornecedores");
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchDebts = useCallback(async (supplierId: string) => {
		try {
			const response = await api.get(`/suppliers/${supplierId}/debts`);
			setDebts(response.data.data || response.data);
		} catch (_error) {
			toast.error("Erro ao carregar débitos");
		}
	}, []);

	useEffect(() => {
		fetchSuppliers();
	}, [fetchSuppliers]);

	useEffect(() => {
		if (selectedSupplier) {
			fetchDebts(selectedSupplier.id);
		}
	}, [selectedSupplier, fetchDebts]);

	const onSubmit = async (data: SupplierFormData) => {
		try {
			if (editingSupplier) {
				await api.patch(`/suppliers/${editingSupplier.id}`, data);
				toast.success("Fornecedor atualizado!");
			} else {
				await api.post("/suppliers", data);
				toast.success("Fornecedor criado!");
			}
			fetchSuppliers();
			setShowModal(false);
			setEditingSupplier(null);
			reset();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao salvar fornecedor";
			toast.error(message);
		}
	};

	const onDebtSubmit = async (data: DebtFormData) => {
		if (!selectedSupplier) return;
		try {
			await api.post(`/suppliers/${selectedSupplier.id}/debts`, data);
			toast.success("Débito registrado!");
			fetchDebts(selectedSupplier.id);
			fetchSuppliers();
			setShowDebtModal(false);
			resetDebt();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao registrar débito";
			toast.error(message);
		}
	};

	const handlePayDebt = async (debtId: number, amount: number) => {
		try {
			await api.post(`/suppliers/debts/${debtId}/pay`, { amount });
			toast.success("Pagamento registrado!");
			if (selectedSupplier) {
				fetchDebts(selectedSupplier.id);
			}
			fetchSuppliers();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao registrar pagamento";
			toast.error(message);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;
		try {
			await api.delete(`/suppliers/${id}`);
			toast.success("Fornecedor excluído!");
			fetchSuppliers();
			setActiveMenu(null);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir fornecedor";
			toast.error(message);
		}
	};

	const openEditModal = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		reset({
			name: supplier.name,
			email: supplier.email || "",
			phone: supplier.phone || "",
			address: supplier.address || "",
			notes: supplier.notes || "",
		});
		setShowModal(true);
		setActiveMenu(null);
	};

	const filteredSuppliers = suppliers.filter((s) =>
		s.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const totalDebt = suppliers.reduce((acc, s) => acc + (s.total_debt || 0), 0);
	const totalPaid = suppliers.reduce((acc, s) => acc + (s.total_paid || 0), 0);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Fornecedores
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Gerencie seus fornecedores e débitos
					</p>
				</div>
				<Button
					onClick={() => {
						setEditingSupplier(null);
						reset();
						setShowModal(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Novo Fornecedor
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
								<Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Fornecedores</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{suppliers.length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
								<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total em Débitos</p>
								<p className="text-2xl font-bold text-red-600">
									{formatCurrency(totalDebt)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
								<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total Pago</p>
								<p className="text-2xl font-bold text-green-600">
									{formatCurrency(totalPaid)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
				<Input
					placeholder="Buscar fornecedor..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Suppliers List */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Fornecedores</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					) : filteredSuppliers.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							Nenhum fornecedor encontrado
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Nome</TableCell>
									<TableCell as="th">Contato</TableCell>
									<TableCell as="th">Débito</TableCell>
									<TableCell as="th">Pago</TableCell>
									<TableCell as="th" className="w-20">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredSuppliers.map((supplier) => (
									<TableRow key={supplier.id}>
										<TableCell>
											<button
												type="button"
												onClick={() => setSelectedSupplier(supplier)}
												className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 text-left"
											>
												{supplier.name}
											</button>
										</TableCell>
										<TableCell>
											<div className="text-sm text-gray-500">
												{supplier.email && (
													<div className="flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{supplier.email}
													</div>
												)}
												{supplier.phone && (
													<div className="flex items-center gap-1">
														<Phone className="h-3 w-3" />
														{supplier.phone}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<span className="text-red-600 font-medium">
												{formatCurrency(supplier.total_debt || 0)}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-green-600 font-medium">
												{formatCurrency(supplier.total_paid || 0)}
											</span>
										</TableCell>
										<TableCell>
											<div className="relative">
												<button
													type="button"
													onClick={() =>
														setActiveMenu(
															activeMenu === supplier.id ? null : supplier.id,
														)
													}
													className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
												>
													<MoreVertical className="h-4 w-4 text-gray-500" />
												</button>
												{activeMenu === supplier.id && (
													<motion.div
														initial={{ opacity: 0, scale: 0.95 }}
														animate={{ opacity: 1, scale: 1 }}
														className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
													>
														<button
															type="button"
															onClick={() => openEditModal(supplier)}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
														>
															<Edit className="h-4 w-4" />
															Editar
														</button>
														<button
															type="button"
															onClick={() => {
																setSelectedSupplier(supplier);
																setShowDebtModal(true);
																setActiveMenu(null);
															}}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
														>
															<DollarSign className="h-4 w-4" />
															Registrar Débito
														</button>
														<button
															type="button"
															onClick={() => handleDelete(supplier.id)}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
														>
															<Trash2 className="h-4 w-4" />
															Excluir
														</button>
													</motion.div>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Supplier Details Modal */}
			<AnimatePresence>
				{selectedSupplier && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setSelectedSupplier(null)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										{selectedSupplier.name}
									</h2>
									<p className="text-sm text-gray-500">Débitos do fornecedor</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										size="sm"
										onClick={() => {
											setShowDebtModal(true);
										}}
									>
										<Plus className="h-4 w-4 mr-1" />
										Novo Débito
									</Button>
									<button
										type="button"
										onClick={() => setSelectedSupplier(null)}
										className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
									>
										<X className="h-5 w-5" />
									</button>
								</div>
							</div>
							<div className="p-6 overflow-y-auto max-h-[60vh]">
								{debts.length === 0 ? (
									<p className="text-center text-gray-500 py-8">
										Nenhum débito registrado
									</p>
								) : (
									<div className="space-y-3">
										{debts.map((debt) => (
											<div
												key={debt.id}
												className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
											>
												<div className="flex items-center justify-between mb-2">
													<p className="font-medium text-gray-900 dark:text-white">
														{debt.description}
													</p>
													<span
														className={`px-2 py-1 text-xs font-medium rounded-full ${
															debt.status === "paid"
																? "bg-green-100 text-green-700"
																: debt.status === "partial"
																	? "bg-yellow-100 text-yellow-700"
																	: "bg-red-100 text-red-700"
														}`}
													>
														{debt.status === "paid"
															? "Pago"
															: debt.status === "partial"
																? "Parcial"
																: "Pendente"}
													</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<div>
														<span className="text-gray-500">Valor: </span>
														<span className="text-red-600 font-medium">
															{formatCurrency(debt.amount)}
														</span>
														{debt.paid_amount > 0 && (
															<>
																<span className="text-gray-500 mx-2">|</span>
																<span className="text-gray-500">Pago: </span>
																<span className="text-green-600 font-medium">
																	{formatCurrency(debt.paid_amount)}
																</span>
															</>
														)}
													</div>
													{debt.status !== "paid" && (
														<Button
															size="sm"
															variant="outline"
															onClick={() => {
																const remaining =
																	debt.amount - debt.paid_amount;
																const amount = prompt(
																	`Valor a pagar (máx ${formatCurrency(remaining)}):`,
																);
																if (amount) {
																	const value = parseFloat(
																		amount.replace(",", "."),
																	);
																	if (value > 0 && value <= remaining) {
																		handlePayDebt(debt.id, value * 100);
																	} else {
																		toast.error("Valor inválido");
																	}
																}
															}}
														>
															<DollarSign className="h-3 w-3 mr-1" />
															Pagar
														</Button>
													)}
												</div>
												{debt.due_date && (
													<p className="text-xs text-gray-500 mt-2">
														Vencimento:{" "}
														{new Date(debt.due_date).toLocaleDateString(
															"pt-BR",
														)}
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Supplier Form Modal */}
			<AnimatePresence>
				{showModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setShowModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
								</h2>
							</div>
							<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
								<Input
									label="Nome *"
									placeholder="Nome do fornecedor"
									error={errors.name?.message}
									{...register("name")}
								/>
								<Input
									label="Email"
									type="email"
									placeholder="email@fornecedor.com"
									error={errors.email?.message}
									{...register("email")}
								/>
								<Input
									label="Telefone"
									placeholder="(00) 00000-0000"
									error={errors.phone?.message}
									{...register("phone")}
								/>
								<Input
									label="Endereço"
									placeholder="Cidade, Estado"
									error={errors.address?.message}
									{...register("address")}
								/>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Observações
									</label>
									<textarea
										{...register("notes")}
										placeholder="Notas adicionais..."
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
										rows={3}
									/>
								</div>
								<div className="flex gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={() => setShowModal(false)}
									>
										Cancelar
									</Button>
									<Button
										type="submit"
										className="flex-1"
										isLoading={isSubmitting}
									>
										{editingSupplier ? "Salvar" : "Criar"}
									</Button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Debt Form Modal */}
			<AnimatePresence>
				{showDebtModal && selectedSupplier && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setShowDebtModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Registrar Débito
								</h2>
								<p className="text-sm text-gray-500">{selectedSupplier.name}</p>
							</div>
							<form
								onSubmit={handleDebtSubmit(onDebtSubmit)}
								className="p-6 space-y-4"
							>
								<Input
									label="Descrição *"
									placeholder="Ex: Compra de mercadorias"
									error={debtErrors.description?.message}
									{...registerDebt("description")}
								/>
								<Input
									label="Valor *"
									type="number"
									step="0.01"
									placeholder="0.00"
									error={debtErrors.amount?.message}
									{...registerDebt("amount", { valueAsNumber: true })}
								/>
								<Input
									label="Data de Vencimento"
									type="date"
									error={debtErrors.due_date?.message}
									{...registerDebt("due_date")}
								/>
								<div className="flex gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={() => setShowDebtModal(false)}
									>
										Cancelar
									</Button>
									<Button
										type="submit"
										className="flex-1"
										isLoading={isSubmittingDebt}
									>
										Registrar
									</Button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
