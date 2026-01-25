"use client";

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface PaginationProps {
	meta: PaginationMeta;
	onPageChange: (page: number) => void;
	className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
	const { page, totalPages, hasNextPage, hasPrevPage, total } = meta;

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (page <= 3) {
				for (let i = 1; i <= 4; i++) pages.push(i);
				pages.push("...");
				pages.push(totalPages);
			} else if (page >= totalPages - 2) {
				pages.push(1);
				pages.push("...");
				for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
			} else {
				pages.push(1);
				pages.push("...");
				for (let i = page - 1; i <= page + 1; i++) pages.push(i);
				pages.push("...");
				pages.push(totalPages);
			}
		}
		return pages;
	};

	if (totalPages <= 1) return null;

	return (
		<div
			className={cn("flex items-center justify-between px-4 py-3", className)}
		>
			<div className="text-sm text-gray-500 dark:text-gray-400">
				Mostrando{" "}
				<span className="font-medium text-gray-900 dark:text-white">
					{(page - 1) * meta.limit + 1}
				</span>{" "}
				a{" "}
				<span className="font-medium text-gray-900 dark:text-white">
					{Math.min(page * meta.limit, total)}
				</span>{" "}
				de{" "}
				<span className="font-medium text-gray-900 dark:text-white">
					{total}
				</span>{" "}
				resultados
			</div>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(1)}
					disabled={!hasPrevPage}
					className="hidden sm:flex"
				>
					<ChevronsLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPrevPage}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<div className="flex items-center gap-1 mx-2">
					{getPageNumbers().map((p, i) =>
						typeof p === "number" ? (
							<button
								key={i}
								type="button"
								onClick={() => onPageChange(p)}
								className={cn(
									"min-w-[32px] h-8 px-2 text-sm font-medium rounded-md transition-colors",
									p === page
										? "bg-indigo-600 text-white"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
								)}
							>
								{p}
							</button>
						) : (
							<span key={i} className="px-1 text-gray-400">
								...
							</span>
						),
					)}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNextPage}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(totalPages)}
					disabled={!hasNextPage}
					className="hidden sm:flex"
				>
					<ChevronsRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
