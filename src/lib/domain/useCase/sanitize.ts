import { boardIdMaxLength } from './boardLimits';

export function sanitize(inputString: string) {
	let cleanString = inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

	cleanString = cleanString.split("/").join("");
	cleanString = cleanString.toLowerCase();
	cleanString = cleanString.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

	return `/${cleanString.slice(0, boardIdMaxLength)}`;
}
