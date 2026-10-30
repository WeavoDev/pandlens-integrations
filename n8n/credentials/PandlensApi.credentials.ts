// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PandlensApi implements ICredentialType {
	name = 'pandlensApi';

	displayName = 'Pandlens API';

	documentationUrl =
		'https://github.com/WeavoDev/pandlens-integrations/blob/main/docs/help-en.md';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Pandlens API key sent in the X-Api-Key header. Get a free key at https://pandlens.nl/en/signup',
		},
	];
}
