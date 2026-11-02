import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { normalizePostcode, pandlensGet } from '../../utils/pandlensRequest';

// Shared flatten helpers (mirrors ../shared/flatten.js for the compiled package)
function flattenObject(value: unknown, prefix: string, out: Record<string, unknown>): void {
	if (value === null || value === undefined) return;
	if (Array.isArray(value)) {
		out[prefix] = JSON.stringify(value);
		return;
	}
	if (typeof value !== 'object') {
		out[prefix] = value as string | number | boolean;
		return;
	}
	for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
		if (key === 'footprintGeoJson') continue;
		const next = prefix ? `${prefix}_${key}` : key;
		flattenObject(nested, next, out);
	}
}

function flattenEnrichment(body: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const section of ['address', 'bag', 'energyLabel', 'neighbourhood']) {
		if (body[section] !== undefined) {
			flattenObject(body[section], section, out);
		}
	}
	return out;
}

function flattenEnergyOnly(body: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	if (body.energyLabel) flattenObject(body.energyLabel, 'energyLabel', out);
	return out;
}

export class Pandlens implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pandlens',
		name: 'pandlens',
		icon: 'fa:home',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Look up Dutch property intelligence for a single address (postcode and house number). Each item is one API lookup.',
		defaults: {
			name: 'Pandlens',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'pandlensApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Enrich Address',
						value: 'enrichAddress',
						description:
							'Return building, registered energy label, and neighbourhood fields as flat JSON',
						action: 'Enrich an address',
					},
					{
						name: 'Get Energy Label',
						value: 'getEnergyLabel',
						description: 'Return only the registered energy label fields for the address',
						action: 'Get the energy label for an address',
					},
				],
				default: 'enrichAddress',
			},
			{
				displayName: 'Postcode',
				name: 'postcode',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['enrichAddress', 'getEnergyLabel'],
					},
				},
				description: 'Dutch postcode, with or without a space',
			},
			{
				displayName: 'House Number',
				name: 'huisnummer',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				required: true,
				displayOptions: {
					show: {
						operation: ['enrichAddress', 'getEnergyLabel'],
					},
				},
			},
			{
				displayName: 'House Letter',
				name: 'huisletter',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['enrichAddress', 'getEnergyLabel'],
					},
				},
			},
			{
				displayName: 'House Number Suffix',
				name: 'toevoeging',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['enrichAddress', 'getEnergyLabel'],
					},
				},
				description: 'Optional suffix (toevoeging), for example bis',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const operation = this.getNodeParameter('operation', itemIndex) as string;
			const postcode = normalizePostcode(this.getNodeParameter('postcode', itemIndex) as string);
			const huisnummer = this.getNodeParameter('huisnummer', itemIndex) as number;
			const huisletter = (this.getNodeParameter('huisletter', itemIndex) as string) || undefined;
			const toevoeging = (this.getNodeParameter('toevoeging', itemIndex) as string) || undefined;

			const query: Record<string, string | number | boolean | undefined> = {
				huisletter,
				toevoeging,
			};
			if (operation === 'getEnergyLabel') {
				query.include = 'energy';
			}

			const path = `/v1/address/${encodeURIComponent(postcode)}/${encodeURIComponent(String(huisnummer))}`;
			const body = await pandlensGet(this, path, query);

			const json = (
				operation === 'getEnergyLabel' ? flattenEnergyOnly(body) : flattenEnrichment(body)
			) as IDataObject;

			returnData.push({
				json,
				pairedItem: { item: itemIndex },
			});
		}

		return [returnData];
	}
}
