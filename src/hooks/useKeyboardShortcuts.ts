"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

interface Shortcut {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	action: () => void;
	description: string;
}

export const shortcuts: Omit<Shortcut, "action">[] = [
	{ key: "h", alt: true, description: "Ir para Dashboard" },
	{ key: "p", alt: true, description: "Ir para Produtos" },
	{ key: "c", alt: true, description: "Ir para Clientes" },
	{ key: "o", alt: true, description: "Ir para Pedidos" },
	{ key: "b", alt: true, description: "Ir para Cobranças" },
	{ key: "s", alt: true, description: "Ir para Estoque" },
	{ key: "r", alt: true, description: "Ir para Relatórios" },
	{ key: "k", ctrl: true, description: "Abrir busca rápida" },
	{ key: "/", description: "Focar na busca" },
	{ key: "Escape", description: "Fechar modais" },
];

export function useKeyboardShortcuts() {
	const router = useRouter();

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const isInput =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			if (isInput && event.key !== "Escape") {
				return;
			}

			const { key, ctrlKey, altKey, shiftKey } = event;

			if (altKey && !ctrlKey && !shiftKey) {
				switch (key.toLowerCase()) {
					case "h":
						event.preventDefault();
						router.push("/dashboard");
						break;
					case "p":
						event.preventDefault();
						router.push("/products");
						break;
					case "c":
						event.preventDefault();
						router.push("/customers");
						break;
					case "o":
						event.preventDefault();
						router.push("/orders");
						break;
					case "b":
						event.preventDefault();
						router.push("/billings");
						break;
					case "s":
						event.preventDefault();
						router.push("/stock");
						break;
					case "r":
						event.preventDefault();
						router.push("/reports");
						break;
				}
			}

			if (ctrlKey && key.toLowerCase() === "k") {
				event.preventDefault();
				const searchInput = document.querySelector<HTMLInputElement>(
					"[data-search-input]",
				);
				searchInput?.focus();
			}

			if (key === "/" && !ctrlKey && !altKey) {
				event.preventDefault();
				const searchInput = document.querySelector<HTMLInputElement>(
					"[data-search-input]",
				);
				searchInput?.focus();
			}
		},
		[router],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}

export function useEscapeKey(onEscape: () => void) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onEscape();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onEscape]);
}
