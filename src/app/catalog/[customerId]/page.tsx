"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Minus,
	Package,
	Plus,
	Search,
	ShoppingCart,
	Store,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/CartContext";
import { type CatalogProduct, catalogApi } from "@/lib/api-public";

function formatCurrency(value: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

function ProductCard({ product }: { product: CatalogProduct }) {
	const { addItem, items, updateQuantity, removeItem } = useCart();
	const cartItem = items.find((item) => item.product.id === product.id);
	const quantity = cartItem?.quantity || 0;

	const handleAdd = () => {
		if (product.availableStock <= quantity) {
			toast.error("Estoque insuficiente");
			return;
		}
		addItem(product, 1);
		toast.success(`${product.name} adicionado ao carrinho`);
	};

	const handleIncrease = () => {
		if (product.availableStock <= quantity) {
			toast.error("Estoque insuficiente");
			return;
		}
		updateQuantity(product.id, quantity + 1);
	};

	const handleDecrease = () => {
		if (quantity <= 1) {
			removeItem(product.id);
		} else {
			updateQuantity(product.id, quantity - 1);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
		>
			<div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
				{product.images && product.images.length > 0 ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Package className="w-16 h-16 text-gray-400" />
					</div>
				)}
				{product.availableStock <= 0 && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
							Indisponível
						</span>
					</div>
				)}
				{product.availableStock > 0 && product.availableStock <= 5 && (
					<span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">
						Últimas {product.availableStock} unidades
					</span>
				)}
			</div>

			<div className="p-4">
				<span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
					{product.category}
				</span>
				<h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
					{product.name}
				</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
					{product.description}
				</p>
				<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
					{product.brand} • {product.unit}
				</p>

				<div className="mt-3 flex items-center justify-between">
					<span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
						{formatCurrency(product.price)}
					</span>

					{product.availableStock > 0 &&
						(quantity === 0 ? (
							<button
								type="button"
								onClick={handleAdd}
								className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
							>
								<Plus className="w-4 h-4" />
								Adicionar
							</button>
						) : (
							<div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
								<button
									type="button"
									onClick={handleDecrease}
									className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
								>
									<Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
								</button>
								<span className="w-8 text-center font-medium text-gray-900 dark:text-white">
									{quantity}
								</span>
								<button
									type="button"
									onClick={handleIncrease}
									className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
								>
									<Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
								</button>
							</div>
						))}
				</div>
			</div>
		</motion.div>
	);
}

