# Solana Coinflip Game

A Solana-based coinflip game where players can bet between 0.1 and 5 SOL and receive double their stake if they win, featuring blockchain-based randomization.

## Program Details

- **Program ID**: `BLW2czkQvfXUJFFNovX6BJgpikGx86xqdUuZyoBiX1GW`
- **Network**: Solana Devnet

## Game Mechanics

1. Players choose Heads (0) or Tails (1)
2. Players bet an amount between 0.1 and 5 SOL
3. The game uses blockchain data for randomization
4. Winners receive 2x their bet amount

## Program Instructions

### 1. Initialize

This instruction must be called once by the admin to set up the game.

```typescript
// Function signature
initialize(admin: PublicKey): TransactionInstruction
```

Accounts required:

    - admin: Signer who will be the admin of the game
    - gameState: PDA with seeds ["game_state"]
    - escrow: PDA with seeds ["escrow"]
    - systemProgram: System Program

### 2. Place bet

This instruction allows a player to place a bet and immediately determine the outcome.

```typescript
placeBet(
  player: PublicKey, 
  amount: number,  // in lamports (e.g., 1 SOL = 1,000,000,000 lamports)
  userChoice: number  // 0 for Heads, 1 for Tails
): TransactionInstruction
```

Accounts required:

    - player: Signer who is placing the bet
    - bet: PDA with seeds ["bet", player.publicKey, timestamp]
    - escrow: PDA with seeds ["escrow"]
    - gameState: PDA with seeds ["game_state"]
    - systemProgram: System Program

## Notes for developers

Notes for Developers

The game logic is handled entirely on-chain
Players need SOL in their Devnet wallet to place bets
Each bet will require the player to sign a transaction
The randomization is based on blockchain data, so it's predictable but suitable for demonstration purposes
For production use, consider implementing Pyth VRF for true verifiable randomness