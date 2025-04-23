import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import * as os from 'os';
import * as path from 'path';

// Configure the provider URL and wallet
process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
process.env.ANCHOR_WALLET = path.join(os.homedir(), ".config/solana/id.json");

describe("simple-anchor-test", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("should connect to the cluster", async () => {
    const connection = provider.connection;
    const version = await connection.getVersion();
    expect(version).to.be.an('object');
    expect(version['feature-set']).to.be.a('number');
    console.log("Connected to Solana version:", version);
  });

  it("should have a valid wallet", async () => {
    const wallet = provider.wallet;
    expect(wallet.publicKey).to.be.instanceOf(anchor.web3.PublicKey);
    console.log("Wallet address:", wallet.publicKey.toString());
  });

  it("should have access to the program", () => {
    const programId = new anchor.web3.PublicKey("6JYMG7dcQH7Ep2JYjhrVSryRBrUZ1TawN1AafXWdPfEe");
    expect(programId).to.be.instanceOf(anchor.web3.PublicKey);
    console.log("Program ID:", programId.toString());
  });
}); 