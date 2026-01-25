import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function CardHeader({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"px-6 py-5 border-b border-gray-100 dark:border-gray-700",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function CardTitle({ className, children, ...props }: CardProps) {
	return (
		<h3
			className={cn(
				"text-lg font-semibold text-gray-900 dark:text-white",
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
}

function CardDescription({ className, children, ...props }: CardProps) {
	return (
		<p
			className={cn("text-sm text-gray-500 dark:text-gray-400 mt-1", className)}
			{...props}
		>
			{children}
		</p>
	);
}

function CardContent({ className, children, ...props }: CardProps) {
	return (
		<div className={cn("px-6 py-5", className)} {...props}>
			{children}
		</div>
	);
}

function CardFooter({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
