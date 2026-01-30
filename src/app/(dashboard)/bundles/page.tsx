"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
	Box,
	Minus,
	Package,
	Percent,
	Plus,
	Search,
	Trash2,
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

const bundleSchema = z.object({
	name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
	description: z.string().optional(),
	discount_percent: z.number().min(0).max(99).optional(),
});

type BundleFormData = z.infer<typeof bundleSchema>;

interface Product {
	id: string;
	name: string;
	price: number;
	image_url?: string;
}

interface BundleItem {
	product_id: string;
	product: Product;
	quantity: number;
}

interface Bundle {
	id: number;
	name: string;
	description?: string;
	discount_percent: number;
	total_price: number;
	discounted_price: number;
	items: BundleItem[];
	active: boolean;
	createdAt: string;
}

export default function BundlesPage() {
	const [bundles, setBundles] = useState<Bundle[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [selectedItems, setSelectedItems] = useState<
		{ product: Product; quantity: number }[]
	>([]);
	const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<BundleFormData>({
		resolver: zodResolver(bundleSchema),
		defaultValues: {
			discount_percent: 10,
		},
	});

	const discountPercent = watch("discount_percent") || 0;

	const fetchBundles = useCallback(async () => {
		try {
			setLoading(true);
			const [bundlesRes, productsRes] = await Promise.all([
				api.get("/bundles").catch(() => ({ data: [] })),
				api.get("/products").catch(() => ({ data: { data: [] } })),
			]);
			setBundles(bundlesRes.data?.data || bundlesRes.data || []);
			const prods = productsRes.data?.data || productsRes.data || [];
			setProducts(Array.isArray(prods) ? prods : []);
		} catch (_error) {
			toast.error("Erro ao carregar kits");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBundles();
	}, [fetchBundles]);

	const totalPrice = selectedItems.reduce(
		(acc, item) => acc + item.product.price * item.quantity,
		0,
	);
	const discountedPrice = totalPrice * (1 - discountPercent / 100);

	const addProduct = (product: Product) => {
		const existing = selectedItems.find((i) => i.product.id === product.id);
		if (existing) {
			setSelectedItems(
				selectedItems.map((i) =>
					i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
				),
			);
		} else {
			setSelectedItems([...selectedItems, { product, quantity: 1 }]);
		}
	};

	const updateQuantity = (productId: string, delta: number) => {
		setSelectedItems(
			selectedItems
				.map((i) =>
					i.product.id === productId
						? { ...i, quantity: Math.max(0, i.quantity + delta) }
						: i,
				)
				.filter((i) => i.quantity > 0),
		);
	};

	const removeProduct = (productId: string) => {
		setSelectedItems(selectedItems.filter((i) => i.product.id !== productId));
	};

	const onSubmit = async (data: BundleFormData) => {
		if (selectedItems.length < 2) {
			toast.error("Selecione pelo menos 2 produtos para o kit");
			return;
		}

		try {
			const payload = {
				...data,
				items: selectedItems.map((i) => ({
					product_id: i.product.id,
					quantity: i.quantity,
				})),
			};

			if (editingBundle) {
				await api.patch(`/bundles/${editingBundle.id}`, payload);
				toast.success("Kit atualizado com sucesso!");
			} else {
				await api.post("/bundles", payload);
				toast.success("Kit criado com sucesso!");
			}
			fetchBundles();
			closeModal();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao salvar kit";
			toast.error(message);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Deseja excluir este kit?")) return;
		try {
			await api.delete(`/bundles/${id}`);
			toast.success("Kit excluído!");
			fetchBundles();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao excluir kit";
			toast.error(message);
		}
	};

	const openEditModal = (bundle: Bundle) => {
		setEditingBundle(bundle);
		reset({
			name: bundle.name,
			description: bundle.description || "",
			discount_percent: bundle.discount_percent,
		});
		setSelectedItems(
			bundle.items.map((i) => ({ product: i.product, quantity: i.quantity })),
		);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingBundle(null);
		setSelectedItems([]);
		reset();
	};

	const filteredBundles = bundles.filter((b) =>
		b.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Kits de Produtos
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Crie pacotes de produtos com desconto
					</p>
				</div>
				<Button
					onClick={() => {
						reset();
						setSelectedItems([]);
						setEditingBundle(null);
						setShowModal(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Novo Kit
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
								<Box className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total de Kits</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{bundles.length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
								<Package className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Kits Ativos</p>
								<p className="text-2xl font-bold text-green-600">
									{bundles.filter((b) => b.active).length}
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
					placeholder="Buscar kit..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Bundles List */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Kits</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					) : filteredBundles.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<Box className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>Nenhum kit encontrado</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Nome</TableCell>
									<TableCell as="th">Produtos</TableCell>
									<TableCell as="th">Desconto</TableCell>
									<TableCell as="th">Preço Original</TableCell>
									<TableCell as="th">Preço do Kit</TableCell>
									<TableCell as="th" className="w-32">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredBundles.map((bundle) => (
									<TableRow key={bundle.id}>
										<TableCell>
											<div>
												<p className="font-medium text-gray-900 dark:text-white">
													{bundle.name}
												</p>
												{bundle.description && (
													<p className="text-sm text-gray-500">
														{bundle.description}
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{bundle.items?.slice(0, 3).map((item) => (
													<span
														key={item.product_id}
														className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
													>
														{item.product?.name} x{item.quantity}
													</span>
												))}
												{bundle.items?.length > 3 && (
													<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
														+{bundle.items.length - 3}
													</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<span className="text-red-600 font-bold">
												-{bundle.discount_percent}%
											</span>
										</TableCell>
										<TableCell>
											<span className="text-gray-500 line-through">
												{formatCurrency(bundle.total_price)}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-green-600 font-bold">
												{formatCurrency(bundle.discounted_price)}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() => openEditModal(bundle)}
													className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
												>
													<Package className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => handleDelete(bundle.id)}
													className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Create/Edit Bundle Modal */}
			<AnimatePresence>
				{showModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={closeModal}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									{editingBundle ? "Editar Kit" : "Novo Kit"}
								</h2>
								<button
									type="button"
									onClick={closeModal}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="p-6 space-y-4 overflow-y-auto max-h-[70vh]"
							>
								<Input
									label="Nome do Kit *"
									placeholder="Ex: Kit Verão"
									error={errors.name?.message}
									{...register("name")}
								/>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Descrição
									</label>
									<textarea
										{...register("description")}
										placeholder="Descrição do kit..."
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
										rows={2}
									/>
								</div>

								<Input
									label="Desconto (%)"
									type="number"
									min={0}
									max={99}
									placeholder="Ex: 15"
									error={errors.discount_percent?.message}
									{...register("discount_percent", { valueAsNumber: true })}
								/>

								{/* Product Selection */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Adicionar Produtos
									</label>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
										{products.map((product) => (
											<button
												key={product.id}
												type="button"
												onClick={() => addProduct(product)}
												className="p-2 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 transition-colors"
											>
												<p className="text-sm font-medium truncate">
													{product.name}
												</p>
												<p className="text-xs text-gray-500">
													{formatCurrency(product.price)}
												</p>
											</button>
										))}
									</div>
								</div>

								{/* Selected Items */}
								{selectedItems.length > 0 && (
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Produtos no Kit
										</label>
										<div className="space-y-2">
											{selectedItems.map((item) => (
												<div
													key={item.product.id}
													className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
												>
													<div className="flex-1">
														<p className="font-medium text-sm">
															{item.product.name}
														</p>
														<p className="text-xs text-gray-500">
															{formatCurrency(item.product.price)} x{" "}
															{item.quantity} ={" "}
															{formatCurrency(
																item.product.price * item.quantity,
															)}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() =>
																updateQuantity(item.product.id, -1)
															}
															className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
														>
															<Minus className="h-4 w-4" />
														</button>
														<span className="w-8 text-center font-medium">
															{item.quantity}
														</span>
														<button
															type="button"
															onClick={() => updateQuantity(item.product.id, 1)}
															className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
														>
															<Plus className="h-4 w-4" />
														</button>
														<button
															type="button"
															onClick={() => removeProduct(item.product.id)}
															className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Price Summary */}
								{selectedItems.length > 0 && (
									<div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-gray-600 dark:text-gray-400">
												Preço Original:
											</span>
											<span className="line-through text-gray-500">
												{formatCurrency(totalPrice)}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
												<Percent className="h-4 w-4" />
												Desconto ({discountPercent}%):
											</span>
											<span className="text-red-600">
												-{formatCurrency(totalPrice - discountedPrice)}
											</span>
										</div>
										<div className="flex justify-between font-bold border-t border-indigo-200 dark:border-indigo-800 pt-2">
											<span>Preço do Kit:</span>
											<span className="text-green-600">
												{formatCurrency(discountedPrice)}
											</span>
										</div>
									</div>
								)}

								<div className="flex gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={closeModal}
									>
										Cancelar
									</Button>
									<Button
										type="submit"
										className="flex-1"
										isLoading={isSubmitting}
										disabled={selectedItems.length < 2}
									>
										{editingBundle ? "Salvar" : "Criar Kit"}
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
