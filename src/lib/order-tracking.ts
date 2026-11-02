/**
 * Public tracking link for a storefront order. Order numbers are sequential per
 * store since backend Phase 1A (guessable), so the link carries the order's
 * unguessable `tracking_token`; an older backend sends none, and then the (still
 * random) order number is what it can resolve.
 */
export function orderTrackingHref(
	slug: string,
	order: { tracking_token?: string | null; order_number: string },
): string {
	const ref = order.tracking_token || order.order_number;
	return `/loja/${encodeURIComponent(slug)}/pedido/${encodeURIComponent(ref)}`;
}
