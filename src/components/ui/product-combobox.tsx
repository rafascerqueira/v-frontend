import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export interface ComboboxProduct {
	id: number;
	name: string;
	sku?: string | null;
	prices?: { price: number }[];
}

// Searchable product picker — replaces long native <select>s so sellers can
// type to find a product (by name or SKU) and see its price inline.
export function ProductCombobox({
	products,
	value,
	takenIds = [],
	placeholder = "Selecione um produto",
	onSelect,
}: {
	products: ComboboxProduct[];
	value: number;
	takenIds?: number[];
	placeholder?: string;
	onSelect: (productId: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const selected = products.find((p) => p.id === value);

	useEffect(() => {
		if (!open) return;
		const handleClick = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	const term = query.trim().toLowerCase();
	const filtered = term
		? products.filter(
				(p) =>
					p.name.toLowerCase().includes(term) ||
					(p.sku ?? "").toLowerCase().includes(term),
			)
		: products;

	return (
		<div ref={containerRef} className="relative flex-1 min-w-0">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex w-full items-center justify-between gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
			>
				<span className={selected ? "truncate" : "truncate text-gray-400"}>
					{selected ? selected.name : placeholder}
				</span>
				<ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
			</button>
			{open && (
				<div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
					<div className="p-2 border-b border-gray-100 dark:border-gray-700">
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								// biome-ignore lint/a11y/noAutofocus: focus the search when the picker opens
								autoFocus
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Buscar produto..."
								className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-auto py-1">
						{filtered.length === 0 ? (
							<p className="px-3 py-4 text-center text-sm text-gray-500">
								Nenhum produto encontrado
							</p>
						) : (
							filtered.map((product) => {
								const price = product.prices?.[0]?.price ?? 0;
								const isSelected = product.id === value;
								const isTaken = !isSelected && takenIds.includes(product.id);
								return (
									<button
										key={product.id}
										type="button"
										disabled={isTaken}
										onClick={() => {
											onSelect(product.id);
											setOpen(false);
											setQuery("");
										}}
										className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
											isTaken ? "opacity-40 cursor-not-allowed" : ""
										}`}
									>
										<span className="flex items-center gap-2 min-w-0">
											{isSelected ? (
												<Check className="h-4 w-4 text-primary-500 shrink-0" />
											) : (
												<span className="w-4 shrink-0" />
											)}
											<span className="truncate">
												{product.name}
												{isTaken ? " (já adicionado)" : ""}
											</span>
										</span>
										<span className="text-gray-500 shrink-0">
											{formatCurrency(price)}
										</span>
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
