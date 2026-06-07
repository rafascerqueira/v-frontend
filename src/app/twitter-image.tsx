import { renderOgCard } from "./opengraph-image";

// Twitter / X uses the same card art as Open Graph. Route config must be
// declared statically here (Next can't follow re-exported config fields).
export const runtime = "edge";
export const alt =
	"Vendinhas — Sistema de Gestão de Vendas com Inteligência Artificial";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
	return renderOgCard();
}