function CartSidebar({
	isOpen,
	onClose,
	customerId,
}: {
	isOpen: boolean;
	onClose: () => void;
	customerId: string;
}) {
	const { items, total, removeItem, updateQuantity, itemCount } = useCart();

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-40"
					/>
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
					>
						<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<ShoppingCart className="w-5 h-5 text-indigo-600" />
								<h2 className="font-semibold text-gray-900 dark:text-white">
									Carrinho ({itemCount})
								</h2>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
							>
								<X className="w-5 h-5 text-gray-500" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-4 space-y-4">
							{items.length === 0 ? (
								<div className="text-center py-12">
									<ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
									<p className="text-gray-500 dark:text-gray-400">
										Seu carrinho está vazio
									</p>
								</div>
							) : (
								items.map((item) => (
									<div
										key={item.product.id}
										className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
									>
										<div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center shrink-0">
											{item.product.images?.[0] ? (
												<img
													src={item.product.images[0]}
													alt={item.product.name}
													className="w-full h-full object-cover rounded-lg"
												/>
											) : (
												<Package className="w-8 h-8 text-gray-400" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
												{item.product.name}
											</h4>
											<p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
												{formatCurrency(item.product.price)}
											</p>
											<div className="flex items-center gap-2 mt-2">
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.product.id, item.quantity - 1)
													}
													className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
												>
													<Minus className="w-3 h-3" />
												</button>
												<span className="text-sm font-medium w-6 text-center">
													{item.quantity}
												</span>
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.product.id, item.quantity + 1)
													}
													className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
												>
													<Plus className="w-3 h-3" />
												</button>
												<button
													type="button"
													onClick={() => removeItem(item.product.id)}
													className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{items.length > 0 && (
							<div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
								<div className="flex items-center justify-between text-lg font-semibold">
									<span className="text-gray-900 dark:text-white">Total:</span>
									<span className="text-indigo-600 dark:text-indigo-400">
										{formatCurrency(total)}
									</span>
								</div>
								<Link
									href={`/catalog/${customerId}/checkout`}
									onClick={onClose}
									className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-medium transition-colors"
								>
									Finalizar Pedido
								</Link>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

export default function PersonalizedCatalogPage() {
	const params = useParams();
	const customerId = params.customerId as string;
	const { customer, setCustomer, itemCount } = useCart();

	const [products, setProducts] = useState<CatalogProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [cartOpen, setCartOpen] = useState(false);

	useEffect(() => {
		async function loadData() {
			try {
				const [productsRes, customerRes] = await Promise.all([
					catalogApi.getProducts(),
					catalogApi.getCustomer(customerId),
				]);
				setProducts(productsRes.data);
				setCustomer(customerRes.data);
			} catch (_error) {
				toast.error("Erro ao carregar catálogo");
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [customerId, setCustomer]);

	const categories = [...new Set(products.map((p) => p.category))];

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(search.toLowerCase()) ||
			product.description.toLowerCase().includes(search.toLowerCase());
		const matchesCategory =
			!selectedCategory || product.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-30">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
								<Store className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="font-bold text-xl text-gray-900 dark:text-white">
									Catálogo
								</h1>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Vendinhas
								</p>
							</div>
						</div>

						{/* Customer indicator */}
						{customer && (
							<div className="hidden sm:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
								<User className="w-4 h-4 text-green-600 dark:text-green-400" />
								<span className="text-sm font-medium text-green-700 dark:text-green-300">
									Olá, {customer.firstName}!
								</span>
							</div>
						)}

						<button
							type="button"
							onClick={() => setCartOpen(true)}
							className="relative p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
						>
							<ShoppingCart className="w-5 h-5" />
							{itemCount > 0 && (
								<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
									{itemCount > 9 ? "9+" : itemCount}
								</span>
							)}
						</button>
					</div>

					{/* Customer banner on mobile */}
					{customer && (
						<div className="mt-3 sm:hidden flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
							<User className="w-4 h-4 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-green-700 dark:text-green-300">
								Olá, {customer.firstName}! Seus dados já estão preenchidos no
								checkout.
							</span>
						</div>
					)}

					{/* Search and Filters */}
					<div className="mt-4 flex flex-col sm:flex-row gap-3">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar produtos..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
							<button
								type="button"
								onClick={() => setSelectedCategory(null)}
								className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
									!selectedCategory
										? "bg-indigo-600 text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								Todos
							</button>
							{categories.map((category) => (
								<button
									type="button"
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
										selectedCategory === category
											? "bg-indigo-600 text-white"
											: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
									}`}
								>
									{category}
								</button>
							))}
						</div>
					</div>
				</div>
			</header>

			{/* Products Grid */}
			<main className="max-w-7xl mx-auto px-4 py-6">
				{loading ? (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse"
							>
								<div className="aspect-square bg-gray-200 dark:bg-gray-700" />
								<div className="p-4 space-y-3">
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
									<div className="flex justify-between">
										<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="text-center py-16">
						<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Nenhum produto encontrado
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mt-1">
							Tente ajustar sua busca ou filtros
						</p>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{filteredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</main>

			{/* Cart Sidebar */}
			<CartSidebar
				isOpen={cartOpen}
				onClose={() => setCartOpen(false)}
				customerId={customerId}
			/>
		</div>
	);
}
