import { cn } from "@/lib/utils";

interface TableProps {
	children: React.ReactNode;
	className?: string;
}

export function Table({ children, className }: TableProps) {
	return (
		<div className="overflow-x-auto overflow-y-visible">
			<table className={cn("w-full text-sm", className)}>{children}</table>
		</div>
	);
}

export function TableHeader({ children, className }: TableProps) {
	return (
		<thead className={cn("bg-gray-50 dark:bg-gray-800/50", className)}>
			{children}
		</thead>
	);
}

export function TableBody({ children, className }: TableProps) {
	return (
		<tbody
			className={cn("divide-y divide-gray-200 dark:divide-gray-700", className)}
		>
			{children}
		</tbody>
	);
}

export function TableRow({ children, className }: TableProps) {
	return (
		<tr
			className={cn(
				"hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
				className,
			)}
		>
			{children}
		</tr>
	);
}

interface TableCellProps extends TableProps {
	as?: "th" | "td";
}

export function TableCell({
	children,
	className,
	as: Component = "td",
}: TableCellProps) {
	const baseClass =
		Component === "th"
			? "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
			: "px-4 py-4 text-gray-900 dark:text-gray-100";

	return <Component className={cn(baseClass, className)}>{children}</Component>;
}
