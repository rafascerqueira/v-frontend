"use client";

import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { getCheckoutError } from "@/lib/checkout-error";

/** Fixed id so repeated refused checkouts update one toast instead of stacking. */
export const SUBSCRIPTION_EXISTS_TOAST_ID = "checkout-subscription-exists";
/** Long enough to reach the button: hover pauses the timer, keyboard focus does not. */
export const SUBSCRIPTION_EXISTS_TOAST_DURATION_MS = 10_000;

interface SubscriptionExistsToastProps {
	message: string;
	onManage: () => void;
}

/**
 * Body of the toast shown when checkout is refused because the account already
 * has a live subscription (409 `SUBSCRIPTION_EXISTS`). It renders inside a
 * react-hot-toast bar whose background is `--surface`, so the button's focus
 * ring offset matches that surface in both themes.
 */
export function SubscriptionExistsToast({
	message,
	onManage,
}: SubscriptionExistsToastProps) {
	return (
		<div className="flex flex-col items-start gap-3 text-left">
			<p className="text-sm text-foreground">{message}</p>
			<Button
				type="button"
				size="sm"
				onClick={onManage}
				className="focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface"
			>
				<CreditCard aria-hidden="true" className="h-4 w-4" />
				Gerenciar assinatura
			</Button>
		</div>
	);
}

/**
 * Shows the right toast for a failed `POST /subscriptions/checkout`:
 * - `SUBSCRIPTION_EXISTS` → error toast with a "Gerenciar assinatura" button that
 *   dismisses it and calls `onManage` (the Stripe Billing Portal);
 * - `CHECKOUT_IN_PROGRESS` → informational toast (another checkout is starting);
 * - anything else → the generic error toast.
 */
export function notifyCheckoutError(error: unknown, onManage: () => void) {
	const { code, message } = getCheckoutError(error);

	if (code === "SUBSCRIPTION_EXISTS") {
		toast.error(
			(t) => (
				<SubscriptionExistsToast
					message={message}
					onManage={() => {
						toast.dismiss(t.id);
						onManage();
					}}
				/>
			),
			{
				id: SUBSCRIPTION_EXISTS_TOAST_ID,
				duration: SUBSCRIPTION_EXISTS_TOAST_DURATION_MS,
			},
		);
		return;
	}

	if (code === "CHECKOUT_IN_PROGRESS") {
		toast(message, { icon: "⏳" });
		return;
	}

	toast.error(message);
}
