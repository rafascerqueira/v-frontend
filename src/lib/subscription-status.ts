import type {
	PlanInfo,
	SubscriptionInfo,
} from "@/contexts/SubscriptionContext";
import { formatDate } from "@/lib/utils";

/**
 * Single source of truth for the subscription status the seller sees — the plans
 * page banner and the notification bell both render from `getSubscriptionState`, so
 * their state priority and pt-BR copy can't drift apart again.
 */

export type SubscriptionStateKind =
	| "past_due"
	| "cancel_scheduled"
	| "trialing"
	| "active";

/** Semantic severity — each surface maps it to its own styling. */
export type SubscriptionTone = "error" | "warning" | "info";

export interface SubscriptionState {
	kind: SubscriptionStateKind;
	tone: SubscriptionTone;
	title: string;
	message: string;
	/** Label for the action that resolves/manages the state (opens the Stripe portal). */
	cta: string;
}

const FALLBACK_PLAN_NAME = "Pro";

/**
 * Display name of the tier the subscription pays for ("Profissional",
 * "Empresarial"…), from GET /subscriptions/plans. Falls back to "Pro" while plans
 * are loading or when the tier is unknown.
 */
export function getSubscriptionPlanName(
	info: SubscriptionInfo | null,
	plans: readonly Pick<PlanInfo, "id" | "name">[],
): string {
	const planType = info?.subscription?.plan_type;
	return plans.find((p) => p.id === planType)?.name ?? FALLBACK_PLAN_NAME;
}

/**
 * Derives the subscription state to surface, by priority:
 * past_due > scheduled cancellation > trialing > active.
 *
 * Returns null when there is nothing to show: no subscription, a free account (keeps
 * the bell and the plans page in agreement), or any other status — `paused` reaches
 * the client but deliberately gets no UI.
 */
export function getSubscriptionState(
	info: SubscriptionInfo | null,
	planName: string,
): SubscriptionState | null {
	const sub = info?.subscription;
	if (!info || !sub || info.plan === "free") return null;

	// "" when absent/invalid; formatDate pins UTC so the day never shifts by timezone.
	const periodEnd = formatDate(sub.current_period_end, "");

	if (sub.status === "past_due") {
		return {
			kind: "past_due",
			tone: "error",
			title: "Pagamento pendente",
			message: `Não conseguimos renovar sua assinatura. Atualize seu cartão para manter o plano ${planName}.`,
			cta: "Atualizar pagamento",
		};
	}

	if (sub.status !== "active" && sub.status !== "trialing") return null;

	if (sub.cancel_at_period_end) {
		const until = periodEnd || "o fim do período atual";
		return {
			kind: "cancel_scheduled",
			tone: "warning",
			title: "Assinatura será cancelada",
			message: `Você mantém o plano ${planName} até ${until}. Depois disso, sua conta volta ao plano Gratuito.`,
			cta: "Reativar assinatura",
		};
	}

	if (sub.status === "trialing") {
		// During a Stripe trial the current period *is* the trial, so its end is the
		// trial end — a safe fallback for rows that don't carry trial_end yet.
		const trialEnd = formatDate(sub.trial_end, "") || periodEnd;
		return {
			kind: "trialing",
			tone: "info",
			title: `Período de teste do plano ${planName}`,
			message: trialEnd
				? `Seu período de teste termina em ${trialEnd}. A primeira cobrança acontece nessa data.`
				: "Seu período de teste está ativo. A primeira cobrança acontece quando ele terminar.",
			cta: "Gerenciar assinatura",
		};
	}

	return {
		kind: "active",
		tone: "info",
		title: `Plano ${planName} ativo`,
		message: periodEnd
			? `Sua assinatura renova automaticamente em ${periodEnd}.`
			: "Sua assinatura está ativa.",
		cta: "Gerenciar assinatura",
	};
}

export type SubscriptionNoticeKind = Extract<
	SubscriptionStateKind,
	"past_due" | "cancel_scheduled"
>;

export interface SubscriptionNotice {
	id: string;
	kind: SubscriptionNoticeKind;
	/** Maps to the notification bell's visual types. */
	type: Extract<SubscriptionTone, "error" | "warning">;
	title: string;
	message: string;
	cta: string;
}

/**
 * The subset of `getSubscriptionState` worth pinning in the notification bell: a
 * failed renewal and a scheduled cancellation, where knowing "how much paid time is
 * left" matters. Trialing/active are informational and stay on the plans page.
 */
export function getSubscriptionNotices(
	info: SubscriptionInfo | null,
	planName: string,
): SubscriptionNotice[] {
	const state = getSubscriptionState(info, planName);
	if (!state) return [];

	const { title, message, cta } = state;
	switch (state.kind) {
		case "past_due":
			return [
				{
					id: "sub-past-due",
					kind: "past_due",
					type: "error",
					title,
					message,
					cta,
				},
			];
		case "cancel_scheduled":
			return [
				{
					id: "sub-cancel-scheduled",
					kind: "cancel_scheduled",
					type: "warning",
					title,
					message,
					cta,
				},
			];
		default:
			return [];
	}
}
