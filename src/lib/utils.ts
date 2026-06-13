import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value / 100);
}

export function formatDate(
	date: string | Date | null | undefined,
	fallback = "—",
): string {
	// Guard against null/undefined/empty and invalid dates: new Date(null) is the Unix
	// epoch (01/01/1970) and new Date("") is Invalid Date — neither should ever render.
	if (date == null || date === "") return fallback;
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return fallback;
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(parsed);
}
