import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import pkg from '@project-serum/anchor';
const { BN } = pkg;

// Define the marketplace program IDL (Interface Definition Language)
// This would typically be imported from a generated file after building your Anchor program
interface MarketplaceIDL {
	version: string;
	name: string;
	instructions: any[];
	accounts: any[];
	events: any[];
}

// Define the marketplace state structure
interface MarketplaceState {
	buyer: PublicKey;
	seller1: PublicKey;
	seller2: PublicKey;
	maxPrice: BN;
	seller1Price: BN;
	seller2Price: BN;
	isActive: boolean;
	isCompleted: boolean;
	winningSellerIndex: number;
}

// Main marketplace class
export class MarketplaceContract {
	private connection: Connection;
	private programId: PublicKey;
	private provider: AnchorProvider;
	private program: Program<MarketplaceIDL>;
	private marketplacePDA: PublicKey;
	private marketplaceBump: number;

	constructor(connection: Connection, payerWallet: Wallet, programIdString: string) {
		this.connection = connection;
		this.programId = new PublicKey(programIdString);
		this.provider = new AnchorProvider(connection, payerWallet, { commitment: 'confirmed' });

		// Load the program - in a real implementation, you would load the IDL from a file
		// For this example, we're using a placeholder
		this.program = new Program(
			{} as MarketplaceIDL, // Placeholder for actual IDL
			this.programId,
			this.provider
		);

		// Initialize PDA and bump to be set later
		this.marketplacePDA = {} as PublicKey;
		this.marketplaceBump = 0;
	}

	// Initialize the marketplace with a buyer and two sellers
	async initialize(buyer: Keypair, seller1: Keypair, seller2: Keypair): Promise<string> {
		// Derive the marketplace PDA (Program Derived Address)
		const [marketplacePDA, marketplaceBump] = await PublicKey.findProgramAddress(
			[
				Buffer.from('marketplace'),
				buyer.publicKey.toBuffer(),
				seller1.publicKey.toBuffer(),
				seller2.publicKey.toBuffer()
			],
			this.programId
		);

		this.marketplacePDA = marketplacePDA;
		this.marketplaceBump = marketplaceBump;

		// Create the transaction to initialize the marketplace
		const tx = await this.program.methods
			.initialize()
			.accounts({
				marketplace: this.marketplacePDA,
				buyer: buyer.publicKey,
				seller1: seller1.publicKey,
				seller2: seller2.publicKey,
				systemProgram: SystemProgram.programId
			})
			.signers([buyer])
			.rpc();

		console.log(`Marketplace initialized with transaction signature: ${tx}`);
		console.log(`Marketplace PDA: ${this.marketplacePDA.toString()}`);

		return tx;
	}

	// Buyer sets the maximum price they're willing to pay
	async setMaxPrice(buyer: Keypair, maxPriceInSol: number): Promise<string> {
		const maxPriceLamports = new BN(maxPriceInSol * LAMPORTS_PER_SOL);

		const tx = await this.program.methods
			.setMaxPrice(maxPriceLamports)
			.accounts({
				marketplace: this.marketplacePDA,
				buyer: buyer.publicKey
			})
			.signers([buyer])
			.rpc();

		console.log(`Maximum price set to ${maxPriceInSol} SOL with transaction signature: ${tx}`);

		return tx;
	}

	// Seller 1 sets their minimum price
	async setSeller1Price(seller1: Keypair, minPriceInSol: number): Promise<string> {
		const minPriceLamports = new BN(minPriceInSol * LAMPORTS_PER_SOL);

		const tx = await this.program.methods
			.setSeller1Price(minPriceLamports)
			.accounts({
				marketplace: this.marketplacePDA,
				seller1: seller1.publicKey
			})
			.signers([seller1])
			.rpc();

		console.log(`Seller 1 price set to ${minPriceInSol} SOL with transaction signature: ${tx}`);

		return tx;
	}

	// Seller 2 sets their minimum price
	async setSeller2Price(seller2: Keypair, minPriceInSol: number): Promise<string> {
		const minPriceLamports = new BN(minPriceInSol * LAMPORTS_PER_SOL);

		const tx = await this.program.methods
			.setSeller2Price(minPriceLamports)
			.accounts({
				marketplace: this.marketplacePDA,
				seller2: seller2.publicKey
			})
			.signers([seller2])
			.rpc();

		console.log(`Seller 2 price set to ${minPriceInSol} SOL with transaction signature: ${tx}`);

		return tx;
	}

