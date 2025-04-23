import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("coinflip", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the program directly from the binary
  const program = anchor.workspace.coinflip as any;

  const gameStateKey = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    program.programId
  )[0];
  const escrowKey = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("escrow")],
    program.programId
  )[0];

  it("Initializes the game", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Game initialization transaction signature:", tx);

    const gameState = await program.account["gameState"].fetch(gameStateKey);
    expect(gameState.admin.equals(provider.wallet.publicKey)).to.be.true;
  });

  it("Places a valid bet", async () => {
    const betAmount = anchor.web3.LAMPORTS_PER_SOL / 2; // 0.5 SOL
    const userChoice = 0; // Heads
    const betId = 1;

    const [betKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(betId.toString()),
      ],
      program.programId
    );

    const tx = await program.methods
      .placeBet(betAmount, userChoice, betId)
      .accounts({
        player: provider.wallet.publicKey,
        bet: betKey,
        escrow: escrowKey,
        gameState: gameStateKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Bet placement transaction signature:", tx);

    const bet = await program.account["bet"].fetch(betKey);
    expect(bet.amount.toNumber()).to.equal(betAmount);
    expect(bet.userChoice).to.equal(userChoice);
    expect(bet.player.equals(provider.wallet.publicKey)).to.be.true;
  });
});
