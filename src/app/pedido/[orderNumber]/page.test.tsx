import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LegacyOrderTrackingPage from "./page";

// The retired route must not reach the API: without a store slug the backend
// can't scope the lookup, and the old unscoped endpoint now answers 410.
const trackOrder = vi.fn();
vi.mock("@/lib/api-public", () => ({
	catalogApi: { trackOrder: (...args: unknown[]) => trackOrder(...args) },
}));

describe("LegacyOrderTrackingPage", () => {
	it("explains the link is gone without calling the tracking API", () => {
		render(<LegacyOrderTrackingPage />);

		expect(
			screen.getByRole("heading", {
				name: "Link de acompanhamento indisponível",
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText(/acesse a loja onde você fez o pedido/i),
		).toBeInTheDocument();
		expect(trackOrder).not.toHaveBeenCalled();
	});
});