	// Execute the transaction if conditions are met
	// This will select the lowest price seller if their price is <= buyer's max price
	async executeTransaction(buyer: Keypair, seller1: Keypair, seller2: Keypair): Promise<string> {
		const tx = await this.program.methods
			.executeTransaction()
			.accounts({
				marketplace: this.marketplacePDA,
				buyer: buyer.publicKey,
				seller1: seller1.publicKey,
				seller2: seller2.publicKey,
				systemProgram: SystemProgram.programId
			})
			.signers([buyer])
			.rpc();

		console.log(`Transaction executed with signature: ${tx}`);

		return tx;
	}

	// Get the current state of the marketplace
	async getMarketplaceState(): Promise<MarketplaceState | null> {
		try {
			const state = await this.program.account.marketplace.fetch(this.marketplacePDA);
			return state as unknown as MarketplaceState;
		} catch (error) {
			console.error('Error fetching marketplace state:', error);
			return null;
		}
	}
}

async function requestAirdropWithRetry(
	connection: Connection,
	publicKey: PublicKey,
	amount: number,
	maxRetries: number = 3,
	delayMs: number = 1000
): Promise<string> {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const signature = await connection.requestAirdrop(publicKey, amount);
			await connection.confirmTransaction(signature);
			return signature;
		} catch (error: any) {
			if (i === maxRetries - 1) throw error;
			if (error?.message?.includes('429')) {
				console.log(`Rate limited, waiting ${delayMs}ms before retry ${i + 1}/${maxRetries}`);
				await new Promise((resolve) => setTimeout(resolve, delayMs));
				continue;
			}
			throw error;
		}
	}
	throw new Error('Max retries reached for airdrop');
}

export async function purchase() {
	// Setup connection to the Solana devnet
	const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

	// Create keypairs for the participants
	const buyer = Keypair.generate();
	const seller1 = Keypair.generate();
	const seller2 = Keypair.generate();

	console.log('Requesting airdrops (this may take a while)...');

	try {
		// Request smaller amounts to avoid rate limiting
		const airdropAmount = LAMPORTS_PER_SOL * 0.5; // Request 0.5 SOL instead of 2

		// Sequential airdrops with delay
		await requestAirdropWithRetry(connection, buyer.publicKey, airdropAmount);
		console.log('Buyer airdrop successful');

		await requestAirdropWithRetry(connection, seller1.publicKey, airdropAmount);
		console.log('Seller 1 airdrop successful');

		await requestAirdropWithRetry(connection, seller2.publicKey, airdropAmount);
		console.log('Seller 2 airdrop successful');

		console.log(`Buyer pubkey: ${buyer.publicKey.toString()}`);
		console.log(`Seller 1 pubkey: ${seller1.publicKey.toString()}`);
		console.log(`Seller 2 pubkey: ${seller2.publicKey.toString()}`);

		const payerWallet = new Wallet(buyer);
		const programId = 'CdX6x6CQm2n1mkTNsoCzKtKASg3No7LHDKD3dFd984PX';
		const marketplace = new MarketplaceContract(connection, payerWallet, programId);

		// Adjust prices to work with smaller amounts
		await marketplace.initialize(buyer, seller1, seller2);
		await marketplace.setMaxPrice(buyer, 0.4); // Reduced from 1.5
		await marketplace.setSeller1Price(seller1, 0.45); // Reduced from 1.8
		await marketplace.setSeller2Price(seller2, 0.3); // Reduced from 1.2

		await marketplace.executeTransaction(buyer, seller1, seller2);

		const state = await marketplace.getMarketplaceState();
		console.log('Final marketplace state:', state);

		if (state) {
			if (state.isCompleted) {
				console.log(
					`Transaction completed! Winning seller: ${state.winningSellerIndex === 1 ? 'Seller 1' : 'Seller 2'}`
				);
				console.log(
					`Transaction amount: ${(state.winningSellerIndex === 1 ? state.seller1Price.toNumber() : state.seller2Price.toNumber()) / LAMPORTS_PER_SOL} SOL`
				);
			} else {
				console.log("Transaction not completed. No seller met the buyer's price criteria.");
			}
		}
	} catch (error) {
		console.error('Error in marketplace example:', error);
		throw error; // Re-throw to ensure errors are properly handled by the caller
	}
}
