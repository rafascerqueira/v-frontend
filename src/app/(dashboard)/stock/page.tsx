"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	ArrowDownCircle,
	ArrowUpCircle,
	Edit2,
	MoreVertical,
	Package,
	Plus,
	Search,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";

interface StockItem {
	id: number;
	product_id: number;
	quantity: number;
	reserved_quantity: number;
	min_stock: number;
	max_stock: number;
	isLowStock: boolean;
	product: {
		id: number;
		name: string;
		sku: string;
		category: string;
	} | null;
}

export default function StockPage() {
	const [stocks, setStocks] = useState<StockItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState<"all" | "low" | "ok">("all");
	const [editingStock, setEditingStock] = useState<StockItem | null>(null);
	const [editForm, setEditForm] = useState({
		min_stock: 0,
		max_stock: 0,
		quantity: 0,
	});
	const [activeMenu, setActiveMenu] = useState<number | null>(null);
	const [movementModal, setMovementModal] = useState<{
		stock: StockItem;
		type: "in" | "out";
	} | null>(null);
	const [movementForm, setMovementForm] = useState({
		quantity: 1,
		reference_type: "adjustment" as
			| "purchase"
			| "adjustment"
			| "return"
			| "transfer",
		notes: "",
	});
	const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(
		null,
	);
	const [newStockModal, setNewStockModal] = useState(false);

	const fetchStocks = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/store-stock");
			setStocks(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Erro ao carregar estoque");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStocks();
	}, [fetchStocks]);

	const openEditModal = (stock: StockItem) => {
		setEditingStock(stock);
		setEditForm({
			min_stock: stock.min_stock,
			max_stock: stock.max_stock,
			quantity: stock.quantity,
		});
		setActiveMenu(null);
	};

	const handleUpdateStock = async () => {
		if (!editingStock) return;

		try {
			await api.patch(`/store-stock/${editingStock.product_id}`, editForm);
			toast.success("Estoque atualizado!");
			setEditingStock(null);
			fetchStocks();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao atualizar estoque";
			toast.error(message);
		}
	};

	const fetchProducts = useCallback(async () => {
		try {
			const { data: response } = await api.get("/products");
			const prods = response?.data ?? response;
			setProducts(Array.isArray(prods) ? prods : []);
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const openMovementModal = (stock: StockItem, type: "in" | "out") => {
		setMovementModal({ stock, type });
		setMovementForm({ quantity: 1, reference_type: "adjustment", notes: "" });
		setActiveMenu(null);
	};

	const handleMovement = async () => {
		if (!movementModal) return;

		try {
			await api.post("/stock-movements", {
				movement_type: movementModal.type,
				reference_type: movementForm.reference_type,
				reference_id: 0,
				product_id: movementModal.stock.product_id,
				quantity: movementForm.quantity,
			});
			toast.success(
				movementModal.type === "in"
					? "Entrada registrada com sucesso!"
					: "Saída registrada com sucesso!",
			);
			setMovementModal(null);
			fetchStocks();
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Erro ao registrar movimentação";
			toast.error(message);
		}
	};

	const handleCreateStock = async () => {
		if (!selectedProductId) {
			toast.error("Selecione um produto");
			return;
		}

		try {
			await api.patch(`/store-stock/${selectedProductId}`, {
				quantity: 0,
				min_stock: 5,
				max_stock: 100,
			});
			toast.success("Estoque criado!");
			setNewStockModal(false);
			setSelectedProductId(null);
			fetchStocks();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao criar estoque";
			toast.error(message);
		}
	};

	const productsWithoutStock = products.filter(
		(p) => !stocks.some((s) => s.product_id === p.id),
	);

	const filteredStocks = stocks
		.filter((stock) => {
			if (filter === "low") return stock.isLowStock;
			if (filter === "ok") return !stock.isLowStock;
			return true;
		})
		.filter(
			(stock) =>
				stock.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				stock.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
		);

	const lowStockCount = stocks.filter((s) => s.isLowStock).length;
	const totalItems = stocks.reduce((acc, s) => acc + s.quantity, 0);
	const totalReserved = stocks.reduce((acc, s) => acc + s.reserved_quantity, 0);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
					<p className="text-gray-500 mt-1">
						Controle e monitoramento de estoque
					</p>
				</div>
				{productsWithoutStock.length > 0 && (
					<Button onClick={() => setNewStockModal(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Adicionar Produto ao Estoque
					</Button>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Package className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total em Estoque</p>
								<p className="text-2xl font-bold text-gray-900">
									{totalItems.toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<TrendingUp className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Reservado</p>
								<p className="text-2xl font-bold text-gray-900">
									{totalReserved.toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<TrendingDown className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Disponível</p>
								<p className="text-2xl font-bold text-gray-900">
									{(totalItems - totalReserved).toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className={lowStockCount > 0 ? "border-red-200 bg-red-50" : ""}>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div
								className={`p-3 rounded-lg ${lowStockCount > 0 ? "bg-red-100" : "bg-gray-100"}`}
							>
								<AlertTriangle
									className={`h-6 w-6 ${lowStockCount > 0 ? "text-red-600" : "text-gray-600"}`}
								/>
							</div>
							<div>
								<p className="text-sm text-gray-500">Estoque Baixo</p>
								<p
									className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-gray-900"}`}
								>
									{lowStockCount}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Low Stock Alert */}
			{lowStockCount > 0 && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
				>
					<AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
					<div>
						<p className="font-medium text-red-800">
							Atenção: {lowStockCount} produto(s) com estoque baixo
						</p>
						<p className="text-sm text-red-600">
							Verifique os itens marcados e providencie a reposição
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
						onClick={() => setFilter("low")}
					>
						Ver Itens
					</Button>
				</motion.div>
			)}

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5 text-indigo-500" />
							Controle de Estoque
						</CardTitle>
						<div className="flex gap-2">
							<div className="flex bg-gray-100 rounded-lg p-1">
								{[
									{ id: "all", label: "Todos" },
									{ id: "low", label: "Baixo" },
									{ id: "ok", label: "Normal" },
								].map((f) => (
									<button
										key={f.id}
										type="button"
										onClick={() => setFilter(f.id as "all" | "low" | "ok")}
										className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
											filter === f.id
												? "bg-white text-gray-900 shadow-sm"
												: "text-gray-600 hover:text-gray-900"
										}`}
									>
										{f.label}
									</button>
								))}
							</div>
							<div className="relative w-48">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
						</div>
					) : filteredStocks.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<Package className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">
								Nenhum item de estoque encontrado
							</p>
							<p className="text-sm">Configure o estoque dos seus produtos</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Produto</TableCell>
									<TableCell as="th">SKU</TableCell>
									<TableCell as="th">Quantidade</TableCell>
									<TableCell as="th">Reservado</TableCell>
									<TableCell as="th">Mín / Máx</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredStocks.map((stock, index) => (
									<motion.tr
										key={stock.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.03 }}
										className={`hover:bg-gray-50 transition-colors ${stock.isLowStock ? "bg-red-50" : ""}`}
									>
										<TableCell>
											<div className="flex items-center gap-3">
												{stock.isLowStock && (
													<AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
												)}
												<div>
													<p className="font-medium text-gray-900">
														{stock.product?.name || "Produto não encontrado"}
													</p>
													<p className="text-xs text-gray-500">
														{stock.product?.category}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<code className="px-2 py-1 bg-gray-100 rounded text-xs">
												{stock.product?.sku || "-"}
											</code>
										</TableCell>
										<TableCell>
											<span
												className={`font-medium ${stock.isLowStock ? "text-red-600" : "text-gray-900"}`}
											>
												{stock.quantity}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-gray-600">
												{stock.reserved_quantity}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-gray-600">
												{stock.min_stock} / {stock.max_stock}
											</span>
										</TableCell>
										<TableCell>
											<Badge variant={stock.isLowStock ? "error" : "success"}>
												{stock.isLowStock ? "Baixo" : "Normal"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="relative inline-block">
												<button
													type="button"
													onClick={() =>
														setActiveMenu(
															activeMenu === stock.id ? null : stock.id,
														)
													}
													className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
												>
													<MoreVertical className="h-4 w-4 text-gray-500" />
												</button>
												{activeMenu === stock.id && (
													<motion.div
														initial={{ opacity: 0, scale: 0.95 }}
														animate={{ opacity: 1, scale: 1 }}
														className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
													>
														<button
															type="button"
															onClick={() => openMovementModal(stock, "in")}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
														>
															<ArrowUpCircle className="h-4 w-4" />
															Entrada
														</button>
														<button
															type="button"
															onClick={() => openMovementModal(stock, "out")}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
														>
															<ArrowDownCircle className="h-4 w-4" />
															Saída
														</button>
														<button
															type="button"
															onClick={() => openEditModal(stock)}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
														>
															<Edit2 className="h-4 w-4" />
															Editar
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

			{/* Edit Stock Modal */}
			<Modal
				isOpen={!!editingStock}
				onClose={() => setEditingStock(null)}
				title={`Editar Estoque - ${editingStock?.product?.name}`}
				size="sm"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quantidade em Estoque
						</label>
						<input
							type="number"
							min="0"
							value={editForm.quantity}
							onChange={(e) =>
								setEditForm({ ...editForm, quantity: Number(e.target.value) })
							}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Estoque Mínimo
							</label>
							<input
								type="number"
								min="0"
								value={editForm.min_stock}
								onChange={(e) =>
									setEditForm({
										...editForm,
										min_stock: Number(e.target.value),
									})
								}
								className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Estoque Máximo
							</label>
							<input
								type="number"
								min="0"
								value={editForm.max_stock}
								onChange={(e) =>
									setEditForm({
										...editForm,
										max_stock: Number(e.target.value),
									})
								}
								className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setEditingStock(null)}
						>
							Cancelar
						</Button>
						<Button type="button" onClick={handleUpdateStock}>
							Salvar
						</Button>
					</div>
				</div>
			</Modal>

			{/* Movement Modal */}
			<Modal
				isOpen={!!movementModal}
				onClose={() => setMovementModal(null)}
				title={`${movementModal?.type === "in" ? "Entrada" : "Saída"} de Estoque - ${movementModal?.stock.product?.name}`}
				size="sm"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quantidade
						</label>
						<input
							type="number"
							min="1"
							value={movementForm.quantity}
							onChange={(e) =>
								setMovementForm({
									...movementForm,
									quantity: Number(e.target.value),
								})
							}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Motivo
						</label>
						<select
							value={movementForm.reference_type}
							onChange={(e) =>
								setMovementForm({
									...movementForm,
									reference_type: e.target.value as
										| "purchase"
										| "adjustment"
										| "return"
										| "transfer",
								})
							}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							{movementModal?.type === "in" ? (
								<>
									<option value="purchase">Compra/Reposição</option>
									<option value="return">Devolução de Cliente</option>
									<option value="adjustment">Ajuste de Inventário</option>
									<option value="transfer">Transferência</option>
								</>
							) : (
								<>
									<option value="adjustment">Avaria/Vencimento</option>
									<option value="transfer">Transferência</option>
									<option value="return">Devolução ao Fornecedor</option>
								</>
							)}
						</select>
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setMovementModal(null)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							onClick={handleMovement}
							className={
								movementModal?.type === "in"
									? "bg-green-600 hover:bg-green-700"
									: "bg-red-600 hover:bg-red-700"
							}
						>
							{movementModal?.type === "in"
								? "Registrar Entrada"
								: "Registrar Saída"}
						</Button>
					</div>
				</div>
			</Modal>

			{/* New Stock Modal */}
			<Modal
				isOpen={newStockModal}
				onClose={() => {
					setNewStockModal(false);
					setSelectedProductId(null);
				}}
				title="Adicionar Produto ao Estoque"
				size="sm"
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Selecione o Produto
						</label>
						<select
							value={selectedProductId || ""}
							onChange={(e) => setSelectedProductId(Number(e.target.value))}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">Selecione...</option>
							{productsWithoutStock.map((product) => (
								<option key={product.id} value={product.id}>
									{product.name}
								</option>
							))}
						</select>
					</div>
					<p className="text-sm text-gray-500">
						O produto será adicionado com estoque inicial 0. Use a opção
						&quot;Entrada&quot; para adicionar quantidades.
					</p>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setNewStockModal(false);
								setSelectedProductId(null);
							}}
						>
							Cancelar
						</Button>
						<Button type="button" onClick={handleCreateStock}>
							Adicionar
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
