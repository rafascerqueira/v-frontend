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
	createdAt: string;
	updatedAt: string;
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
