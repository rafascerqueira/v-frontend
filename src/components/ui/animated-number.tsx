"use client";

import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
	value: number;
	/** Format the in-flight value for display (e.g. currency). Defaults to a
	 *  pt-BR integer. */
	format?: (value: number) => string;
	/** Animation duration in seconds. */
	duration?: number;
}

function defaultFormat(value: number): string {
	return Math.round(value).toLocaleString("pt-BR");
}

/**
 * Counts a number up from 0 to `value` on mount / whenever `value` changes.
 * Honors the OS "reduce motion" setting (renders the final value immediately).
 * Used for dashboard KPIs to draw the eye to the figure without being flashy.
 */
export function AnimatedNumber({
	value,
	format,
	duration = 1,
}: AnimatedNumberProps) {
	const reduceMotion = useReducedMotion();
	const motionValue = useMotionValue(0);

	// Keep the latest formatter in a ref so an inline `format` prop doesn't
	// restart the animation on every parent render.
	const formatRef = useRef(format);
	formatRef.current = format;

	const [display, setDisplay] = useState(() =>
		(format ?? defaultFormat)(reduceMotion ? value : 0),
	);

	useEffect(() => {
		const present = (v: number) => (formatRef.current ?? defaultFormat)(v);
		if (reduceMotion) {
			setDisplay(present(value));
			return;
		}
		const controls = animate(motionValue, value, {
			duration,
			ease: [0.25, 0.46, 0.45, 0.94],
			onUpdate: (latest) => setDisplay(present(latest)),
		});
		return () => controls.stop();
	}, [value, duration, reduceMotion, motionValue]);

	return <span>{display}</span>;
}
