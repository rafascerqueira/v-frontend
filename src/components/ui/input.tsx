import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, hint, id, ...props }, ref) => {
		const inputId = id || props.name;

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
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"w-full px-4 py-2.5 rounded-lg border transition-all duration-200",
						"text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800",
						"focus:outline-none focus:ring-2 focus:ring-offset-0",
						error
							? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
							: "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20",
						"disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed",
						className,
					)}
					{...props}
				/>
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

Input.displayName = "Input";

export { Input };
