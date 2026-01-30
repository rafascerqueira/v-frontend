"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	History,
	Package,
	Percent,
	Plus,
	Search,
	Tag,
	TrendingDown,
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

const promotionSchema = z.object({
	product_id: z.string().min(1, "Selecione um produto"),
	discount_percent: z
		.number()
		.min(1, "Desconto mínimo 1%")
		.max(99, "Desconto máximo 99%"),
	start_date: z.string().min(1, "Data de início é obrigatória"),
	end_date: z.string().min(1, "Data de fim é obrigatória"),
	description: z.string().optional(),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface Product {
	id: string;
	name: string;
	price: number;
	image_url?: string;
}

interface Promotion {
	id: number;
	product_id: string;
	product: Product;
	discount_percent: number;
	original_price: number;
	promotional_price: number;
	start_date: string;
	end_date: string;
	description?: string;
	status: "active" | "scheduled" | "expired";
	createdAt: string;
}

interface PriceHistory {
	id: number;
	product_id: string;
	old_price: number;
	new_price: number;
	change_type: "manual" | "promotion" | "restock";
	changed_at: string;
}

export default function PromotionsPage() {
	const [promotions, setPromotions] = useState<Promotion[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<PromotionFormData>({
		resolver: zodResolver(promotionSchema),
	});

	const selectedProductId = watch("product_id");
	const discountPercent = watch("discount_percent");

	const fetchPromotions = useCallback(async () => {
		try {
			setLoading(true);
			const [promoRes, productsRes] = await Promise.all([
				api.get("/promotions").catch(() => ({ data: [] })),
				api.get("/products").catch(() => ({ data: { data: [] } })),
			]);
			setPromotions(promoRes.data?.data || promoRes.data || []);
			const prods = productsRes.data?.data || productsRes.data || [];
			setProducts(Array.isArray(prods) ? prods : []);
		} catch (_error) {
			toast.error("Erro ao carregar promoções");
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchPriceHistory = useCallback(async (productId: string) => {
		try {
			const response = await api.get(`/products/${productId}/price-history`);
			setPriceHistory(response.data?.data || response.data || []);
		} catch (_error) {
			setPriceHistory([]);
		}
	}, []);

	useEffect(() => {
		fetchPromotions();
	}, [fetchPromotions]);

	const onSubmit = async (data: PromotionFormData) => {
		try {
			await api.post("/promotions", data);
			toast.success("Promoção criada com sucesso!");
			fetchPromotions();
			setShowModal(false);
			reset();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao criar promoção";
			toast.error(message);
		}
	};

	const handleEndPromotion = async (id: number) => {
		if (!confirm("Deseja encerrar esta promoção?")) return;
		try {
			await api.patch(`/promotions/${id}/end`);
			toast.success("Promoção encerrada!");
			fetchPromotions();
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Erro ao encerrar promoção";
			toast.error(message);
		}
	};

	const openHistoryModal = async (product: Product) => {
		setSelectedProduct(product);
		await fetchPriceHistory(product.id);
		setShowHistoryModal(true);
	};

	const filteredPromotions = promotions.filter((p) =>
		p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const activePromotions = promotions.filter(
		(p) => p.status === "active",
	).length;
	const scheduledPromotions = promotions.filter(
		(p) => p.status === "scheduled",
	).length;

	const selectedProductData = products.find((p) => p.id === selectedProductId);
	const calculatedPrice =
		selectedProductData && discountPercent
			? selectedProductData.price * (1 - discountPercent / 100)
			: 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Promoções
					</h1>
					<p className="text-gray-500 dark:text-gray-400 mt-1">
						Gerencie promoções e histórico de preços
					</p>
				</div>
				<Button
					onClick={() => {
						reset();
						setShowModal(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					Nova Promoção
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
								<Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Ativas</p>
								<p className="text-2xl font-bold text-green-600">
									{activePromotions}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
								<Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Agendadas</p>
								<p className="text-2xl font-bold text-blue-600">
									{scheduledPromotions}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
								<Percent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{promotions.length}
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
					placeholder="Buscar promoção..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Promotions List */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Promoções</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="p-8 text-center text-gray-500">Carregando...</div>
					) : filteredPromotions.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
							<p>Nenhuma promoção encontrada</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableCell as="th">Produto</TableCell>
									<TableCell as="th">Desconto</TableCell>
									<TableCell as="th">Preço Original</TableCell>
									<TableCell as="th">Preço Promocional</TableCell>
									<TableCell as="th">Período</TableCell>
									<TableCell as="th">Status</TableCell>
									<TableCell as="th" className="w-32">
										Ações
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPromotions.map((promo) => (
									<TableRow key={promo.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
													{promo.product?.image_url ? (
														<img
															src={promo.product.image_url}
															alt=""
															className="w-full h-full object-cover rounded-lg"
														/>
													) : (
														<Package className="h-5 w-5 text-gray-400" />
													)}
												</div>
												<span className="font-medium">
													{promo.product?.name || "Produto"}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-red-600 font-bold">
												-{promo.discount_percent}%
											</span>
										</TableCell>
										<TableCell>
											<span className="text-gray-500 line-through">
												{formatCurrency(promo.original_price)}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-green-600 font-bold">
												{formatCurrency(promo.promotional_price)}
											</span>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<p>
													{new Date(promo.start_date).toLocaleDateString(
														"pt-BR",
													)}
												</p>
												<p className="text-gray-500">
													até{" "}
													{new Date(promo.end_date).toLocaleDateString("pt-BR")}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<span
												className={`px-2 py-1 text-xs font-medium rounded-full ${
													promo.status === "active"
														? "bg-green-100 text-green-700"
														: promo.status === "scheduled"
															? "bg-blue-100 text-blue-700"
															: "bg-gray-100 text-gray-700"
												}`}
											>
												{promo.status === "active"
													? "Ativa"
													: promo.status === "scheduled"
														? "Agendada"
														: "Expirada"}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() =>
														promo.product && openHistoryModal(promo.product)
													}
													className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
													title="Histórico de preços"
												>
													<History className="h-4 w-4" />
												</button>
												{promo.status === "active" && (
													<button
														type="button"
														onClick={() => handleEndPromotion(promo.id)}
														className="p-2 hover:bg-red-50 rounded-lg text-red-500"
														title="Encerrar promoção"
													>
														<X className="h-4 w-4" />
													</button>
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

			{/* Create Promotion Modal */}
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
									Nova Promoção
								</h2>
							</div>
							<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Produto *
									</label>
									<select
										{...register("product_id")}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
									>
										<option value="">Selecione um produto</option>
										{products.map((product) => (
											<option key={product.id} value={product.id}>
												{product.name} - {formatCurrency(product.price)}
											</option>
										))}
									</select>
									{errors.product_id && (
										<p className="text-red-500 text-xs mt-1">
											{errors.product_id.message}
										</p>
									)}
								</div>

								<Input
									label="Desconto (%) *"
									type="number"
									min={1}
									max={99}
									placeholder="Ex: 20"
									error={errors.discount_percent?.message}
									{...register("discount_percent", { valueAsNumber: true })}
								/>

								{selectedProductData && discountPercent > 0 && (
									<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
										<div className="flex items-center gap-2 text-sm">
											<TrendingDown className="h-4 w-4 text-green-600" />
											<span className="text-gray-600 dark:text-gray-400">
												Preço promocional:
											</span>
											<span className="font-bold text-green-600">
												{formatCurrency(calculatedPrice)}
											</span>
										</div>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<Input
										label="Data Início *"
										type="date"
										error={errors.start_date?.message}
										{...register("start_date")}
									/>
									<Input
										label="Data Fim *"
										type="date"
										error={errors.end_date?.message}
										{...register("end_date")}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Descrição (opcional)
									</label>
									<textarea
										{...register("description")}
										placeholder="Ex: Promoção de verão"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
										rows={2}
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
										Criar Promoção
									</Button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Price History Modal */}
			<AnimatePresence>
				{showHistoryModal && selectedProduct && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
						onClick={() => setShowHistoryModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold text-gray-900 dark:text-white">
										Histórico de Preços
									</h2>
									<p className="text-sm text-gray-500">
										{selectedProduct.name}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setShowHistoryModal(false)}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
							<div className="p-6 overflow-y-auto max-h-[60vh]">
								{priceHistory.length === 0 ? (
									<p className="text-center text-gray-500 py-8">
										Nenhum histórico de preços encontrado
									</p>
								) : (
									<div className="space-y-3">
										{priceHistory.map((history) => (
											<div
												key={history.id}
												className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
											>
												<div className="flex items-center justify-between mb-2">
													<span
														className={`px-2 py-1 text-xs font-medium rounded-full ${
															history.change_type === "promotion"
																? "bg-green-100 text-green-700"
																: history.change_type === "restock"
																	? "bg-blue-100 text-blue-700"
																	: "bg-gray-100 text-gray-700"
														}`}
													>
														{history.change_type === "promotion"
															? "Promoção"
															: history.change_type === "restock"
																? "Reposição"
																: "Manual"}
													</span>
													<span className="text-xs text-gray-500">
														{new Date(history.changed_at).toLocaleDateString(
															"pt-BR",
														)}
													</span>
												</div>
												<div className="flex items-center gap-3">
													<span className="text-gray-500 line-through">
														{formatCurrency(history.old_price)}
													</span>
													<span className="text-gray-400">→</span>
													<span
														className={`font-bold ${history.new_price < history.old_price ? "text-green-600" : "text-red-600"}`}
													>
														{formatCurrency(history.new_price)}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
