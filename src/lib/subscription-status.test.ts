import { describe, expect, it } from "vitest";
import type { SubscriptionInfo } from "@/contexts/SubscriptionContext";
import {
	formatSubscriptionDate,
	getSubscriptionNotices,
} from "./subscription-status";

function makeInfo(
	sub: Partial<NonNullable<SubscriptionInfo["subscription"]>> | null,
): SubscriptionInfo {
	return {
		plan: "pro",
		subscription: sub
			? {
					id: 1,
					status: "active",
					current_period_end: "2026-07-15T12:00:00.000Z",
					cancel_at_period_end: false,
					...sub,
				}
			: null,
	} as SubscriptionInfo;
}

describe("getSubscriptionNotices", () => {
	it("returns no notice for an ordinary active subscription", () => {
		expect(getSubscriptionNotices(makeInfo({}))).toEqual([]);
	});

	it("returns no notice when there is no subscription", () => {
		expect(getSubscriptionNotices(makeInfo(null))).toEqual([]);
		expect(getSubscriptionNotices(null)).toEqual([]);
	});

	it("flags a failed renewal as an error notice", () => {
		const notices = getSubscriptionNotices(makeInfo({ status: "past_due" }));
		expect(notices).toHaveLength(1);
		expect(notices[0]).toMatchObject({ kind: "past_due", type: "error" });
	});

	it("past_due takes priority over a scheduled cancellation", () => {
		const notices = getSubscriptionNotices(
			makeInfo({ status: "past_due", cancel_at_period_end: true }),
		);
		expect(notices).toHaveLength(1);
		expect(notices[0].kind).toBe("past_due");
	});

	it("flags a scheduled cancellation with the remaining-time date", () => {
		const notices = getSubscriptionNotices(
			makeInfo({ cancel_at_period_end: true }),
		);
		expect(notices).toHaveLength(1);
		expect(notices[0]).toMatchObject({
			kind: "cancel_scheduled",
			type: "warning",
		});
		// "how much Pro time is left" — the period-end date must be in the message.
		expect(notices[0].message).toContain("15/07/2026");
	});
});

describe("formatSubscriptionDate", () => {
	it("formats an ISO date as pt-BR DD/MM/AAAA", () => {
		expect(formatSubscriptionDate("2026-07-15T12:00:00.000Z")).toBe(
			"15/07/2026",
		);
	});

	it("returns an empty string for missing or invalid input", () => {
		expect(formatSubscriptionDate(null)).toBe("");
		expect(formatSubscriptionDate(undefined)).toBe("");
		expect(formatSubscriptionDate("not-a-date")).toBe("");
	});
});
