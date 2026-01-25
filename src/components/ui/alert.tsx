import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
	variant?: "info" | "success" | "warning" | "error";
	title?: string;
	children: ReactNode;
	className?: string;
}

const variants = {
	info: {
		container: "bg-blue-50 border-blue-200 text-blue-800",
		icon: Info,
	},
	success: {
		container: "bg-green-50 border-green-200 text-green-800",
		icon: CheckCircle2,
	},
	warning: {
		container: "bg-yellow-50 border-yellow-200 text-yellow-800",
		icon: AlertCircle,
	},
	error: {
		container: "bg-red-50 border-red-200 text-red-800",
		icon: XCircle,
	},
};

export function Alert({
	variant = "info",
	title,
	children,
	className,
}: AlertProps) {
	const { container, icon: Icon } = variants[variant];

	return (
		<div
			className={cn("flex gap-3 p-4 rounded-lg border", container, className)}
		>
			<Icon className="h-5 w-5 shrink-0 mt-0.5" />
			<div className="flex-1">
				{title && <p className="font-medium mb-1">{title}</p>}
				<div className="text-sm">{children}</div>
			</div>
		</div>
	);
}
