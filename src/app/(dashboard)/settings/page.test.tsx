import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";

// 2FA enrollment is closed on the backend until the full flow ships (login
// code step, enable/backup codes, encrypted secret). Until then the settings
// page must not offer any 2FA control — not even "Desativar" for accounts that
// already have it (the backend now requires a code the UI can't collect).
const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/lib/api", () => ({
	api: { get: vi.fn().mockResolvedValue({ data: {} }), post, put: vi.fn() },
}));

vi.mock("@/contexts/auth-context", () => ({
	useAuth: () => ({
		user: {
			id: "u1",
			name: "Maria Souza",
			email: "maria@example.com",
			role: "seller",
			two_factor_enabled: true,
		},
		refreshUser: vi.fn(),
	}),
}));

vi.mock("@/lib/use-avatar", () => ({ useAvatarUrl: () => null }));

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
	useReducedMotion: () => true,
	motion: new Proxy(
		{},
		{
			get:
				(_target, tag: string) =>
				({
					children,
					initial: _initial,
					animate: _animate,
					exit: _exit,
					transition: _transition,
					...rest
				}: Record<string, unknown> & { children?: ReactNode }) =>
					createElement(tag, rest, children),
		},
	),
}));

describe("SettingsPage — security tab", () => {
	it("offers no 2FA control while enrollment is closed, even if 2FA is on", () => {
		render(<SettingsPage />);

		fireEvent.click(screen.getByRole("button", { name: /segurança/i }));

		expect(
			screen.getByRole("button", { name: /alterar senha/i }),
		).toBeInTheDocument();
		expect(screen.queryByText(/duas etapas/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/2FA/)).not.toBeInTheDocument();
		expect(post).not.toHaveBeenCalledWith(
			expect.stringContaining("/auth/2fa"),
			expect.anything(),
		);
	});
});
