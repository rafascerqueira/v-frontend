import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiPublic = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface CatalogProduct {
	id: number;
	name: string;
	description: string;
	category: string;
	brand: string;
	unit: string;
	images: string[];
	price: number;
	availableStock: number;
}

export interface CatalogCustomer {
	name: string;
	email: string;
	phone: string;
	document: string;
	address: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	zip_code: string;
}

export interface CatalogCustomerData extends CatalogCustomer {
	id: string;
	firstName: string;
}

export interface CatalogOrderItem {
	product_id: number;
	quantity: number;
}

export interface CreateCatalogOrder {
	customer: CatalogCustomer;
	items: CatalogOrderItem[];
	notes?: string;
}

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

export const catalogApi = {
	getProducts: () => apiPublic.get<CatalogProduct[]>("/catalog/products"),
	getProduct: (id: number) =>
		apiPublic.get<CatalogProduct>(`/catalog/products/${id}`),
	getCustomer: (id: string) =>
		apiPublic.get<CatalogCustomerData>(`/catalog/customers/${id}`),
	createOrder: (data: CreateCatalogOrder) =>
		apiPublic.post<CatalogOrderResponse>("/catalog/orders", data),
};
