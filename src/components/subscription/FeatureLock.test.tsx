import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureLock } from "./FeatureLock";

// Control the subscription state per test. FeatureLock reads hasFeature/loading
// from this hook; the backend FeatureGuard is the real enforcement layer.
const hasFeature = vi.fn();
let loading = false;

vi.mock("@/contexts/SubscriptionContext", () => ({
	useSubscription: () => ({ hasFeature, loading }),
}));

describe("FeatureLock", () => {
	beforeEach(() => {
		hasFeature.mockReset();
		loading = false;
	});

	it("renders children when the effective plan includes the feature", () => {
		hasFeature.mockReturnValue(true);

		render(
			<FeatureLock feature="reports">
				<div>Conteúdo dos relatórios</div>
			</FeatureLock>,
		);

		expect(screen.getByText("Conteúdo dos relatórios")).toBeInTheDocument();
		expect(screen.queryByText("Fazer upgrade")).not.toBeInTheDocument();
	});

	it("renders the locked state with an upgrade CTA when the feature is missing", () => {
		hasFeature.mockReturnValue(false);

		render(
			<FeatureLock feature="reports">
				<div>Conteúdo dos relatórios</div>
			</FeatureLock>,
		);

		expect(
			screen.queryByText("Conteúdo dos relatórios"),
		).not.toBeInTheDocument();
		expect(screen.getByText("Relatórios é um recurso Pro")).toBeInTheDocument();

		const cta = screen.getByRole("link", { name: /fazer upgrade/i });
		expect(cta).toHaveAttribute("href", "/plans");
	});

	it("renders children while the subscription is still loading (no lock flash)", () => {
		loading = true;
		hasFeature.mockReturnValue(false);

		render(
			<FeatureLock feature="reports">
				<div>Conteúdo dos relatórios</div>
			</FeatureLock>,
		);

		expect(screen.getByText("Conteúdo dos relatórios")).toBeInTheDocument();
		expect(hasFeature).not.toHaveBeenCalled();
	});
});
