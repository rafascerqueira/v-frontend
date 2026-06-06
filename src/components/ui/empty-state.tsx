import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	/** Optional illustrative icon (rendered with a soft circular backdrop). */
	icon?: LucideIcon;
	title: string;
	description?: string;
	/** Optional call-to-action (e.g. a "Create" button). */
	action?: ReactNode;
	className?: string;
}

/**
 * Consistent empty state for lists/tables: an optional icon, a title, an
 * optional description, and an optional CTA. Replaces ad-hoc "Nenhum X
 * encontrado" text so empty screens read as intentional, not broken.
 */
export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center px-6 py-12 text-center",
				className,
			)}
		>
			{Icon && (
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
					<Icon
						className="h-6 w-6 text-gray-400"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
				</div>
			)}
			<p className="text-base font-medium text-gray-900 dark:text-white">
				{title}
			</p>
			{description && (
				<p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
					{description}
				</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
