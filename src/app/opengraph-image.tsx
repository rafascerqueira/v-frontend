import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt =
	"Vendinhas — Sistema de Gestão de Vendas com Inteligência Artificial";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

// Brand palette (matches globals.css)
const PRIMARY = "#4a00e0";
const PRIMARY_LIGHT = "#7530f7";
const PRIMARY_DARK = "#2e0090";

// Shared renderer — also re-used by twitter-image.tsx.
export function renderOgCard() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "72px 80px",
				background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 55%, ${PRIMARY_LIGHT} 100%)`,
				color: "#ffffff",
				fontFamily: "sans-serif",
				position: "relative",
			}}
		>
			{/* soft glow accents */}
			<div
				style={{
					position: "absolute",
					top: -160,
					right: -120,
					width: 520,
					height: 520,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 70%)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: -200,
					left: -140,
					width: 560,
					height: 560,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(155,97,255,0.35) 0%, rgba(155,97,255,0) 70%)",
				}}
			/>

			{/* Top: logo mark + wordmark */}
			<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
				<div
					style={{
						width: 96,
						height: 96,
						borderRadius: 24,
						background: "#ffffff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 64,
						fontWeight: 800,
						color: PRIMARY,
						boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
					}}
				>
					V
				</div>
				<span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>
					Vendinhas
				</span>
			</div>

			{/* Middle: headline */}
			<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				<span
					style={{
						fontSize: 68,
						fontWeight: 800,
						lineHeight: 1.05,
						letterSpacing: -2,
						maxWidth: 940,
					}}
				>
					Gestão de vendas com inteligência artificial
				</span>
				<span
					style={{
						fontSize: 34,
						fontWeight: 400,
						color: "rgba(255,255,255,0.85)",
						maxWidth: 880,
						lineHeight: 1.3,
					}}
				>
					Vendas, estoque e clientes num só lugar. Comece grátis, sem cartão.
				</span>
			</div>

			{/* Bottom: feature pills + url */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<div style={{ display: "flex", gap: 16 }}>
					{["Controle de estoque", "CRM integrado", "Relatórios com IA"].map(
						(label) => (
							<div
								key={label}
								style={{
									display: "flex",
									alignItems: "center",
									padding: "14px 26px",
									borderRadius: 999,
									background: "rgba(255,255,255,0.15)",
									border: "1px solid rgba(255,255,255,0.25)",
									fontSize: 26,
									fontWeight: 600,
								}}
							>
								{label}
							</div>
						),
					)}
				</div>
				<span style={{ fontSize: 30, fontWeight: 700, opacity: 0.9 }}>
					vendinhas.app
				</span>
			</div>
		</div>,
		{ ...size },
	);
}

export default function OpengraphImage() {
	return renderOgCard();
}
