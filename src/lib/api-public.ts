import axios from "axios";
import { withIdempotencyKey } from "./idempotency";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiPublic = axios.create({
	baseURL: API_URL,
	// Public storefront endpoints never need the seller session — don't ship the
	// auth cookie here (least privilege; avoids leaking it to public routes).
	withCredentials: false,
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
	/**
	 * Unguessable handle for the public tracking link (order numbers are
	 * sequential per store since backend Phase 1A). Absent from older backends.
	 */
	tracking_token?: string | null;
	status: string;
	total: number;
	// The caller is anonymous: only the first name comes back, never stored data.
	customer: { firstName: string } | null;
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
	// Step 1: email a one-time code to the customer's registered email.
	requestCustomerOtp: (slug: string, contact: string) =>
		apiPublic.post<{ message: string }>(
			`/catalog/loja/${slug}/customer/password/request`,
			{ contact },
		),
	// Step 2: verify the code and set the first password.
	setCustomerPassword: (
		slug: string,
		contact: string,
		otp: string,
		password: string,
	) =>
		apiPublic.post<CustomerAuthResponse>(
			`/catalog/loja/${slug}/customer/password`,
			{ contact, otp, password },
		),
	// Seller-issued invite: set or reset a password using a one-time token.
	redeemInvite: (slug: string, token: string, password: string) =>
		apiPublic.post<CustomerAuthResponse>(
			`/catalog/loja/${slug}/customer/password/invite`,
			{ token, password },
		),

	// Orders — scoped to the store the customer is browsing; the backend resolves
	// the seller from the slug (never inferred from the posted product ids).
	// Pass an Idempotency-Key (see lib/idempotency) so a retry can't duplicate the order.
	createOrder: (
		slug: string,
		data: CreateCatalogOrder,
		idempotencyKey?: string,
	) =>
		apiPublic.post<CatalogOrderResponse>(
			`/catalog/loja/${slug}/orders`,
			data,
			idempotencyKey ? withIdempotencyKey(idempotencyKey) : undefined,
		),
	// Tracking is scoped to the store too: the backend only finds storefront
	// orders of the seller behind this slug (an unscoped lookup leaked orders).
	// Both segments come from the URL, so encode them to keep them one segment each.
	// `ref` is the order's tracking_token; links issued before backend Phase 1A
	// carry the (then random) order number, which the backend still resolves.
	trackOrder: (slug: string, ref: string) =>
		apiPublic.get<OrderTrackingResponse>(
			`/catalog/loja/${encodeURIComponent(slug)}/orders/${encodeURIComponent(ref)}/track`,
		),
};
