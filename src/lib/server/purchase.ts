import {
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction,
	sendAndConfirmTransaction,
	SystemProgram,
	LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet } from '@project-serum/anchor';
import fs from 'fs';
import path from 'path';

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

// Example usage
async function example() {
	// Setup connection to the Solana devnet
	const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

	// Create keypairs for the participants
	// In a real application, these would likely be loaded from a file or wallet
	const buyer = Keypair.generate();
	const seller1 = Keypair.generate();
	const seller2 = Keypair.generate();

	// Request airdrops for testing (on devnet)
	const airdropBuyer = await connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);
	await connection.confirmTransaction(airdropBuyer);

	const airdropSeller1 = await connection.requestAirdrop(seller1.publicKey, 1 * LAMPORTS_PER_SOL);
	await connection.confirmTransaction(airdropSeller1);

	const airdropSeller2 = await connection.requestAirdrop(seller2.publicKey, 1 * LAMPORTS_PER_SOL);
	await connection.confirmTransaction(airdropSeller2);

	console.log(`Buyer pubkey: ${buyer.publicKey.toString()}`);
	console.log(`Seller 1 pubkey: ${seller1.publicKey.toString()}`);
	console.log(`Seller 2 pubkey: ${seller2.publicKey.toString()}`);

	// Create a wallet interface for the payer (buyer in this case)
	const payerWallet = new Wallet(buyer);

	// Program ID would be the deployed Anchor program
	const programId = 'YOUR_DEPLOYED_PROGRAM_ID'; // Replace with your actual program ID

	// Create the marketplace contract instance
	const marketplace = new MarketplaceContract(connection, payerWallet, programId);

	try {
		// Initialize the marketplace
		await marketplace.initialize(buyer, seller1, seller2);

		// Buyer sets max price of 1.5 SOL
		await marketplace.setMaxPrice(buyer, 1.5);

		// Sellers set their min prices
		await marketplace.setSeller1Price(seller1, 1.8); // Higher than buyer's max
		await marketplace.setSeller2Price(seller2, 1.2); // Lower than buyer's max

		// Execute the transaction - should select seller2 as the winner
		await marketplace.executeTransaction(buyer, seller1, seller2);

		// Get and display the final state
		const state = await marketplace.getMarketplaceState();
		console.log('Final marketplace state:', state);

		if (state) {
			if (state.isCompleted) {
				console.log(
					`Transaction completed! Winning seller: ${state.winningSellerIndex === 1 ? 'Seller 1' : 'Seller 2'}`
				);
				console.log(
					`Transaction amount: ${state.winningSellerIndex === 1 ? state.seller1Price.toNumber() : state.seller2Price.toNumber()} lamports`
				);
			} else {
				console.log("Transaction not completed. No seller met the buyer's price criteria.");
			}
		}
	} catch (error) {
		console.error('Error in marketplace example:', error);
	}
}

// Run the example
example().then(() => console.log('Example completed'));
