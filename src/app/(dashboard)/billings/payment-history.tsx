"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import {
	apiErrorCode,
	apiErrorMessage,
	IDEMPOTENCY_MISMATCH_MESSAGE,
} from "@/lib/api-error";
import {
	canReverse,
	type LedgerEntry,
	MIN_REVERSAL_REASON,
	PAYMENT_METHOD_LABELS,
	reversedPaymentIds,
} from "@/lib/billing-ledger";
import {
	createIdempotencyKeyTracker,
	withIdempotencyKey,
} from "@/lib/idempotency";
import { formatCurrency, formatDate } from "@/lib/utils";

/** The charge as the backend returns it after a ledger write. */
export interface LedgerBillingUpdate {
	id: number;
	paid_amount: number;
	status: string;
	payment_status: string;
	payment_date?: string | null;
	payment_method: string;
}

interface PaymentHistoryProps {
	billingId: number;
	/** Called with the updated charge after a reversal. */
	onChanged: (billing: LedgerBillingUpdate) => void;
}

/**
 * Who paid how much and when: the charge's append-only ledger, with an
 * accessible confirmation (and a mandatory reason) to reverse a payment.
 */
export function PaymentHistory({ billingId, onChanged }: PaymentHistoryProps) {
	const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
	const [reversing, setReversing] = useState<LedgerEntry | null>(null);
	const [reason, setReason] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const idempotency = useRef(createIdempotencyKeyTracker());
	const reasonId = useId();
	const reasonHintId = useId();

	const load = useCallback(async () => {
		try {
			const { data } = await api.get<LedgerEntry[]>(
				`/billings/${billingId}/payments`,
			);
			setEntries(Array.isArray(data) ? data : []);
		} catch (error: unknown) {
			setEntries([]);
			toast.error(
				apiErrorMessage(error, "Erro ao carregar o histórico de pagamentos"),
			);
		}
	}, [billingId]);

	useEffect(() => {
		load();
	}, [load]);

	const closeReverse = () => {
		setReversing(null);
		setReason("");
		idempotency.current.reset();
	};

	const confirmReverse = async () => {
		if (!reversing || reason.trim().length < MIN_REVERSAL_REASON) return;
		const body = { reason: reason.trim() };
		setSubmitting(true);
		try {
			const { data } = await api.post<{ billing: LedgerBillingUpdate }>(
				`/billings/${billingId}/payments/${reversing.id}/reverse`,
				body,
				withIdempotencyKey(
					idempotency.current.keyFor({ paymentId: reversing.id, ...body }),
				),
			);
			toast.success("Pagamento estornado");
			closeReverse();
			onChanged(data.billing);
			await load();
		} catch (error: unknown) {
			if (apiErrorCode(error) === "IDEMPOTENCY_KEY_MISMATCH") {
				idempotency.current.reset();
				toast.error(IDEMPOTENCY_MISMATCH_MESSAGE);
			} else {
				toast.error(apiErrorMessage(error, "Erro ao estornar o pagamento"));
			}
		} finally {
			setSubmitting(false);
		}
	};

	if (entries === null) {
		return (
			<p className="text-sm text-muted-foreground">Carregando histórico…</p>
		);
	}

	const reversed = reversedPaymentIds(entries);

	return (
		<section aria-label="Histórico de pagamentos" className="space-y-2">
			<h3 className="text-sm font-medium text-foreground">
				Histórico de pagamentos
			</h3>
			{entries.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhum pagamento registrado.
				</p>
			) : (
				<ul className="divide-y divide-border rounded-lg border border-border">
					{entries.map((entry) => {
						const isReversal = entry.kind === "reversal";
						return (
							<li
								key={entry.id}
								className="flex items-start justify-between gap-3 px-3 py-2"
							>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground">
										{isReversal ? "Estorno" : "Pagamento"} ·{" "}
										{PAYMENT_METHOD_LABELS[entry.method] ?? entry.method}
										{reversed.has(entry.id) && (
											<Badge variant="default" className="ml-2">
												Estornado
											</Badge>
										)}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(entry.paid_at)}
										{entry.note ? ` — ${entry.note}` : ""}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<span
										className={
											isReversal
												? "text-sm font-medium text-red-600 dark:text-red-400"
												: "text-sm font-medium text-green-600 dark:text-green-400"
										}
									>
										{isReversal ? "− " : ""}
										{formatCurrency(entry.amount)}
									</span>
									{canReverse(entry, reversed) && (
										<Button
											type="button"
											size="sm"
											variant="ghost"
											onClick={() => setReversing(entry)}
											aria-label={`Estornar pagamento de ${formatCurrency(entry.amount)}`}
										>
											<RotateCcw className="h-4 w-4" aria-hidden="true" />
											Estornar
										</Button>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<Modal
				isOpen={!!reversing}
				onClose={closeReverse}
				title="Estornar pagamento"
				size="sm"
			>
				{reversing && (
					<div className="space-y-4">
						<p className="text-sm text-foreground">
							O estorno devolve{" "}
							<strong>{formatCurrency(reversing.amount)}</strong> ao saldo em
							aberto. O pagamento continua no histórico, marcado como estornado.
						</p>
						<div>
							<label
								htmlFor={reasonId}
								className="mb-1 block text-sm font-medium text-foreground"
							>
								Motivo do estorno
							</label>
							<textarea
								id={reasonId}
								aria-describedby={reasonHintId}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								maxLength={500}
								rows={3}
								className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
							<p
								id={reasonHintId}
								className="mt-1 text-xs text-muted-foreground"
							>
								Obrigatório. Ex.: pagamento lançado em duplicidade.
							</p>
						</div>
						<div className="flex justify-end gap-3">
							<Button type="button" variant="outline" onClick={closeReverse}>
								Cancelar
							</Button>
							<Button
								type="button"
								variant="danger"
								isLoading={submitting}
								disabled={reason.trim().length < MIN_REVERSAL_REASON}
								onClick={confirmReverse}
							>
								Confirmar estorno
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</section>
	);
}
