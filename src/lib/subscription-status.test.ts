import { describe, expect, it } from "vitest";
import type { SubscriptionInfo } from "@/contexts/SubscriptionContext";
import {
	getSubscriptionNotices,
	getSubscriptionPlanName,
	getSubscriptionState,
} from "./subscription-status";

// 00:30 UTC on 15/07 is still 14/07 in any negative-offset timezone (e.g. BRT), so
// asserting "15/07/2026" only passes if dates are formatted in UTC — independent of
// the machine's TZ.
const PERIOD_END = "2026-07-15T00:30:00.000Z";
const TRIAL_END = "2026-08-01T00:30:00.000Z";

function makeInfo(
	sub: Partial<NonNullable<SubscriptionInfo["subscription"]>> | null,
	plan: SubscriptionInfo["plan"] = "pro",
): SubscriptionInfo {
	return {
		plan,
		subscription: sub
			? {
					id: 1,
					status: "active",
					plan_type: "pro",
					current_period_end: PERIOD_END,
					cancel_at_period_end: false,
					trial_end: null,
					...sub,
				}
			: null,
	} as SubscriptionInfo;
}

describe("getSubscriptionState", () => {
	it("returns null without a subscription or on the free plan", () => {
		expect(getSubscriptionState(null, "Pro")).toBeNull();
		expect(getSubscriptionState(makeInfo(null), "Pro")).toBeNull();
		expect(
			getSubscriptionState(makeInfo({ status: "past_due" }, "free"), "Pro"),
		).toBeNull();
	});

	it("returns null for statuses that get no UI (paused)", () => {
		expect(
			getSubscriptionState(makeInfo({ status: "paused" }), "Pro"),
		).toBeNull();
	});

	it("describes an active plan with its renewal date (UTC)", () => {
		expect(getSubscriptionState(makeInfo({}), "Profissional")).toEqual({
			kind: "active",
			tone: "info",
			title: "Plano Profissional ativo",
			message: "Sua assinatura renova automaticamente em 15/07/2026.",
			cta: "Gerenciar assinatura",
		});
	});

	it("past_due takes priority over a scheduled cancellation", () => {
		const state = getSubscriptionState(
			makeInfo({ status: "past_due", cancel_at_period_end: true }),
			"Empresarial",
		);
		expect(state).toMatchObject({ kind: "past_due", tone: "error" });
		expect(state?.message).toContain("plano Empresarial");
	});

	it("a scheduled cancellation outranks trialing and shows the end date", () => {
		const state = getSubscriptionState(
			makeInfo({ status: "trialing", cancel_at_period_end: true }),
			"Pro",
		);
		expect(state).toMatchObject({ kind: "cancel_scheduled", tone: "warning" });
		expect(state?.message).toContain("15/07/2026");
	});

	it("tells a trialing seller when the trial ends and the first charge happens", () => {
		const state = getSubscriptionState(
			makeInfo({ status: "trialing", trial_end: TRIAL_END }),
			"Pro",
		);
		expect(state?.kind).toBe("trialing");
		expect(state?.message).toBe(
			"Seu período de teste termina em 01/08/2026. A primeira cobrança acontece nessa data.",
		);
		expect(state?.message).not.toMatch(/renova/);
	});
});

describe("getSubscriptionNotices", () => {
	it("pins only past_due and scheduled cancellations in the bell", () => {
		expect(getSubscriptionNotices(makeInfo({}), "Pro")).toEqual([]);
		expect(
			getSubscriptionNotices(makeInfo({ status: "trialing" }), "Pro"),
		).toEqual([]);

		expect(
			getSubscriptionNotices(makeInfo({ status: "past_due" }), "Pro"),
		).toMatchObject([{ kind: "past_due", type: "error" }]);
		expect(
			getSubscriptionNotices(makeInfo({ cancel_at_period_end: true }), "Pro"),
		).toMatchObject([{ kind: "cancel_scheduled", type: "warning" }]);
	});

	it("agrees with the plans page on free accounts", () => {
		expect(
			getSubscriptionNotices(makeInfo({ status: "past_due" }, "free"), "Pro"),
		).toEqual([]);
	});
});

describe("getSubscriptionPlanName", () => {
	const plans = [
		{ id: "free", name: "Gratuito" },
		{ id: "pro", name: "Profissional" },
		{ id: "enterprise", name: "Empresarial" },
	];

	it("resolves the subscription's tier to its display name", () => {
		expect(
			getSubscriptionPlanName(makeInfo({ plan_type: "enterprise" }), plans),
		).toBe("Empresarial");
	});

	it('falls back to "Pro" when plans are not loaded', () => {
		expect(getSubscriptionPlanName(makeInfo({}), [])).toBe("Pro");
		expect(getSubscriptionPlanName(null, plans)).toBe("Pro");
	});
});

