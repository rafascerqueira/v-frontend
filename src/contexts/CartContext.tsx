"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type {
	AuthenticatedCustomer,
	CatalogCustomerData,
	CatalogProduct,
} from "@/lib/api-public";

export interface CartItem {
	product: CatalogProduct;
	quantity: number;
}

interface CartContextType {
	items: CartItem[];
	addItem: (product: CatalogProduct, quantity?: number) => void;
	removeItem: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
	total: number;
	itemCount: number;
	customer: CatalogCustomerData | null;
	authenticatedCustomer: AuthenticatedCustomer | null;
	customerToken: string | null;
	setCustomer: (customer: CatalogCustomerData | null) => void;
	setAuthenticatedCustomer: (
		customer: AuthenticatedCustomer,
		token: string,
	) => void;
	clearCustomerAuth: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [customer, setCustomer] = useState<CatalogCustomerData | null>(null);
	const [customerToken, setCustomerToken] = useState<string | null>(null);

	const authenticatedCustomer =
		customer !== null && customerToken !== null
			? (customer as AuthenticatedCustomer)
			: null;

	const addItem = useCallback((product: CatalogProduct, quantity = 1) => {
		setItems((prev) => {
			const existing = prev.find((item) => item.product.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + quantity }
						: item,
				);
			}
			return [...prev, { product, quantity }];
		});
	}, []);

	const removeItem = useCallback((productId: number) => {
		setItems((prev) => prev.filter((item) => item.product.id !== productId));
	}, []);

	const updateQuantity = useCallback((productId: number, quantity: number) => {
		if (quantity <= 0) {
			setItems((prev) => prev.filter((item) => item.product.id !== productId));
			return;
		}
		setItems((prev) =>
			prev.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item,
			),
		);
	}, []);

	const clearCart = useCallback(() => {
		setItems([]);
	}, []);

	const setAuthenticatedCustomer = useCallback(
		(c: AuthenticatedCustomer, token: string) => {
			setCustomer(c);
			setCustomerToken(token);
		},
		[],
	);

	const clearCustomerAuth = useCallback(() => {
		setCustomer(null);
		setCustomerToken(null);
	}, []);

	// Memoized so storefront consumers only re-render when cart state actually
	// changes, not on every provider render pass.
	const value = useMemo(() => {
		const total = items.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0,
		);
		const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

		return {
			items,
			addItem,
			removeItem,
			updateQuantity,
			clearCart,
			total,
			itemCount,
			customer,
			authenticatedCustomer,
			customerToken,
			setCustomer,
			setAuthenticatedCustomer,
			clearCustomerAuth,
		};
	}, [
		items,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
		customer,
		authenticatedCustomer,
		customerToken,
		setAuthenticatedCustomer,
		clearCustomerAuth,
	]);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
