import { runBuyer } from '$lib/server/buyer-agent';
import { getPrices } from '$lib/server/prices';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const getParam = (name: string): string => {
			const value = data.get(name);
			if (!value || typeof value !== 'string') {
				throw Error(`parameter ${name} is missing`);
			}
			return value;
		};
		const product = getParam('product');
		return await runBuyer({ product });
	}
};
