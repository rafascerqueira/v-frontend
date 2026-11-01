import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import type { Toast } from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	notifyCheckoutError,
	SUBSCRIPTION_EXISTS_TOAST_DURATION_MS,
	SUBSCRIPTION_EXISTS_TOAST_ID,
	SubscriptionExistsToast,
} from "./SubscriptionExistsToast";

// react-hot-toast's default export is a callable with methods; mock exactly the
// surface notifyCheckoutError touches so the toast body can be rendered directly,
// without a <Toaster /> (which needs matchMedia/timers in jsdom).
const toastMock = vi.hoisted(() =>
	Object.assign(vi.fn(), { error: vi.fn(), dismiss: vi.fn() }),
);
vi.mock("react-hot-toast", () => ({ default: toastMock, toast: toastMock }));

const MESSAGE =
	'Você já tem uma assinatura. Use "Gerenciar assinatura" para trocar de plano ou atualizar o pagamento.';
const BUTTON_NAME = "Gerenciar assinatura";

function conflict(code: string, message?: string) {
	return {
		response: {
			status: 409,
			data: { statusCode: 409, error: "Conflict", code, message },
		},
	};
}

describe("SubscriptionExistsToast", () => {
	it("shows the message and a real 'Gerenciar assinatura' button", () => {
		render(<SubscriptionExistsToast message={MESSAGE} onManage={vi.fn()} />);

		expect(screen.getByText(MESSAGE)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: BUTTON_NAME })).toHaveAttribute(
			"type",
			"button",
		);
	});

	it("calls onManage once when the button is clicked", async () => {
		const onManage = vi.fn();
		render(<SubscriptionExistsToast message={MESSAGE} onManage={onManage} />);

		await userEvent.click(screen.getByRole("button", { name: BUTTON_NAME }));

		expect(onManage).toHaveBeenCalledTimes(1);
	});

	it("is reachable and activatable from the keyboard", async () => {
		const onManage = vi.fn();
		const user = userEvent.setup();
		render(<SubscriptionExistsToast message={MESSAGE} onManage={onManage} />);

		await user.tab();
		expect(screen.getByRole("button", { name: BUTTON_NAME })).toHaveFocus();

		await user.keyboard("{Enter}");
		expect(onManage).toHaveBeenCalledTimes(1);
	});
});

describe("notifyCheckoutError", () => {
	beforeEach(() => {
		toastMock.mockReset();
		toastMock.error.mockReset();
		toastMock.dismiss.mockReset();
	});

	it("SUBSCRIPTION_EXISTS: the toast button dismisses it and opens the portal", async () => {
		const onManage = vi.fn();

		notifyCheckoutError(conflict("SUBSCRIPTION_EXISTS", MESSAGE), onManage);

		expect(toastMock).not.toHaveBeenCalled();
		expect(toastMock.error).toHaveBeenCalledTimes(1);
		const [renderable, options] = toastMock.error.mock.calls[0];
		expect(options).toEqual({
			id: SUBSCRIPTION_EXISTS_TOAST_ID,
			duration: SUBSCRIPTION_EXISTS_TOAST_DURATION_MS,
		});
		expect(typeof renderable).toBe("function");

		// react-hot-toast calls the renderable with the live toast; only `id` matters.
		const t = { id: "toast-42" } as Toast;
		render((renderable as (t: Toast) => ReactElement)(t));
		expect(screen.getByText(MESSAGE)).toBeInTheDocument();
		expect(onManage).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole("button", { name: BUTTON_NAME }));

		expect(toastMock.dismiss).toHaveBeenCalledWith("toast-42");
		expect(onManage).toHaveBeenCalledTimes(1);
	});

	it("CHECKOUT_IN_PROGRESS: an informational toast, no portal button", () => {
		const onManage = vi.fn();

		notifyCheckoutError(conflict("CHECKOUT_IN_PROGRESS"), onManage);

		expect(toastMock.error).not.toHaveBeenCalled();
		expect(toastMock).toHaveBeenCalledWith(
			"Já existe um pagamento sendo iniciado. Aguarde alguns segundos.",
			{ icon: "⏳" },
		);
		expect(onManage).not.toHaveBeenCalled();
	});

	it("any other error: the generic error toast", () => {
		const onManage = vi.fn();

		notifyCheckoutError(new Error("Network Error"), onManage);

		expect(toastMock).not.toHaveBeenCalled();
		expect(toastMock.error).toHaveBeenCalledWith(
			"Erro ao iniciar pagamento. Tente novamente.",
		);
		expect(onManage).not.toHaveBeenCalled();
	});
});
