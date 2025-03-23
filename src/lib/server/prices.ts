import { APIFY_TOKEN } from '$env/static/private';
import { z } from 'zod';
import { getModel } from './config';

export const productSchema = z.object({
	title: z.string(),
	product_url: z.string().url(),
	min_price: z.number(),
	max_price: z.number(),
	product_image: z.string().url()
	// min_order: z.number()
});

export type Product = z.infer<typeof productSchema>;

async function callApify({ product }: { product: string }): Promise<Product[]> {
	const datasetId = 'vYjbsvVHpbG7ce526'; // use product
	const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
	console.log(url);
	const resp = await fetch(url);
	if (!resp.ok) {
		throw Error(`Apify failed`);
	}
	const json = await resp.json();
	const products = z.array(productSchema).parse(json);
	products.sort((a, b) => a.min_price - b.min_price);
	const topFiveProducts = products.slice(0, 5);
	console.log('apify', topFiveProducts);
	return topFiveProducts;
}

export async function getPrices({
	product
}: {
	product: string;
}): Promise<{ min_price: number; max_price: number }> {
	const products = await callApify({ product });
	if (products.length === 0) {
		return { min_price: 0, max_price: 0 };
	}
	const min_price = Math.min(...products.map((p) => p.min_price));
	const max_price = Math.max(...products.map((p) => p.max_price));

	console.log('model', getModel());

	return { min_price, max_price };
}
