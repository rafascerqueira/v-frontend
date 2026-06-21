export interface ProductPrice {
	id: number;
	price: number;
	price_type: "cost" | "sale" | "wholesale" | "promotional";
	active: boolean;
}

export interface ProductStock {
	id: number;
	quantity: number;
	reserved_quantity: number;
	min_stock: number;
	max_stock: number;
	// Units owed to open orders (sold past stock). The UI shows `quantity` clamped
	// to 0 plus an "aguardando reposição" badge when this is > 0.
	owed_quantity?: number;
	pending_orders_count?: number;
}

export type BackorderStatus = "pending" | "fulfilled" | "canceled";

export interface Backorder {
	id: number;
	order_id: number;
	order_item_id: number;
	product_id: number;
	quantity: number;
	fulfilled_quantity: number;
	status: BackorderStatus;
	fulfilledAt: string | null;
	createdAt: string;
	order?: { id: number; order_number: string; status: string };
	product?: { id: number; name: string } | null;
}

export interface Product {
	id: number;
	name: string;
	description: string | null;
	sku: string | null;
	category: string | null;
	brand: string | null;
	unit: string;
	specifications: Record<string, unknown>;
	images: string[];
	active: boolean;
	allow_oversell: boolean;
	prices?: ProductPrice[];
	stock?: ProductStock | null;
	createdAt: string;
	updatedAt: string;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	phone: string;
	document: string;
	address: Record<string, unknown>;
	city: string;
	state: string;
	zip_code: string;
	active: boolean;
	billing_mode: "per_sale" | "weekly" | "biweekly" | "monthly" | "custom";
	billing_day: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface OrderItem {
	id: number;
	product_id: number;
	quantity: number;
	unit_price: number;
	discount: number;
	total: number;
	product?: { id: number; name: string } | null;
	// Present when this line was sold past stock — drives the per-item
	// "aguardando reposição / reposto" status in the order detail view.
	backorder?: {
		id: number;
		quantity: number;
		fulfilled_quantity: number;
		status: BackorderStatus;
	} | null;
}

export interface Order {
	id: number;
	order_number: string;
	customer_id: string;
	customer?: Customer;
	status: "pending" | "confirmed" | "shipping" | "delivered" | "canceled";
	payment_status: "pending" | "confirmed" | "canceled";
	payment_method: "cash" | "credit_card" | "debit_card" | "pix";
	delivery_date?: string;
	subtotal: number;
	discount: number;
	tax: number;
	shipping: number;
	total: number;
	notes?: string;
	// Included by GET /orders and GET /orders/:id (relation is named Order_item
	// on the backend payload).
	Order_item?: OrderItem[];
	createdAt: string;
	updatedAt: string;
}

export interface DashboardStats {
	totalProducts: number;
	totalCustomers: number;
	totalOrders: number;
	pendingOrders: number;
	totalRevenue: number;
	recentOrders: {
		id: number;
		orderNumber: string;
		customer: string;
		total: number;
		status: string;
		createdAt: string;
	}[];
	topProducts: {
		name: string;
		sales: number;
	}[];
}

export interface User {
	id: string;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
