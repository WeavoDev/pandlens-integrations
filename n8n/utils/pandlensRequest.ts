import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const API_BASE_URL = 'https://api.pandlens.nl';

export function normalizePostcode(postcode: string): string {
	return String(postcode ?? '')
		.replace(/\s+/g, '')
		.toUpperCase();
}

function parseJsonBody(body: unknown): IDataObject | null {
	if (body && typeof body === 'object' && !Array.isArray(body)) {
		return body as IDataObject;
	}
	if (typeof body !== 'string' || !body.trim()) {
		return null;
	}
	try {
		const parsed = JSON.parse(body) as unknown;
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as IDataObject)
			: null;
	} catch {
		return null;
	}
}

function errorCode(json: IDataObject | null): string | null {
	if (!json) return null;
	if (typeof json.error === 'string') return json.error;
	if (typeof json.code === 'string') return json.code;
	return null;
}

function formatAmbiguousCandidates(candidates: unknown): string {
	if (!Array.isArray(candidates) || candidates.length === 0) {
		return '';
	}
	return candidates
		.map((candidate) => {
			if (!candidate || typeof candidate !== 'object') {
				return String(candidate);
			}
			const row = candidate as IDataObject;
			const parts: string[] = [];
			if (row.postcode) parts.push(String(row.postcode));
			if (row.huisnummer !== undefined && row.huisnummer !== null) {
				parts.push(String(row.huisnummer));
			}
			if (row.huisletter) parts.push(String(row.huisletter));
			if (row.toevoeging) parts.push(String(row.toevoeging));
			if (row.straat) parts.push(String(row.straat));
			return parts.length > 0 ? parts.join(' ') : JSON.stringify(row);
		})
		.join('; ');
}

function rateLimitHint(headers: Record<string, unknown> | undefined): string {
	if (!headers) return '';
	const resetRaw =
		headers['x-ratelimit-reset'] ??
		headers['X-RateLimit-Reset'] ??
		headers['X-Ratelimit-Reset'];
	if (resetRaw === undefined || resetRaw === null || resetRaw === '') {
		return '';
	}
	const resetSeconds = Number(resetRaw);
	if (!Number.isFinite(resetSeconds)) {
		return '';
	}
	const waitMs = Math.max(0, resetSeconds * 1000 - Date.now());
	if (waitMs <= 0) {
		return ' You can retry now.';
	}
	const waitSeconds = Math.ceil(waitMs / 1000);
	if (waitSeconds < 120) {
		return ` Try again in about ${waitSeconds} second${waitSeconds === 1 ? '' : 's'}.`;
	}
	const waitMinutes = Math.ceil(waitSeconds / 60);
	return ` Try again in about ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`;
}

export function throwForStatus(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	statusCode: number,
	body: unknown,
	headers?: Record<string, unknown>,
): never {
	const json = parseJsonBody(body);
	const code = errorCode(json);
	const bodyText = typeof body === 'string' ? body : JSON.stringify(body ?? '');

	if (code === 'address_not_found') {
		const detail =
			typeof json?.message === 'string' && json.message.trim()
				? ` ${json.message.trim()}`
				: '';
		throw new NodeApiError(context.getNode(), {
			message: `No property was found for this postcode and house number.${detail} Check the postcode, house number, letter, and suffix.`,
			httpCode: String(statusCode),
			description: bodyText,
		});
	}

	if (code === 'address_ambiguous') {
		const listed = formatAmbiguousCandidates(json?.candidates);
		const suffix = listed
			? ` Possible matches: ${listed}.`
			: ' Add a house letter or suffix (toevoeging) to select one address.';
		throw new NodeApiError(context.getNode(), {
			message: `This postcode and house number match more than one address.${suffix}`,
			httpCode: String(statusCode),
			description: bodyText,
		});
	}

	if (statusCode === 401) {
		throw new NodeApiError(context.getNode(), {
			message:
				'Your Pandlens API key is invalid or missing. Create or copy a key from the Pandlens portal.',
			httpCode: '401',
			description: bodyText,
		});
	}
	if (statusCode === 402) {
		throw new NodeApiError(context.getNode(), {
			message:
				'Your Pandlens monthly lookup limit is reached. Upgrade your plan or wait until the next billing month.',
			httpCode: '402',
			description: bodyText,
		});
	}
	if (statusCode === 429) {
		throw new NodeApiError(context.getNode(), {
			message: `Pandlens rate limit exceeded.${rateLimitHint(headers)} Reduce parallel runs if this keeps happening.`,
			httpCode: '429',
			description: bodyText,
		});
	}
	throw new NodeApiError(context.getNode(), {
		message: `Pandlens API request failed (${statusCode}).`,
		httpCode: String(statusCode),
		description: bodyText,
	});
}

type HttpErrorLike = {
	statusCode?: number;
	message?: string;
	response?: { body?: unknown; headers?: Record<string, unknown> };
	headers?: Record<string, unknown>;
};

export async function pandlensGet(
	context: IExecuteFunctions,
	path: string,
	query: Record<string, string | number | boolean | undefined>,
): Promise<IDataObject> {
	const credentials = await context.getCredentials('pandlensApi');
	try {
		const body = (await context.helpers.httpRequest({
			method: 'GET',
			url: `${API_BASE_URL}${path}`,
			qs: query,
			headers: {
				'X-Api-Key': credentials.apiKey as string,
			},
			json: true,
		})) as IDataObject;
		return body;
	} catch (error) {
		const err = error as HttpErrorLike;
		const statusCode = err.statusCode ?? 500;
		const payload = err.response?.body ?? err.message;
		const headers = err.response?.headers ?? err.headers;
		throwForStatus(context, statusCode, payload, headers);
	}
}
