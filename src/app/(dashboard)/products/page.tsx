"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
	Edit2,
	ImagePlus,
	Package,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
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
import { useSubscription } from "@/contexts/SubscriptionContext";
import { api } from "@/lib/api";
import type { Product } from "@/types";

const productSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	description: z.string().optional().or(z.literal("")),
	sku: z.string().optional().or(z.literal("")),
	category: z.string().optional().or(z.literal("")),
	brand: z.string().optional().or(z.literal("")),
	unit: z.string().min(1, "Unidade é obrigatória"),
	allow_oversell: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [priceValue, setPriceValue] = useState<number>(0);
	const [initialStock, setInitialStock] = useState<number>(0);
	const [productImages, setProductImages] = useState<string[]>([]);
	const [uploadingImage, setUploadingImage] = useState(false);
	const { hasFeature } = useSubscription();
	const allowMultipleImages = hasFeature("multipleImages");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormData>({
		resolver: zodResolver(productSchema),
	});

	const fetchProducts = useCallback(async (search?: string) => {
		try {
			setIsLoading(true);
			const { data: response } = await api.get("/products", {
				params: {
					limit: 100,
					...(search ? { search } : {}),
				},
			});
			const products = response?.data ?? response;
			setProducts(Array.isArray(products) ? products : []);
		} catch (error) {
			toast.error("Erro ao carregar produtos");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const handle = setTimeout(() => {
			fetchProducts(searchTerm.trim() || undefined);
		}, 300);
		return () => clearTimeout(handle);
	}, [fetchProducts, searchTerm]);

	const openCreateModal = () => {
		setEditingProduct(null);
		setPriceValue(0);
		setInitialStock(0);
		setProductImages([]);
		reset({
			name: "",
			description: "",
			sku: "",
			category: "",
			brand: "",
			unit: "un",
			allow_oversell: false,
		});
		setIsModalOpen(true);
	};

	const openEditModal = (product: Product) => {
		setEditingProduct(product);
		const currentPrice = product.prices?.[0]?.price ?? 0;
		setPriceValue(currentPrice);
		setProductImages(product.images ?? []);
		reset({
			name: product.name,
			description: product.description ?? "",
			sku: product.sku ?? "",
			category: product.category ?? "",
			brand: product.brand ?? "",
			unit: product.unit,
			allow_oversell: product.allow_oversell ?? false,
		});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingProduct(null);
		setProductImages([]);
		reset();
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Multiple images is a Pro feature; cap free sellers at a single image
		// (the backend rejects > 1 on save as well).
		if (
			!allowMultipleImages &&
			(productImages.length >= 1 || files.length > 1)
		) {
			toast.error(
				"Adicionar várias imagens por produto está disponível no plano Pro. Faça upgrade para acessar.",
			);
			e.target.value = "";
			return;
		}

		try {
			setUploadingImage(true);
			const uploaded: string[] = [];
			for (const file of Array.from(files)) {
				const formData = new FormData();
				formData.append("file", file);
				const response = await api.post("/upload/product", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				uploaded.push(response.data.url);
			}
			setProductImages((prev) => [...prev, ...uploaded]);
			toast.success(
				uploaded.length === 1
					? "Imagem enviada!"
					: `${uploaded.length} imagens enviadas!`,
			);
		} catch (error: unknown) {
			const e = error as { response?: { data?: { message?: string } } };
			toast.error(e.response?.data?.message ?? "Erro ao enviar imagem");
		} finally {
			setUploadingImage(false);
			// Reset input so the same file can be re-selected
			e.target.value = "";
		}
	};

	const removeImage = (url: string) => {
		setProductImages((prev) => prev.filter((u) => u !== url));
	};

	const onSubmit = async (data: ProductFormData) => {
		try {
			const productData = data;
			let productId: number;

			if (editingProduct) {
				await api.patch(`/products/${editingProduct.id}`, {
					...productData,
					images: productImages,
				});
				productId = editingProduct.id;
				toast.success("Produto atualizado com sucesso!");
			} else {
				const { data: newProduct } = await api.post("/products", {
					...productData,
					specifications: {},
					images: productImages,
				});
				productId = newProduct.id;
				toast.success("Produto criado com sucesso!");
			}

			// Save price if provided (priceValue is already in cents)
			if (priceValue > 0) {
				await api.post(`/products/${productId}/prices`, {
					price: priceValue,
					price_type: "sale",
				});
			}

			// Set initial stock if provided (only for new products)
			if (!editingProduct && initialStock && initialStock > 0) {
				await api.post("/stock-movements", {
					movement_type: "in",
					reference_type: "adjustment",
					reference_id: productId,
					product_id: productId,
					quantity: initialStock,
				});
			}

			closeModal();
			fetchProducts(searchTerm.trim() || undefined);
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
			fetchProducts(searchTerm.trim() || undefined);
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir produto";
			toast.error(message);
		}
	};

	const filteredProducts = products;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Produtos
					</h1>
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
							<Package className="h-5 w-5 text-primary-500" />
							Lista de Produtos
						</CardTitle>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar produtos..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
									<TableCell as="th">Preço</TableCell>
									<TableCell as="th">Estoque</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="text-right">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								<AnimatePresence>
									{filteredProducts.map((product, index) => (
										<motion.tr
											key={product.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											exit={{ opacity: 0, x: -20 }}
											className="hover:bg-surface-muted transition-colors"
										>
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
														{product.images?.[0] ? (
															<img
																src={product.images[0]}
																alt={product.name}
																loading="lazy"
																decoding="async"
																className="w-full h-full object-cover"
															/>
														) : (
															<Package className="w-5 h-5 text-gray-400" />
														)}
													</div>
													<div className="min-w-0">
														<p className="font-medium text-gray-900 dark:text-white truncate">
															{product.name}
														</p>
														<p className="text-sm text-gray-500 truncate max-w-xs">
															{product.description}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
													{product.sku || "-"}
												</code>
											</TableCell>
											<TableCell>
												{product.prices?.[0]?.price
													? `R$ ${(product.prices[0].price / 100).toFixed(2)}`
													: "-"}
											</TableCell>
											<TableCell>
												<span
													className={`font-medium ${
														(product.stock?.quantity ?? 0) <=
														(product.stock?.min_stock ?? 0)
															? "text-red-600"
															: "text-gray-900 dark:text-gray-100"
													}`}
												>
													{product.stock?.quantity ?? 0}
												</span>
											</TableCell>
											<TableCell>
												<Badge variant={product.active ? "success" : "error"}>
													{product.active ? "Ativo" : "Inativo"}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<ActionMenu className="w-36">
													<ActionMenuItem
														onClick={() => openEditModal(product)}
													>
														<Edit2 className="h-4 w-4" />
														Editar
													</ActionMenuItem>
													<ActionMenuItem
														variant="danger"
														onClick={() => setDeletingProduct(product)}
													>
														<Trash2 className="h-4 w-4" />
														Excluir
													</ActionMenuItem>
												</ActionMenu>
											</TableCell>
										</motion.tr>
									))}
								</AnimatePresence>
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
					<div>
						<span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
							Imagens do Produto
						</span>
						<div className="flex flex-wrap gap-3">
							{productImages.map((url) => (
								<div
									key={url}
									className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
								>
									<img
										src={url}
										alt="Produto"
										className="w-full h-full object-cover"
									/>
									<button
										type="button"
										onClick={() => removeImage(url)}
										className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
										aria-label="Remover imagem"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							))}
							{(allowMultipleImages || productImages.length === 0) && (
								<label className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-primary-500 hover:text-primary-600 transition-colors">
									<ImagePlus className="w-5 h-5" />
									<span className="text-xs">
										{uploadingImage ? "Enviando..." : "Adicionar"}
									</span>
									<input
										type="file"
										accept="image/*"
										multiple={allowMultipleImages}
										className="hidden"
										onChange={handleImageUpload}
										disabled={uploadingImage}
									/>
								</label>
							)}
						</div>
					</div>
					<Input
						label="Nome do Produto *"
						placeholder="Ex: Camiseta Básica"
						error={errors.name?.message}
						{...register("name")}
					/>
					<Input
						label="Descrição"
						placeholder="Descrição detalhada do produto (opcional)"
						error={errors.description?.message}
						{...register("description")}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="SKU"
							placeholder="Ex: CAM-001 (opcional)"
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
							placeholder="Ex: Vestuário (opcional)"
							error={errors.category?.message}
							{...register("category")}
						/>
						<Input
							label="Marca"
							placeholder="Ex: Nike (opcional)"
							error={errors.brand?.message}
							{...register("brand")}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<CurrencyInput
							label="Preço de Venda"
							value={priceValue}
							onChange={setPriceValue}
							hint="Digite os números - o valor cresce da direita para a esquerda"
						/>
						{!editingProduct && (
							<Input
								label="Estoque Inicial"
								type="number"
								min="0"
								placeholder="Ex: 100"
								value={initialStock || ""}
								onChange={(e) => setInitialStock(Number(e.target.value) || 0)}
							/>
						)}
					</div>
					<label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer">
						<span className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
							<input
								type="checkbox"
								className="sr-only peer"
								{...register("allow_oversell")}
							/>
							<div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
						</span>
						<span className="text-sm">
							<span className="block font-medium text-gray-700 dark:text-gray-300">
								Permitir venda sem estoque
							</span>
							<span className="block text-gray-500 dark:text-gray-400">
								Quando ativo, o produto pode ser vendido pela loja mesmo sem
								estoque (entrega pendente). Não se aplica a pedidos do catálogo.
							</span>
						</span>
					</label>
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
					<p className="text-gray-600 dark:text-gray-400">
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
