import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderTrackingResponse } from "@/lib/api-public";
import OrderTrackingPage from "./page";

/** Placeholder in the tracking-token format (22 chars). Zero entropy on purpose: secret scanners. */
const TRACKING_TOKEN = "x".repeat(22);

const trackOrder = vi.fn();

vi.mock("@/lib/api-public", () => ({
	catalogApi: {
		trackOrder: (...args: unknown[]) => trackOrder(...args),
	},
}));

vi.mock("next/navigation", () => ({
	useParams: () => ({ slug: "minha-loja", ref: TRACKING_TOKEN }),
}));

vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

// Framer Motion needs browser APIs jsdom lacks; render motion.* as the plain tag.
vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get:
				(_target, tag: string) =>
				({
					children,
					initial: _initial,
					animate: _animate,
					transition: _transition,
					...rest
				}: Record<string, unknown> & { children?: ReactNode }) =>
					createElement(tag, rest, children),
		},
	),
}));

const order: OrderTrackingResponse = {
	order_number: "PED-ABC123",
	status: "confirmed",
	payment_status: "pending",
	total: 4990,
	subtotal: 4990,
	discount: 0,
	delivery_date: null,
	created_at: "2026-11-01T10:00:00.000Z",
	updated_at: "2026-11-01T10:00:00.000Z",
	store_name: "Doces da Maria",
	items: [
		{
			product: { id: 7, name: "Bolo de pote" },
			quantity: 1,
			unit_price: 4990,
			total: 4990,
		},
	],
};

describe("OrderTrackingPage (store-scoped)", () => {
	beforeEach(() => {
		trackOrder.mockReset();
	});

	it("tracks the order by the token in the URL, inside its store, and links back to it", async () => {
		trackOrder.mockResolvedValue({ data: order });

		render(<OrderTrackingPage />);

		expect(await screen.findByText("Doces da Maria")).toBeInTheDocument();
		expect(trackOrder).toHaveBeenCalledWith("minha-loja", TRACKING_TOKEN);
		expect(screen.getByText("Bolo de pote")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Voltar à loja" })).toHaveAttribute(
			"href",
			"/loja/minha-loja",
		);
	});

	it("shows the not-found state with a way back to the store", async () => {
		trackOrder.mockRejectedValue({ response: { status: 404 } });

		render(<OrderTrackingPage />);

		expect(
			await screen.findByRole("heading", { name: "Pedido não encontrado" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /voltar à loja/i }),
		).toHaveAttribute("href", "/loja/minha-loja");
	});
});
