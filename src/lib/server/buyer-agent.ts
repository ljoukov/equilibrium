import { negotiate } from './negotiation';
import { getPrices } from './prices';
import { simulatePurchase } from './purchase';
import { makeDialog } from './tts';

export async function runBuyer({ product }: { product: string }) {
	console.log('runBuyer', { product });
	const { min_price, max_price } = await getPrices({ product });
	console.log({ min_price, max_price });
	//await escalationDialog();
	//await negotiate();
	await simulatePurchase();
	return { ok: true };
}

async function escalationDialog() {
	await makeDialog([
		{
			text: 'I’m looking to buy 1,000 rubber gloves. What’s your best price per glove?',
			speaker: 'cove'
		},
		{
			text: 'For that quantity, we’re pricing at $0.04 per glove. That’s $40 for 10 boxes.',
			speaker: 'juan'
		},
		{
			text: 'That’s a bit high. I’ve seen gloves priced significantly lower. Can you do better?',
			speaker: 'cove'
		},
		{
			text: 'Our gloves are top quality, and costs have been rising. This is a fair rate.',
			speaker: 'juan'
		},
		{
			text: 'Quality is important, but this is a volume purchase. Market prices are lower.',
			speaker: 'cove'
		},
		{
			text: 'Alright, I can lower it to $0.038 per glove. That’s the best I can do.',
			speaker: 'juan'
		},
		{
			text: 'Still outside our range. I’ve seen offers at $0.03 or less. We need to get closer.',
			speaker: 'cove'
		},
		{
			text: 'I doubt you’re getting this quality at that price. We stand by our product.',
			speaker: 'juan'
		},
		{
			text: 'If we can’t get under $0.035, I’ll have to check with my manager.',
			speaker: 'cove'
		},
		{
			text: 'Go ahead, but I don’t think anyone’s offering this quality for less.',
			speaker: 'juan'
		},
		{
			text: 'Let me bring my manager into this. Give me a moment.',
			speaker: 'cove'
		}
	]);
}

async function agreementDialog() {
	await makeDialog([
		{
			text: 'I’m looking to buy 1,000 rubber gloves. What’s your best price per glove?',
			speaker: 'cove'
		},
		{
			text: 'I appreciate your business. For this quantity, I can offer you a solid deal—$0.03 per glove. That’s competitive in today’s market.',
			speaker: 'juan'
		},
		{
			text: 'Three cents? Come on, I’ve been sourcing gloves for a while, and I know the market range. That’s on the high end. I was expecting something more reasonable.',
			speaker: 'cove'
		},
		{
			text: 'I hear you, but prices are fluctuating. Supply chain issues, demand spikes—you know how it is. At $0.03, you’re getting consistent quality and reliable delivery.',
			speaker: 'juan'
		},
		{
			text: 'Let’s be real, you and I both know that gloves are available for less. I respect your business, but I can’t justify overpaying.',
			speaker: 'cove'
		},
		{
			text: 'I’m not just selling gloves—I’m selling dependability. You want gloves that won’t tear, that arrive on time. The cheap stuff? It’s cheap for a reason.',
			speaker: 'juan'
		},
		{
			text: 'I’m all for quality, but I also have a budget. $0.015 per glove is what I’m seeing out there.',
			speaker: 'cove'
		},
		{
			text: 'No way. At that price, you’re getting leftovers from who-knows-where. If you’re serious, I can do $0.027, but that’s pushing it.',
			speaker: 'juan'
		},
		{
			text: 'That’s still not working for me. Look, I’ll be straightforward—I’m a buyer who comes back for more. You give me a fair deal, I’ll remember it.',
			speaker: 'cove'
		},
		{
			text: 'Future business is great, but I can’t lose money on this deal. How about $0.025? That’s already cutting into my margin.',
			speaker: 'juan'
		},
		{
			text: 'We’re getting there, but I still think you can do better. I’ll take all 1,000 gloves right now at $0.02 per glove. You get a clean sale, no hassle.',
			speaker: 'cove'
		},
		{ text: '$0.02? That’s tough. You’re really squeezing me here.', speaker: 'juan' },
		{
			text: 'I’m giving you a guaranteed sale. No chasing, no delays. Let’s lock it in.',
			speaker: 'cove'
		},
		{
			text: '…Alright. $0.02 per glove. But next time, we talk bulk pricing first.',
			speaker: 'juan'
		},
		{ text: 'Fair enough. Pleasure doing business.', speaker: 'cove' }
	]);
}
