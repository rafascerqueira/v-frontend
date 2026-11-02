import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LedgerEntry } from "@/lib/billing-ledger";
import { PaymentHistory } from "./payment-history";

const { get, post, toastSuccess, toastError } = vi.hoisted(() => ({
	get: vi.fn(),
	post: vi.fn(),
	toastSuccess: vi.fn(),
	toastError: vi.fn(),
}));

vi.mock("@/lib/api", () => ({ api: { get, post } }));
vi.mock("@/components/ui/toast", () => ({
	toast: { success: toastSuccess, error: toastError },
}));
// Framer Motion needs browser APIs jsdom lacks; render motion.* as the plain tag.
// Components are cached per tag: a fresh function on every access would make React
// remount the subtree on each render (and stale any element a test holds).
vi.mock("framer-motion", () => {
	const cache = new Map<string, (props: Record<string, unknown>) => unknown>();
	const component =
		(tag: string) =>
		({
			children,
			initial: _i,
			animate: _a,
			exit: _e,
			transition: _t,
			...rest
		}: Record<string, unknown> & { children?: ReactNode }) =>
			createElement(tag, rest, children);
	return {
		AnimatePresence: ({ children }: { children?: ReactNode }) => children,
		motion: new Proxy(
			{},
			{
				get: (_target, tag: string) => {
					if (!cache.has(tag)) cache.set(tag, component(tag));
					return cache.get(tag);
				},
			},
		),
	};
});

const entry = (over: Partial<LedgerEntry>): LedgerEntry => ({
	id: 1,
	billing_id: 7,
	kind: "payment",
	amount: 3000,
	method: "pix",
	paid_at: "2026-11-01T12:00:00.000Z",
	note: null,
	created_by: "seller-1",
	reversal_of_id: null,
	created_at: "2026-11-01T12:00:00.000Z",
	...over,
});

describe("PaymentHistory", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists payments and reversals; only a payment not yet reversed can be reversed", async () => {
		get.mockResolvedValue({
			data: [
				entry({ id: 1, amount: 3000 }),
				entry({ id: 2, amount: 2000, method: "cash" }),
				entry({
					id: 3,
					kind: "reversal",
					amount: 3000,
					reversal_of_id: 1,
					note: "Duplicado",
				}),
			],
		});

		render(<PaymentHistory billingId={7} onChanged={vi.fn()} />);

		expect(await screen.findByText("Estornado")).toBeInTheDocument();
		expect(get).toHaveBeenCalledWith("/billings/7/payments");
		expect(screen.getByText(/Estorno · PIX/)).toBeInTheDocument();
		const reverseButtons = screen.getAllByRole("button", {
			name: /Estornar pagamento/,
		});
		expect(reverseButtons).toHaveLength(1);
		expect(reverseButtons[0]).toHaveAccessibleName(/R\$\s20,00/);
	});

	it("shows an empty state", async () => {
		get.mockResolvedValue({ data: [] });

		render(<PaymentHistory billingId={7} onChanged={vi.fn()} />);

		expect(
			await screen.findByText("Nenhum pagamento registrado."),
		).toBeInTheDocument();
	});

	it("reverses with a mandatory reason, an Idempotency-Key, and reports the updated charge", async () => {
		get.mockResolvedValue({ data: [entry({ id: 1, amount: 3000 })] });
		const updated = {
			id: 7,
			paid_amount: 0,
			status: "pending",
			payment_status: "pending",
			payment_method: "pix",
		};
		post.mockResolvedValue({
			data: { reversal: entry({ id: 2, kind: "reversal" }), billing: updated },
		});
		const onChanged = vi.fn();

		render(<PaymentHistory billingId={7} onChanged={onChanged} />);
		fireEvent.click(
			await screen.findByRole("button", { name: /Estornar pagamento/ }),
		);

		const dialog = screen.getByRole("dialog", { name: "Estornar pagamento" });
		const confirm = screen.getByRole("button", { name: "Confirmar estorno" });
		expect(dialog).toBeInTheDocument();
		expect(confirm).toBeDisabled();

		fireEvent.change(screen.getByLabelText("Motivo do estorno"), {
			target: { value: "  Lançado em duplicidade  " },
		});
		fireEvent.click(confirm);

		await waitFor(() => expect(onChanged).toHaveBeenCalledWith(updated));
		const [url, body, config] = post.mock.calls[0];
		expect(url).toBe("/billings/7/payments/1/reverse");
		expect(body).toEqual({ reason: "Lançado em duplicidade" });
		expect(config.headers["Idempotency-Key"]).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
		expect(toastSuccess).toHaveBeenCalledWith("Pagamento estornado");
	});

	it("shows the backend's message when the reversal is refused", async () => {
		get.mockResolvedValue({ data: [entry({ id: 1 })] });
		post.mockRejectedValue({
			response: {
				status: 409,
				data: {
					message: "Este pagamento já foi estornado.",
					code: "ALREADY_REVERSED",
				},
			},
		});

		render(<PaymentHistory billingId={7} onChanged={vi.fn()} />);
		fireEvent.click(
			await screen.findByRole("button", { name: /Estornar pagamento/ }),
		);
		fireEvent.change(screen.getByLabelText("Motivo do estorno"), {
			target: { value: "Duplicado" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Confirmar estorno" }));

		await waitFor(() =>
			expect(toastError).toHaveBeenCalledWith(
				"Este pagamento já foi estornado.",
			),
		);
	});

	it("closes the confirmation with Escape", async () => {
		get.mockResolvedValue({ data: [entry({ id: 1 })] });

		render(<PaymentHistory billingId={7} onChanged={vi.fn()} />);
		fireEvent.click(
			await screen.findByRole("button", { name: /Estornar pagamento/ }),
		);
		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(post).not.toHaveBeenCalled();
	});
});
