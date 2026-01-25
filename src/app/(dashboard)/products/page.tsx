"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	Edit2,
	MoreVertical,
	Package,
	Plus,
	Search,
	Trash2,
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
import type { Product } from "@/types";

const productSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	description: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres"),
	sku: z.string().min(3, "SKU deve ter pelo menos 3 caracteres"),
	category: z.string().min(2, "Categoria é obrigatória"),
	brand: z.string().min(2, "Marca é obrigatória"),
	unit: z.string().min(1, "Unidade é obrigatória"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [activeMenu, setActiveMenu] = useState<number | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormData>({
		resolver: zodResolver(productSchema),
	});

	const fetchProducts = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data } = await api.get("/products");
			setProducts(Array.isArray(data) ? data : []);
		} catch (error) {
			toast.error("Erro ao carregar produtos");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const openCreateModal = () => {
		setEditingProduct(null);
		reset({
			name: "",
			description: "",
			sku: "",
			category: "",
			brand: "",
			unit: "un",
		});
		setIsModalOpen(true);
	};

	const openEditModal = (product: Product) => {
		setEditingProduct(product);
		reset({
			name: product.name,
			description: product.description,
			sku: product.sku,
			category: product.category,
			brand: product.brand,
			unit: product.unit,
		});
		setIsModalOpen(true);
		setActiveMenu(null);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingProduct(null);
		reset();
	};

	const onSubmit = async (data: ProductFormData) => {
		try {
			if (editingProduct) {
				await api.patch(`/products/${editingProduct.id}`, data);
				toast.success("Produto atualizado com sucesso!");
			} else {
				await api.post("/products", {
					...data,
					specifications: {},
					images: [],
				});
				toast.success("Produto criado com sucesso!");
			}
			closeModal();
			fetchProducts();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao salvar produto";
			toast.error(message);
		}
	};

	const handleDelete = async () => {
		if (!deletingProduct) return;

		try {
			await api.delete(`/products/${deletingProduct.id}`);
			toast.success("Produto excluído com sucesso!");
			setDeletingProduct(null);
			fetchProducts();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir produto";
			toast.error(message);
		}
	};

	const filteredProducts = products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
					<p className="text-gray-500 mt-1">
						Gerencie seu catálogo de produtos
					</p>
				</div>
				<Button onClick={openCreateModal}>
					<Plus className="h-4 w-4 mr-2" />
					Novo Produto
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5 text-indigo-500" />
							Lista de Produtos
						</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar produtos..."
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
					) : filteredProducts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<Package className="h-12 w-12 mb-4 text-gray-300" />
							<p className="text-lg font-medium">Nenhum produto encontrado</p>
							<p className="text-sm">Comece adicionando seu primeiro produto</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Produto</TableCell>
									<TableCell as="th">SKU</TableCell>
									<TableCell as="th">Categoria</TableCell>
									<TableCell as="th">Marca</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts.map((product, index) => (
									<motion.tr
										key={product.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50 transition-colors"
									>
										<TableCell>
											<div>
												<p className="font-medium text-gray-900">
													{product.name}
												</p>
												<p className="text-sm text-gray-500 truncate max-w-xs">
													{product.description}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<code className="px-2 py-1 bg-gray-100 rounded text-xs">
												{product.sku}
											</code>
										</TableCell>
										<TableCell>{product.category}</TableCell>
										<TableCell>{product.brand}</TableCell>
										<TableCell>
											<Badge variant={product.active ? "success" : "error"}>
												{product.active ? "Ativo" : "Inativo"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="relative inline-block">
												<button
													type="button"
													onClick={() =>
														setActiveMenu(
															activeMenu === product.id ? null : product.id,
														)
													}
													className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
												>
													<MoreVertical className="h-4 w-4 text-gray-500" />
												</button>
												{activeMenu === product.id && (
													<motion.div
														initial={{ opacity: 0, scale: 0.95 }}
														animate={{ opacity: 1, scale: 1 }}
														className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
													>
														<button
															type="button"
															onClick={() => openEditModal(product)}
															className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
														>
															<Edit2 className="h-4 w-4" />
															Editar
														</button>
														<button
															type="button"
															onClick={() => {
																setDeletingProduct(product);
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
				title={editingProduct ? "Editar Produto" : "Novo Produto"}
				size="lg"
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<Input
						label="Nome do Produto"
						placeholder="Ex: Camiseta Básica"
						error={errors.name?.message}
						{...register("name")}
					/>
					<Input
						label="Descrição"
						placeholder="Descrição detalhada do produto"
						error={errors.description?.message}
						{...register("description")}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="SKU"
							placeholder="Ex: CAM-001"
							error={errors.sku?.message}
							{...register("sku")}
						/>
						<Input
							label="Unidade"
							placeholder="Ex: un, kg, m"
							error={errors.unit?.message}
							{...register("unit")}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Categoria"
							placeholder="Ex: Vestuário"
							error={errors.category?.message}
							{...register("category")}
						/>
						<Input
							label="Marca"
							placeholder="Ex: Nike"
							error={errors.brand?.message}
							{...register("brand")}
						/>
					</div>
					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={closeModal}>
							Cancelar
						</Button>
						<Button type="submit" isLoading={isSubmitting}>
							{editingProduct ? "Salvar Alterações" : "Criar Produto"}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={!!deletingProduct}
				onClose={() => setDeletingProduct(null)}
				title="Excluir Produto"
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-gray-600">
						Tem certeza que deseja excluir o produto{" "}
						<span className="font-semibold">{deletingProduct?.name}</span>?
					</p>
					<p className="text-sm text-gray-500">
						Esta ação não pode ser desfeita.
					</p>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeletingProduct(null)}
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
