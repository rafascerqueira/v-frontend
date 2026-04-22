import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiPublic = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface StoreInfo {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	logo: string | null;
	banner: string | null;
	phone: string | null;
	whatsapp: string | null;
}

export interface CatalogProduct {
	id: number;
	name: string;
	description: string;
	category: string;
	brand: string;
	unit: string;
	images: string[];
	price: number;
	originalPrice?: number;
	availableStock: number;
}

export interface CatalogCustomer {
	name: string;
	phone: string;
	email?: string;
	document?: string;
	address?: string;
	number?: string;
	complement?: string;
	neighborhood?: string;
	city?: string;
	state?: string;
	zip_code?: string;
}

// Data returned from GET /catalog/loja/:slug/customers/:id (personalized link)
export interface CatalogCustomerPublic {
	id: string;
	firstName: string;
	name: string | null;
	phone: string | null;
	email: string | null;
	document: string | null;
	address: string | null;
	number: string | null;
	complement: string | null;
	neighborhood: string | null;
	city: string | null;
	state: string | null;
	zip_code: string | null;
}

// Full data returned after customer authentication
export interface AuthenticatedCustomer extends CatalogCustomerPublic {
	name: string;
	email: string;
	phone: string | null;
	document: string | null;
	address: string;
	number: string;
	complement: string;
	neighborhood: string;
	zip_code: string | null;
}

// Union used in CartContext
export type CatalogCustomerData = CatalogCustomerPublic | AuthenticatedCustomer;

export function isAuthenticatedCustomer(
	c: CatalogCustomerData,
): c is AuthenticatedCustomer {
	return "email" in c;
}

export interface CatalogOrderItem {
	product_id: number;
	quantity: number;
}

export type CreateCatalogOrder =
	| {
			customerId: string;
			customer?: never;
			items: CatalogOrderItem[];
			notes?: string;
	  }
	| {
			customer: CatalogCustomer;
			customerId?: never;
			items: CatalogOrderItem[];
			notes?: string;
	  };

export interface CatalogOrderResponse {
	id: number;
	order_number: string;
	status: string;
	total: number;
	customer: {
		id: string;
		name: string;
		email: string;
		phone: string;
	};
	items: {
		product: { id: number; name: string };
		quantity: number;
		unit_price: number;
		total: number;
	}[];
	message: string;
}

export interface OrderTrackingResponse {
	order_number: string;
	status: "pending" | "confirmed" | "shipping" | "delivered" | "canceled";
	payment_status: "pending" | "confirmed" | "canceled";
	total: number;
	subtotal: number;
	discount: number;
	delivery_date: string | null;
	created_at: string;
	updated_at: string;
	store_name: string;
	items: {
		product: { id: number; name: string } | null;
		quantity: number;
		unit_price: number;
		total: number;
	}[];
}

export interface CustomerLookupResponse {
	found: boolean;
	firstName?: string;
	hasPassword?: boolean;
}

export interface CustomerAuthResponse {
	token: string;
	customer: AuthenticatedCustomer;
}

export const catalogApi = {
	// Store
	getStore: (slug: string) => apiPublic.get<StoreInfo>(`/catalog/loja/${slug}`),
	getStoreProducts: (slug: string) =>
		apiPublic.get<CatalogProduct[]>(`/catalog/loja/${slug}/products`),

	// Customer pre-fill for personalized link, scoped to a store
	getCustomerInStore: (slug: string, customerId: string) =>
		apiPublic.get<CatalogCustomerPublic>(
			`/catalog/loja/${slug}/customers/${customerId}`,
		),

	// Customer identification at checkout
	lookupCustomer: (slug: string, contact: string) =>
		apiPublic.post<CustomerLookupResponse>(
			`/catalog/loja/${slug}/customer/lookup`,
			{ contact },
		),
	authCustomer: (slug: string, contact: string, password: string) =>
		apiPublic.post<CustomerAuthResponse>(
			`/catalog/loja/${slug}/customer/auth`,
			{ contact, password },
		),
	setCustomerPassword: (slug: string, contact: string, password: string) =>
		apiPublic.post<CustomerAuthResponse>(
			`/catalog/loja/${slug}/customer/password`,
			{ contact, password },
		),

	// Orders
	createOrder: (data: CreateCatalogOrder) =>
		apiPublic.post<CatalogOrderResponse>("/catalog/orders", data),
	trackOrder: (orderNumber: string) =>
		apiPublic.get<OrderTrackingResponse>(
			`/catalog/orders/${orderNumber}/track`,
		),
};
