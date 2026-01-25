"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
	children: ReactNode;
}

const pageVariants = {
	initial: {
		opacity: 0,
		y: 20,
		scale: 0.98,
	},
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
	},
	exit: {
		opacity: 0,
		y: -10,
		scale: 0.98,
	},
};

const pageTransition = {
	type: "tween" as const,
	ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
	duration: 0.3,
};

export function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={pathname}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={pageVariants}
				transition={pageTransition}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}

export function FadeIn({
	children,
	delay = 0,
}: {
	children: ReactNode;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			{children}
		</motion.div>
	);
}

export function SlideIn({
	children,
	direction = "left",
	delay = 0,
}: {
	children: ReactNode;
	direction?: "left" | "right" | "up" | "down";
	delay?: number;
}) {
	const directionOffset = {
		left: { x: -30, y: 0 },
		right: { x: 30, y: 0 },
		up: { x: 0, y: -30 },
		down: { x: 0, y: 30 },
	};

	return (
		<motion.div
			initial={{ opacity: 0, ...directionOffset[direction] }}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			{children}
		</motion.div>
	);
}

export function ScaleIn({
	children,
	delay = 0,
}: {
	children: ReactNode;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			{children}
		</motion.div>
	);
}
