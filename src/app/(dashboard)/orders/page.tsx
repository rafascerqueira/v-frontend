"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	MoreVertical,
	Package,
	Plus,
	Search,
	ShoppingCart,
	Trash2,
	Truck,
	User,
	XCircle,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Customer, Order, Product } from "@/types";

const orderSchema = z.object({
	customer_id: z.string().min(1, "Selecione um cliente"),
	order_number: z.string().min(1, "Número do pedido é obrigatório"),
	notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const statusConfig: Record<
	string,
	{
		label: string;
		variant: "default" | "success" | "warning" | "error" | "info";
		icon: React.ElementType;
	}
> = {
	pending: { label: "Pendente", variant: "warning", icon: Clock },
	confirmed: { label: "Confirmado", variant: "info", icon: CheckCircle },
	shipping: { label: "Em Entrega", variant: "default", icon: Truck },
	delivered: { label: "Entregue", variant: "success", icon: Package },
	canceled: { label: "Cancelado", variant: "error", icon: XCircle },
};

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
	const [activeMenu, setActiveMenu] = useState<number | null>(null);
	const [orderItems, setOrderItems] = useState<
		{ product_id: number; quantity: number; unit_price: number }[]
	>([]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<OrderFormData>({
		resolver: zodResolver(orderSchema),
	});

	const fetchOrders = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/orders");
			setOrders(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Erro ao carregar pedidos");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const fetchCustomers = useCallback(async () => {
		try {
			const { data } = await api.get("/customers");
			setCustomers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error(error);
		}
	}, []);

	const fetchProducts = useCallback(async () => {
		try {
			const { data } = await api.get("/products");
			setProducts(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		fetchOrders();
		fetchCustomers();
		fetchProducts();
	}, [fetchOrders, fetchCustomers, fetchProducts]);

	const generateOrderNumber = () => {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const random = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, "0");
		return `PED-${year}${month}-${random}`;
	};

	const openCreateModal = () => {
		reset({
			customer_id: "",
			order_number: generateOrderNumber(),
			notes: "",
		});
		setOrderItems([]);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		reset();
		setOrderItems([]);
	};

	const addOrderItem = () => {
		setOrderItems([
			...orderItems,
			{ product_id: 0, quantity: 1, unit_price: 0 },
		]);
	};

	const updateOrderItem = (index: number, field: string, value: number) => {
		const updated = [...orderItems];
		updated[index] = { ...updated[index], [field]: value };
		setOrderItems(updated);
	};

	const removeOrderItem = (index: number) => {
		setOrderItems(orderItems.filter((_, i) => i !== index));
	};

	const onSubmit = async (data: OrderFormData) => {
		if (orderItems.length === 0) {
			toast.error("Adicione pelo menos um item ao pedido");
			return;
		}

		const invalidItems = orderItems.some(
			(item) => !item.product_id || item.quantity <= 0 || item.unit_price <= 0,
		);
		if (invalidItems) {
			toast.error("Preencha todos os campos dos itens corretamente");
			return;
		}

		try {
			await api.post("/orders", {
				...data,
				items: orderItems.map((item) => ({
					...item,
					discount: 0,
				})),
			});
			toast.success("Pedido criado com sucesso!");
			closeModal();
			fetchOrders();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao criar pedido";
			toast.error(message);
		}
	};

	const handleUpdateStatus = async (orderId: number, status: string) => {
		try {
			await api.patch(`/orders/${orderId}/status`, { status });
			toast.success("Status atualizado!");
			fetchOrders();
			setActiveMenu(null);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao atualizar status";
			toast.error(message);
		}
	};

	const handleDelete = async () => {
		if (!deletingOrder) return;

		try {
			await api.delete(`/orders/${deletingOrder.id}`);
			toast.success("Pedido excluído com sucesso!");
			setDeletingOrder(null);
			fetchOrders();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir pedido";
			toast.error(message);
		}
	};

	const filteredOrders = orders.filter(
		(order) =>
			order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const orderTotal = orderItems.reduce(
		(acc, item) => acc + item.quantity * item.unit_price,
		0,
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
					<p className="text-gray-500 mt-1">Gerencie seus pedidos de venda</p>
				</div>
				<Button onClick={openCreateModal}>
					<Plus className="h-4 w-4 mr-2" />
					Novo Pedido
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<ShoppingCart className="h-5 w-5 text-indigo-500" />
							Lista de Pedidos
						</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar pedidos..."
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
					) : filteredOrders.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<ShoppingCart className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">Nenhum pedido encontrado</p>
							<p className="text-sm">Comece criando seu primeiro pedido</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Pedido</TableCell>
									<TableCell as="th">Cliente</TableCell>
									<TableCell as="th">Data</TableCell>
									<TableCell as="th">Total</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredOrders.map((order, index) => {
									const status =
										statusConfig[order.status] || statusConfig.pending;
									const StatusIcon = status.icon;
									return (
										<motion.tr
											key={order.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="hover:bg-gray-50 transition-colors"
										>
											<TableCell>
												<code className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
													{order.order_number}
												</code>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-gray-400" />
													<span>
														{order.customer?.name || "Cliente removido"}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Calendar className="h-3.5 w-3.5" />
													{formatDate(order.createdAt)}
												</div>
											</TableCell>
											<TableCell>
												<span className="font-medium text-gray-900">
													{formatCurrency(order.total / 100)}
												</span>
											</TableCell>
											<TableCell>
												<Badge
													variant={status.variant}
													className="flex items-center gap-1 w-fit"
												>
													<StatusIcon className="h-3 w-3" />
													{status.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="relative inline-block">
													<button
														type="button"
														onClick={() =>
															setActiveMenu(
																activeMenu === order.id ? null : order.id,
															)
														}
														className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
													>
														<MoreVertical className="h-4 w-4 text-gray-500" />
													</button>
													{activeMenu === order.id && (
														<motion.div
															initial={{ opacity: 0, scale: 0.95 }}
															animate={{ opacity: 1, scale: 1 }}
															className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
														>
															<button
																type="button"
																onClick={() => {
																	setViewingOrder(order);
																	setActiveMenu(null);
																}}
																className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
															>
																<Eye className="h-4 w-4" />
																Ver Detalhes
															</button>
															<div className="border-t border-gray-100 my-1" />
															<p className="px-4 py-1 text-xs text-gray-500 uppercase">
																Atualizar Status
															</p>
															{Object.entries(statusConfig).map(
																([key, config]) => (
																	<button
																		key={key}
																		type="button"
																		onClick={() =>
																			handleUpdateStatus(order.id, key)
																		}
																		className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
																	>
																		<config.icon className="h-4 w-4" />
																		{config.label}
																	</button>
																),
															)}
															<div className="border-t border-gray-100 my-1" />
															<button
																type="button"
																onClick={() => {
																	setDeletingOrder(order);
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
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Create Order Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title="Novo Pedido"
				size="xl"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Cliente
							</label>
							<select
								{...register("customer_id")}
								className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								<option value="">Selecione um cliente</option>
								{customers.map((customer) => (
									<option key={customer.id} value={customer.id}>
										{customer.name}
									</option>
								))}
							</select>
							{errors.customer_id && (
								<p className="text-sm text-red-500 mt-1">
									{errors.customer_id.message}
								</p>
							)}
						</div>
						<Input
							label="Número do Pedido"
							{...register("order_number")}
							error={errors.order_number?.message}
						/>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-700">
								Itens do Pedido
							</label>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={addOrderItem}
							>
								<Plus className="h-4 w-4 mr-1" />
								Adicionar Item
							</Button>
						</div>

						{orderItems.length === 0 ? (
							<div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
								<Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
								<p className="text-sm text-gray-500">Nenhum item adicionado</p>
							</div>
						) : (
							<div className="space-y-2">
								{orderItems.map((item, index) => (
									<div
										key={index}
										className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
									>
										<select
											value={item.product_id}
											onChange={(e) =>
												updateOrderItem(
													index,
													"product_id",
													Number(e.target.value),
												)
											}
											className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										>
											<option value={0}>Selecione um produto</option>
											{products.map((product) => (
												<option key={product.id} value={product.id}>
													{product.name}
												</option>
											))}
										</select>
										<input
											type="number"
											min="1"
											placeholder="Qtd"
											value={item.quantity}
											onChange={(e) =>
												updateOrderItem(
													index,
													"quantity",
													Number(e.target.value),
												)
											}
											className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
										<input
											type="number"
											min="0"
											step="0.01"
											placeholder="Preço (centavos)"
											value={item.unit_price}
											onChange={(e) =>
												updateOrderItem(
													index,
													"unit_price",
													Number(e.target.value),
												)
											}
											className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
										<button
											type="button"
											onClick={() => removeOrderItem(index)}
											className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								))}
								<div className="flex justify-end pt-2 border-t border-gray-200">
									<p className="text-sm font-medium text-gray-900">
										Total: {formatCurrency(orderTotal / 100)}
									</p>
								</div>
							</div>
						)}
					</div>

					<Input
						label="Observações"
						placeholder="Observações do pedido..."
						{...register("notes")}
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={closeModal}>
							Cancelar
						</Button>
						<Button type="submit" isLoading={isSubmitting}>
							Criar Pedido
						</Button>
					</div>
				</form>
			</Modal>

			{/* View Order Modal */}
			<Modal
				isOpen={!!viewingOrder}
				onClose={() => setViewingOrder(null)}
				title={`Pedido ${viewingOrder?.order_number}`}
				size="lg"
			>
				{viewingOrder && (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">Cliente</p>
								<p className="font-medium">{viewingOrder.customer?.name}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Data</p>
								<p className="font-medium">
									{formatDate(viewingOrder.createdAt)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Status</p>
								<Badge
									variant={
										statusConfig[viewingOrder.status]?.variant || "default"
									}
								>
									{statusConfig[viewingOrder.status]?.label ||
										viewingOrder.status}
								</Badge>
							</div>
							<div>
								<p className="text-sm text-gray-500">Total</p>
								<p className="font-medium text-lg">
									{formatCurrency(viewingOrder.total / 100)}
								</p>
							</div>
						</div>
						{viewingOrder.notes && (
							<div>
								<p className="text-sm text-gray-500">Observações</p>
								<p className="text-gray-700">{viewingOrder.notes}</p>
							</div>
						)}
						<div className="flex justify-end pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setViewingOrder(null)}
							>
								Fechar
							</Button>
						</div>
					</div>
				)}
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={!!deletingOrder}
				onClose={() => setDeletingOrder(null)}
				title="Excluir Pedido"
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-gray-600">
						Tem certeza que deseja excluir o pedido{" "}
						<span className="font-semibold">{deletingOrder?.order_number}</span>
						?
					</p>
					<p className="text-sm text-gray-500">
						Esta ação não pode ser desfeita.
					</p>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeletingOrder(null)}
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
