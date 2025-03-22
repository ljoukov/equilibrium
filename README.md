# Hackathorn

[https://devpost.com/software/equilibrium-sol](https://devpost.com/software/equilibrium-sol)

## Inspiration

Take a dentistry.
The dentistry needs to buy various supplies pretty much all the time.
Lets imagine rubber gloves are running out.
Dentistry uses Equilibrium:SOL to negotiate best procurement conditions, escalating to owner if needed using AI Human.
Transaction happens on Solana.

## What it does

Dentistry has **buyer agents** which gets triggered (eg supply runs low or customer influx anticipated) to make a purchase.

First purchase preparation agent:

- researches the current market price for the product (Apify scraping Alibaba & Amazon)
- uses LLM to cleanup and normalize pricing data (eg price per glove and minimum order size)

Negotiation agent:

- talks to seller agents and negotiates the price/volume/timeline (without revealing all the info upfront)

Solana Contract:

- after negotiation buyer and sellers enter the contract on Solana (purchase)

Human escalation:

- If during negotiation buyer is stuck it uses Tavus to call the business owner and explains the isse
- Business owner may abort or continue transaction

## How we built it

Tools used:

- All the code (Typescript, Svelte) runs on Render
- Prompts, model, config management: LaunchDarkly
- LLM interactions are recorded on Langtrace
- Seller agents are authenticated on Stytch
- Negotiation workflow is managed on Cloudflare:Workflows

## Challenges we ran into

- listings on Alibaba are confusing
- hard to make LLMs negotiate without revealing all details

## Accomplishments that we're proud of

- Working end-to-end
- Natural language negotiation and Solana contracts
- Nice handling of escalations

## What we learned

Talking to AI human is cool
Classic engineering problems (flags, cloud, scraping) are evergreen
Agent authentication is important (thanks Stytch)
Gemini is fast
Solana is awesome
Tracing LLMs is a must

## What's next for Equilibrium:SOL

It might end up in a real SaaS!
