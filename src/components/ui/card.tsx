import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"bg-surface rounded-2xl shadow-sm border border-border dark:border-t-white/10",
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
			className={cn("px-6 py-5 border-b border-border", className)}
			{...props}
		>
			{children}
		</div>
	);
}

function CardTitle({ className, children, ...props }: CardProps) {
	return (
		<h3
			className={cn("text-lg font-semibold text-foreground", className)}
			{...props}
		>
			{children}
		</h3>
	);
}

function CardDescription({ className, children, ...props }: CardProps) {
	return (
		<p
			className={cn("text-sm text-muted-foreground mt-1", className)}
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
				"px-6 py-4 border-t border-border bg-surface-muted/50 rounded-b-2xl",
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
