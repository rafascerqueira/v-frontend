"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { api } from "@/lib/api";

type ExportFormat = "excel" | "pdf";
type ExportType = "orders" | "products" | "customers";

export function useExport() {
	const [isExporting, setIsExporting] = useState(false);
	const { hasFeature } = useSubscription();

	const exportData = async (
		type: ExportType,
		format: ExportFormat,
		params?: { startDate?: string; endDate?: string },
	) => {
		// Data export is a paid feature; the backend also returns 403. Surface the
		// upgrade prompt without firing a request we know will be rejected.
		if (!hasFeature("exportData")) {
			toast.error(
				"A exportação de dados está disponível no plano Pro. Faça upgrade para acessar.",
			);
			return;
		}

		setIsExporting(true);
		try {
			const queryParams = new URLSearchParams({ format });
			if (params?.startDate) queryParams.append("startDate", params.startDate);
			if (params?.endDate) queryParams.append("endDate", params.endDate);

			const response = await api.get(`/export/${type}?${queryParams}`, {
				responseType: "blob",
			});

			const extension = format === "excel" ? "xlsx" : "pdf";
			const contentType =
				format === "excel"
					? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
					: "application/pdf";

			const blob = new Blob([response.data], { type: contentType });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${type}-${Date.now()}.${extension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success(`Exportação de ${type} concluída!`);
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Erro ao exportar dados");
		} finally {
			setIsExporting(false);
		}
	};

	return { exportData, isExporting };
}
