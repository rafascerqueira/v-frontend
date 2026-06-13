"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

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
