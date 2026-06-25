import type { SubscriptionInfo } from "@/contexts/SubscriptionContext";

/** Formats an ISO date as a pt-BR short date (DD/MM/AAAA). Returns "" when absent/invalid. */
export function formatSubscriptionDate(iso: string | null | undefined): string {
	if (!iso) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export type SubscriptionNoticeKind = "past_due" | "cancel_scheduled" | "active";

export interface SubscriptionNotice {
	id: string;
	kind: SubscriptionNoticeKind;
	/** Maps to the notification bell's visual types. */
	type: "info" | "success" | "warning" | "error";
	title: string;
	message: string;
}

/**
 * Derives user-facing subscription notices from the subscription info the app already
 * fetched — no extra request. Returns only the states worth surfacing in the
 * notification bell: a failed renewal (past_due) and a scheduled cancellation, where
 * knowing "how much Pro time is left" actually matters. An ordinary active plan
 * produces no notice (nothing to warn about).
 */
export function getSubscriptionNotices(
	subscription: SubscriptionInfo | null,
): SubscriptionNotice[] {
	const sub = subscription?.subscription;
	if (!sub) return [];

	if (sub.status === "past_due") {
		return [
			{
				id: "sub-past-due",
				kind: "past_due",
				type: "error",
				title: "Pagamento pendente",
				message:
					"Não conseguimos renovar sua assinatura. Atualize seu cartão para manter o plano Pro.",
			},
		];
	}

	if (sub.cancel_at_period_end) {
		const until = formatSubscriptionDate(sub.current_period_end);
		return [
			{
				id: "sub-cancel-scheduled",
				kind: "cancel_scheduled",
				type: "warning",
				title: "Assinatura será cancelada",
				message: until
					? `Você mantém o plano Pro até ${until}.`
					: "Você mantém o plano Pro até o fim do período atual.",
			},
		];
	}

	return [];
}
