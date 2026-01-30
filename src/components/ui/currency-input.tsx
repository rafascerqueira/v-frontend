"use client";

import {
	type ChangeEvent,
	forwardRef,
	type InputHTMLAttributes,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
	label?: string;
	error?: string;
	hint?: string;
	value?: number;
	onChange?: (value: number) => void;
	currency?: string;
	locale?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
	(
		{
			className,
			label,
			error,
			hint,
			id,
			value = 0,
			onChange,
			currency = "BRL",
			locale = "pt-BR",
			disabled,
			...props
		},
		ref,
	) => {
		const inputId = id || props.name;

		// Internal state for cents (integer)
		const [cents, setCents] = useState<number>(value);

		// Sync with external value
		useEffect(() => {
			setCents(value);
		}, [value]);

		// Format cents to display string
		const formatDisplay = useCallback(
			(centValue: number): string => {
				const absValue = Math.abs(centValue);
				const formatted = new Intl.NumberFormat(locale, {
					style: "currency",
					currency,
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(absValue / 100);

				return centValue < 0 ? `-${formatted}` : formatted;
			},
			[currency, locale],
		);

		// Handle key press for RTL behavior
		const handleKeyDown = useCallback(
			(e: KeyboardEvent<HTMLInputElement>) => {
				// Allow: backspace, delete, tab, escape, enter, arrow keys
				if (
					[
						"Backspace",
						"Delete",
						"Tab",
						"Escape",
						"Enter",
						"ArrowLeft",
						"ArrowRight",
						"ArrowUp",
						"ArrowDown",
					].includes(e.key)
				) {
					if (e.key === "Backspace") {
						e.preventDefault();
						// Remove last digit (divide by 10)
						const newCents = Math.floor(cents / 10);
						setCents(newCents);
						onChange?.(newCents);
					} else if (e.key === "Delete") {
						e.preventDefault();
						// Clear all
						setCents(0);
						onChange?.(0);
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						// Increment by 100 cents (R$ 1,00)
						const newCents = cents + 100;
						setCents(newCents);
						onChange?.(newCents);
					} else if (e.key === "ArrowDown") {
						e.preventDefault();
						// Decrement by 100 cents (R$ 1,00)
						const newCents = Math.max(0, cents - 100);
						setCents(newCents);
						onChange?.(newCents);
					}
					return;
				}

				// Block non-numeric keys
				if (!/^\d$/.test(e.key)) {
					e.preventDefault();
					return;
				}

				e.preventDefault();

				// RTL: multiply current by 10 and add new digit
				const digit = parseInt(e.key, 10);
				const newCents = cents * 10 + digit;

				// Limit to reasonable amount (999,999,999.99)
				if (newCents > 99999999999) return;

				setCents(newCents);
				onChange?.(newCents);
			},
			[cents, onChange],
		);

		// Handle paste
		const handlePaste = useCallback(
			(e: React.ClipboardEvent<HTMLInputElement>) => {
				e.preventDefault();
				const pastedText = e.clipboardData.getData("text");
				const numbers = pastedText.replace(/\D/g, "");
				if (numbers) {
					const newCents = parseInt(numbers, 10);
					if (newCents <= 99999999999) {
						setCents(newCents);
						onChange?.(newCents);
					}
				}
			},
			[onChange],
		);

		// Prevent default change since we handle everything via keydown
		const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			e.preventDefault();
		}, []);

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
					>
						{label}
					</label>
				)}
				<div className="relative">
					<input
						ref={ref}
						id={inputId}
						type="text"
						inputMode="numeric"
						value={formatDisplay(cents)}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						disabled={disabled}
						className={cn(
							"w-full px-4 py-2.5 rounded-lg border transition-all duration-200",
							"text-gray-900 dark:text-white text-right font-mono text-lg",
							"bg-white dark:bg-gray-800",
							"focus:outline-none focus:ring-2 focus:ring-offset-0",
							error
								? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
								: "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20",
							"disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed",
							className,
						)}
						{...props}
					/>
				</div>
				{error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
				{hint && !error && (
					<p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
						{hint}
					</p>
				)}
			</div>
		);
	},
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
