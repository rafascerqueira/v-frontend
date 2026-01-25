export function validateCPF(cpf: string): boolean {
	cpf = cpf.replace(/[^\d]/g, "");

	if (cpf.length !== 11) return false;
	if (/^(\d)\1+$/.test(cpf)) return false;

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += parseInt(cpf.charAt(i), 10) * (10 - i);
	}
	let remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	if (remainder !== parseInt(cpf.charAt(9), 10)) return false;

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += parseInt(cpf.charAt(i), 10) * (11 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	if (remainder !== parseInt(cpf.charAt(10), 10)) return false;

	return true;
}

export function validateCNPJ(cnpj: string): boolean {
	cnpj = cnpj.replace(/[^\d]/g, "");

	if (cnpj.length !== 14) return false;
	if (/^(\d)\1+$/.test(cnpj)) return false;

	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += parseInt(cnpj.charAt(i), 10) * weights1[i];
	}
	let remainder = sum % 11;
	const digit1 = remainder < 2 ? 0 : 11 - remainder;
	if (digit1 !== parseInt(cnpj.charAt(12), 10)) return false;

	sum = 0;
	for (let i = 0; i < 13; i++) {
		sum += parseInt(cnpj.charAt(i), 10) * weights2[i];
	}
	remainder = sum % 11;
	const digit2 = remainder < 2 ? 0 : 11 - remainder;
	if (digit2 !== parseInt(cnpj.charAt(13), 10)) return false;

	return true;
}

export function validateDocument(document: string): boolean {
	const cleaned = document.replace(/[^\d]/g, "");
	if (cleaned.length === 11) return validateCPF(cleaned);
	if (cleaned.length === 14) return validateCNPJ(cleaned);
	return false;
}

export function formatCPF(cpf: string): string {
	const cleaned = cpf.replace(/[^\d]/g, "");
	return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj: string): string {
	const cleaned = cnpj.replace(/[^\d]/g, "");
	return cleaned.replace(
		/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
		"$1.$2.$3/$4-$5",
	);
}

export function formatDocument(document: string): string {
	const cleaned = document.replace(/[^\d]/g, "");
	if (cleaned.length === 11) return formatCPF(cleaned);
	if (cleaned.length === 14) return formatCNPJ(cleaned);
	return document;
}

export function formatPhone(phone: string): string {
	const cleaned = phone.replace(/[^\d]/g, "");
	if (cleaned.length === 11) {
		return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}
	if (cleaned.length === 10) {
		return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	return phone;
}
