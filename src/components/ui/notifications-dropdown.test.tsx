import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubscriptionInfo } from "@/contexts/SubscriptionContext";
import { NotificationsDropdown } from "./notifications-dropdown";

const push = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

let unreadCount = 0;
vi.mock("@/hooks/useNotifications", () => ({
	useNotifications: () => ({
		notifications: [],
		unreadCount,
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		clearAll: vi.fn(),
	}),
}));

let subscription: SubscriptionInfo | null = null;
const plans = [
	{ id: "pro", name: "Profissional" },
	{ id: "enterprise", name: "Empresarial" },
];
vi.mock("@/contexts/SubscriptionContext", () => ({
	useSubscription: () => ({ subscription, plans }),
}));

function makeInfo(
	sub: Partial<NonNullable<SubscriptionInfo["subscription"]>>,
	plan: SubscriptionInfo["plan"] = "pro",
): SubscriptionInfo {
	return {
		plan,
		subscription: {
			id: 1,
			status: "active",
			plan_type: "pro",
			current_period_end: "2026-07-15T00:30:00.000Z",
			cancel_at_period_end: false,
			trial_end: null,
			...sub,
		},
	} as SubscriptionInfo;
}

const dot = () => screen.queryByTestId("subscription-notice-dot");

describe("NotificationsDropdown bell", () => {
	beforeEach(() => {
		unreadCount = 0;
		subscription = null;
		push.mockReset();
	});

	it("past_due on a paid plan with no unread: no numeric badge, red dot", () => {
		subscription = makeInfo({ status: "past_due" });
		render(<NotificationsDropdown />);

		expect(dot()).toBeInTheDocument();
		expect(dot()).toHaveClass("bg-red-500");
		// no numeric badge text anywhere
		expect(screen.queryByText(/^\d+\+?$/)).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Pagamento pendente/ }),
		).toHaveAttribute("aria-expanded", "false");
	});

	it("unread notifications without a subscription notice: numeric badge, no dot", () => {
		unreadCount = 3;
		subscription = makeInfo({});
		render(<NotificationsDropdown />);

		expect(screen.getByText("3")).toBeInTheDocument();
		expect(dot()).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Notificações, 3 não lidas" }),
		).toBeInTheDocument();
	});

	it("cancel_scheduled does not inflate the badge: shows exactly unreadCount plus an amber dot", () => {
		unreadCount = 2;
		subscription = makeInfo({ cancel_at_period_end: true });
		render(<NotificationsDropdown />);

		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.queryByText("3")).not.toBeInTheDocument();
		expect(dot()).toBeInTheDocument();
		expect(dot()).toHaveClass("bg-amber-500");
		expect(dot()).not.toHaveClass("bg-red-500");
	});

	it("caps the numeric badge at 9+", () => {
		unreadCount = 25;
		render(<NotificationsDropdown />);
		expect(screen.getByText("9+")).toBeInTheDocument();
	});

	it("free plan with a stale past_due row shows no dot", () => {
		subscription = makeInfo({ status: "past_due" }, "free");
		render(<NotificationsDropdown />);

		expect(dot()).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Notificações" })).toBeVisible();
	});

	it("trialing/active subscriptions show no dot", () => {
		subscription = makeInfo({ status: "trialing" });
		const { unmount } = render(<NotificationsDropdown />);
		expect(dot()).not.toBeInTheDocument();
		unmount();

		subscription = makeInfo({});
		render(<NotificationsDropdown />);
		expect(dot()).not.toBeInTheDocument();
	});

	it("opening the dropdown pins the notice with its title, plan name and CTA, and the CTA goes to /plans", () => {
		subscription = makeInfo({ status: "past_due", plan_type: "enterprise" });
		render(<NotificationsDropdown />);

		fireEvent.click(screen.getByRole("button", { name: /Pagamento pendente/ }));

		expect(
			screen.getByRole("button", {
				name: /Pagamento pendente/,
				expanded: true,
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Atualizar pagamento")).toBeInTheDocument();
		expect(screen.getByText(/plano Empresarial/)).toBeInTheDocument();
		expect(screen.queryByText("Nenhuma notificação")).not.toBeInTheDocument();

		fireEvent.click(screen.getByText("Atualizar pagamento"));
		expect(push).toHaveBeenCalledWith("/plans");
	});

	it("shows the empty state when there are no notifications and no notices", () => {
		render(<NotificationsDropdown />);
		fireEvent.click(screen.getByRole("button", { name: "Notificações" }));
		expect(screen.getByText("Nenhuma notificação")).toBeInTheDocument();
	});
});
