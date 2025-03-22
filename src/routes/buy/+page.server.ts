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
		console.log({ product });
		return { ok: true };
	}
};
