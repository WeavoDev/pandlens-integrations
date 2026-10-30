import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const API_BASE_URL = 'https://api.pandlens.nl';

export function normalizePostcode(postcode: string): string {
	return String(postcode ?? '')
		.replace(/\s+/g, '')
		.toUpperCase();
}

export function throwForStatus(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	statusCode: number,
	body: unknown,
): never {
	const bodyText = typeof body === 'string' ? body : JSON.stringify(body ?? '');
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
			message:
				'Pandlens rate limit exceeded. Wait a minute and try again, or reduce parallel executions.',
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
	response?: { body?: unknown };
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
		throwForStatus(context, statusCode, payload);
	}
}
