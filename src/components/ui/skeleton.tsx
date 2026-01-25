import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
				className,
			)}
		/>
	);
}

export function SkeletonText({ className }: SkeletonProps) {
	return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
	return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

export function SkeletonCard() {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
			<div className="flex items-center gap-4 mb-4">
				<Skeleton className="h-12 w-12 rounded-xl" />
				<div className="space-y-2 flex-1">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-6 w-32" />
				</div>
			</div>
		</div>
	);
}

export function SkeletonTableRow() {
	return (
		<tr className="border-b border-gray-100 dark:border-gray-700">
			<td className="px-4 py-4">
				<Skeleton className="h-4 w-32" />
			</td>
			<td className="px-4 py-4">
				<Skeleton className="h-4 w-24" />
			</td>
			<td className="px-4 py-4">
				<Skeleton className="h-4 w-20" />
			</td>
			<td className="px-4 py-4">
				<Skeleton className="h-4 w-16" />
			</td>
			<td className="px-4 py-4">
				<Skeleton className="h-6 w-20 rounded-full" />
			</td>
			<td className="px-4 py-4 text-right">
				<Skeleton className="h-8 w-8 rounded-lg ml-auto" />
			</td>
		</tr>
	);
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead>
					<tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
						<th className="px-4 py-3 text-left">
							<Skeleton className="h-3 w-20" />
						</th>
						<th className="px-4 py-3 text-left">
							<Skeleton className="h-3 w-16" />
						</th>
						<th className="px-4 py-3 text-left">
							<Skeleton className="h-3 w-18" />
						</th>
						<th className="px-4 py-3 text-left">
							<Skeleton className="h-3 w-14" />
						</th>
						<th className="px-4 py-3 text-left">
							<Skeleton className="h-3 w-16" />
						</th>
						<th className="px-4 py-3 text-right">
							<Skeleton className="h-3 w-12 ml-auto" />
						</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }).map((_, i) => (
						<SkeletonTableRow key={i} />
					))}
				</tbody>
			</table>
		</div>
	);
}

export function SkeletonStats() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{Array.from({ length: 4 }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</div>
	);
}

export function SkeletonPage() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-32 rounded-lg" />
			</div>
			<SkeletonStats />
			<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
				<div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-10 w-48 rounded-lg" />
				</div>
				<SkeletonTable rows={5} />
			</div>
		</div>
	);
}
