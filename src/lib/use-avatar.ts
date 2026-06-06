import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Resolve a stored avatar URL into something an `<img>` can render.
 *
 * Uploaded avatars are served by the private, auth-gated proxy route
 * `GET /auth/profile/avatar`. A plain `<img src>` to that URL fails in
 * production: the browser does NOT attach our `SameSite=Lax` session cookie to
 * cross-origin subresource requests (the SPA at vendinhas.app vs the API at
 * api.vendinhas.app), so the guard rejects it and the image 404s.
 *
 * Instead we fetch the bytes through the shared axios instance — which sends
 * credentials and rides the same 401-refresh interceptor — and hand the `<img>`
 * a local `blob:` object URL. The object URL is revoked when the avatar changes
 * or the component unmounts, so we never leak blobs.
 *
 * External (OAuth) avatars are absolute URLs to another origin and are returned
 * as-is for the `<img>` to load directly.
 */
export function useAvatarUrl(
	avatarUrl: string | null | undefined,
): string | null {
	const [displayUrl, setDisplayUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!avatarUrl) {
			setDisplayUrl(null);
			return;
		}

		// OAuth / external avatars: absolute URL that is NOT our private proxy route.
		if (
			/^https?:\/\//.test(avatarUrl) &&
			!avatarUrl.includes("/auth/profile/avatar")
		) {
			setDisplayUrl(avatarUrl);
			return;
		}

		let cancelled = false;
		let createdUrl: string | null = null;

		// Strip the absolute origin so axios resolves against its configured
		// baseURL — the `?v=` cache-buster is preserved so a freshly uploaded
		// avatar isn't served from a stale browser cache.
		const path = avatarUrl.replace(/^https?:\/\/[^/]+/, "");

		api
			.get(path, { responseType: "blob" })
			.then((res) => {
				if (cancelled) return;
				createdUrl = URL.createObjectURL(res.data);
				setDisplayUrl(createdUrl);
			})
			.catch(() => {
				if (!cancelled) setDisplayUrl(null);
			});

		return () => {
			cancelled = true;
			if (createdUrl) URL.revokeObjectURL(createdUrl);
		};
	}, [avatarUrl]);

	return displayUrl;
}
