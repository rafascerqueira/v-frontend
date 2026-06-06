"use client";

import { MotionConfig } from "framer-motion";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			// Follow the visitor's OS color scheme by default (the "system" standard).
			// Public store visitors have no saved preference, so they now get their
			// device's light/dark setting instead of a forced light theme. A seller's
			// explicit choice in Settings → Aparência still persists and overrides this.
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange={false}
		>
			{/* reducedMotion="user": every framer-motion animation in the app now
			    respects the OS "reduce motion" setting automatically (transform/layout
			    animations are skipped, opacity is kept). One wrapper, app-wide a11y. */}
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</NextThemesProvider>
	);
}
