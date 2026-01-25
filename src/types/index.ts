export interface Product {
	id: number;
	name: string;
	description: string;
	sku: string;
	category: string;
	brand: string;
	unit: string;
	specifications: Record<string, unknown>;
	images: string[];
	active: boolean;
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
