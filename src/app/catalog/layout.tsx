"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/contexts/CartContext";

export default function CatalogLayout({ children }: { children: ReactNode }) {
	return <CartProvider>{children}</CartProvider>;
}
