import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: "standalone",
	turbopack: {
		root: process.cwd(),
	},
};

export default withPWA({
	dest: "public",
	register: true,
	disable: process.env.NODE_ENV === "development",
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
})(nextConfig);
