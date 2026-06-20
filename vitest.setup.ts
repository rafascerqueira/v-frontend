import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Next.js App Router hooks don't run in jsdom — provide inert global stubs.
// Per-test mocks (next/image, framer-motion, socket.io-client) live in each
// spec; see the frontend-test-setup skill for the patterns.
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
		refresh: vi.fn(),
		prefetch: vi.fn(),
	}),
	useParams: () => ({}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));
