"use client";

import { motion } from "framer-motion";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Rocket,
	ShieldCheck,
	Sparkles,
	Wrench,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ChangeType, releases } from "@/lib/releases";
import { cn } from "@/lib/utils";

const PER_PAGE = 3;

const changeMeta: Record<
	ChangeType,
	{ label: string; icon: typeof Zap; className: string }
> = {
	feature: {
		label: "Novidade",
		icon: Sparkles,
		className:
			"bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
	},
	improvement: {
		label: "Melhoria",
		icon: Zap,
		className:
			"bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300",
	},
	security: {
		label: "Segurança",
		icon: ShieldCheck,
		className:
			"bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
	},
	fix: {
		label: "Correção",
		icon: Wrench,
		className:
			"bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
	},
};

function formatDate(iso: string) {
	return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

export default function ReleasesPage() {
	const router = useRouter();
	const [page, setPage] = useState(1);

	const totalPages = Math.ceil(releases.length / PER_PAGE);
	const start = (page - 1) * PER_PAGE;
	const visible = releases.slice(start, start + PER_PAGE);

	const goTo = (next: number) => {
		setPage(next);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-transparent">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<button
						type="button"
						onClick={() => router.back()}
						className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Voltar
					</button>

					<div className="flex items-center gap-4 mb-10">
						<div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
							<Rocket className="w-7 h-7 text-primary-600 dark:text-primary-400" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-foreground">Novidades</h1>
							<p className="text-muted-foreground">
								Tudo o que lançamos e melhoramos, versão por versão
							</p>
						</div>
					</div>

					<div className="relative space-y-8">
						{/* timeline spine */}
						<div className="hidden sm:block absolute left-4.25 top-2 bottom-2 w-px bg-border" />

						{visible.map((release) => (
							<motion.article
								key={release.version}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4 }}
								className="relative sm:pl-14"
							>
								<div className="hidden sm:flex absolute left-0 top-1 w-9 h-9 rounded-full bg-surface border-2 border-primary-500 items-center justify-center">
									<span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
								</div>

								<div className="bg-surface border border-border rounded-2xl shadow-sm p-6 md:p-8">
									<div className="flex flex-wrap items-center gap-3 mb-4">
										<span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
											v{release.version}
										</span>
										<time className="text-sm text-subtle-foreground">
											{formatDate(release.date)}
										</time>
										<div className="flex flex-wrap gap-2">
											{release.tags.map((tag) => (
												<span
													key={tag}
													className="text-xs font-medium bg-surface-muted text-muted-foreground px-2.5 py-1 rounded-full"
												>
													{tag}
												</span>
											))}
										</div>
									</div>

									<h2 className="text-xl font-semibold text-foreground mb-2">
										{release.title}
									</h2>
									<p className="text-muted-foreground mb-6">
										{release.summary}
									</p>

									<ul className="space-y-3">
										{release.changes.map((change) => {
											const meta = changeMeta[change.type];
											const Icon = meta.icon;
											return (
												<li key={change.text} className="flex gap-3">
													<span
														className={cn(
															"inline-flex items-center gap-1 shrink-0 h-fit text-[0.7rem] font-semibold px-2 py-1 rounded-md",
															meta.className,
														)}
													>
														<Icon className="w-3 h-3" />
														{meta.label}
													</span>
													<span className="text-sm text-foreground/90 pt-0.5">
														{change.text}
													</span>
												</li>
											);
										})}
									</ul>
								</div>
							</motion.article>
						))}
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-10">
							<button
								type="button"
								onClick={() => goTo(page - 1)}
								disabled={page === 1}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
								Anterior
							</button>

							<div className="flex items-center gap-1.5">
								{Array.from({ length: totalPages }).map((_, i) => {
									const n = i + 1;
									return (
										<button
											key={n}
											type="button"
											onClick={() => goTo(n)}
											aria-label={`Página ${n}`}
											aria-current={n === page ? "page" : undefined}
											className={cn(
												"min-w-9 h-9 px-2 text-sm font-medium rounded-lg transition-colors",
												n === page
													? "bg-primary-600 text-white"
													: "text-muted-foreground hover:bg-surface",
											)}
										>
											{n}
										</button>
									);
								})}
							</div>

							<button
								type="button"
								onClick={() => goTo(page + 1)}
								disabled={page === totalPages}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
							>
								Próxima
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					)}

					<div className="mt-12 text-center">
						<p className="text-sm text-muted-foreground">
							Quer aproveitar as novidades?{" "}
							<Link
								href="/register"
								className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
							>
								Crie sua conta gratuita
							</Link>
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
