import { TAVUS_KEY } from '$env/static/private';

interface NegotiationRequest {
	replica_id: string;
	conversational_context: string;
}

interface NegotiationResponse {
	// Add response type properties based on the API documentation
	// This is a placeholder interface
	[key: string]: any;
}

async function startNegotiation(
	apiKey: string,
	request: NegotiationRequest
): Promise<NegotiationResponse> {
	const response = await fetch('https://tavusapi.com/v2/conversations', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey
		},
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

export async function negotiate() {
	const request = {
		replica_id: 'rb17cf590e15',
		conversational_context: `\
You are an AI negotiation assistant speaking to a purchasing manager about a recent price discussion with a supplier for rubber gloves. Your goal is to summarize the negotiation and help the manager decide whether to proceed with the purchase or hold off for now.

Key Points to Cover:

You negotiated for 1,000 gloves but couldn’t get the price below 4 cents per glove.

The supplier insists on quality but won’t match the lower-end market price of 3 cents per glove.

The supplier is firm on their offer and unlikely to reduce further.

Competitor pricing exists, but quality might be uncertain.

If the manager values immediate supply and quality, accepting the price makes sense.

If cost savings are the priority, waiting and exploring other options could be better.

Steer the conversation by:

Asking if the manager wants to prioritize quality or cost.

Clarifying if waiting is an acceptable option.

Providing a concise, objective recommendation based on the priorities given.

End the conversation with a clear decision: either approve the purchase at the current price or hold off and seek alternatives`
	};
	const result = await startNegotiation(TAVUS_KEY, request);
	console.log({ result });
}