describe("getSubscriptionPlanName (tiers)", () => {
	const plans = [
		{ id: "free", name: "Gratuito" },
		{ id: "pro", name: "Profissional" },
		{ id: "enterprise", name: "Empresarial" },
	];

	it('resolves "pro" to "Profissional"', () => {
		expect(getSubscriptionPlanName(makeInfo({ plan_type: "pro" }), plans)).toBe(
			"Profissional",
		);
	});

	it('falls back to "Pro" for an unknown tier or when there is no subscription row', () => {
		expect(
			getSubscriptionPlanName(
				makeInfo({ plan_type: "platinum" as never }),
				plans,
			),
		).toBe("Pro");
		expect(getSubscriptionPlanName(makeInfo(null), plans)).toBe("Pro");
	});
});

describe("getSubscriptionState (edge cases)", () => {
	it("uses the resolved plan name in past_due and cancel_scheduled copy", () => {
		expect(
			getSubscriptionState(makeInfo({ status: "past_due" }), "Profissional")
				?.message,
		).toBe(
			"Não conseguimos renovar sua assinatura. Atualize seu cartão para manter o plano Profissional.",
		);
		expect(
			getSubscriptionState(
				makeInfo({ cancel_at_period_end: true }),
				"Empresarial",
			)?.message,
		).toBe(
			"Você mantém o plano Empresarial até 15/07/2026. Depois disso, sua conta volta ao plano Gratuito.",
		);
	});

	it("trialing falls back to the period end when trial_end is missing", () => {
		expect(
			getSubscriptionState(makeInfo({ status: "trialing" }), "Pro")?.message,
		).toBe(
			"Seu período de teste termina em 15/07/2026. A primeira cobrança acontece nessa data.",
		);
	});

	it("trialing without any valid date gets date-free copy", () => {
		const state = getSubscriptionState(
			makeInfo({ status: "trialing", current_period_end: "" }),
			"Pro",
		);
		expect(state?.kind).toBe("trialing");
		expect(state?.message).toBe(
			"Seu período de teste está ativo. A primeira cobrança acontece quando ele terminar.",
		);
	});

	it("cancel_scheduled without a date and active without a date use safe copy", () => {
		expect(
			getSubscriptionState(
				makeInfo({ cancel_at_period_end: true, current_period_end: "" }),
				"Pro",
			)?.message,
		).toContain("até o fim do período atual.");
		expect(
			getSubscriptionState(makeInfo({ current_period_end: "invalid" }), "Pro")
				?.message,
		).toBe("Sua assinatura está ativa.");
	});

	it("returns null for other unknown statuses even with cancel_at_period_end", () => {
		expect(
			getSubscriptionState(
				makeInfo({ status: "canceled", cancel_at_period_end: true }),
				"Pro",
			),
		).toBeNull();
	});

	it("keeps the calendar day in UTC regardless of the process timezone", () => {
		// 23:30 UTC on 31/12 is already 01/01 in UTC+ zones (e.g. Pacific/Kiritimati);
		// 00:30 UTC is still the previous day in UTC- zones. Both must stay put.
		expect(
			getSubscriptionState(
				makeInfo({ current_period_end: "2026-12-31T23:30:00.000Z" }),
				"Pro",
			)?.message,
		).toContain("31/12/2026");
		expect(
			getSubscriptionState(
				makeInfo({ current_period_end: "2026-01-01T00:30:00.000Z" }),
				"Pro",
			)?.message,
		).toContain("01/01/2026");
	});
});

describe("getSubscriptionNotices (exclusions)", () => {
	it("excludes trialing and active, but a trialing sub with cancel scheduled is pinned", () => {
		expect(
			getSubscriptionNotices(
				makeInfo({ status: "trialing", trial_end: TRIAL_END }),
				"Pro",
			),
		).toEqual([]);
		expect(getSubscriptionNotices(makeInfo({}), "Pro")).toEqual([]);
		expect(
			getSubscriptionNotices(
				makeInfo({ status: "trialing", cancel_at_period_end: true }),
				"Pro",
			),
		).toMatchObject([{ kind: "cancel_scheduled" }]);
	});

	it("returns [] for paused and for null info", () => {
		expect(
			getSubscriptionNotices(makeInfo({ status: "paused" }), "Pro"),
		).toEqual([]);
		expect(getSubscriptionNotices(null, "Pro")).toEqual([]);
	});

	it("exposes the notice with stable id, title, message and cta", () => {
		expect(
			getSubscriptionNotices(makeInfo({ status: "past_due" }), "Pro"),
		).toEqual([
			{
				id: "sub-past-due",
				kind: "past_due",
				type: "error",
				title: "Pagamento pendente",
				message:
					"Não conseguimos renovar sua assinatura. Atualize seu cartão para manter o plano Pro.",
				cta: "Atualizar pagamento",
			},
		]);
	});
});
