import { AnchorProvider, Program, Wallet, web3 } from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import idl from './idl/degen_coin_flip.json';
import { BN } from '@project-serum/anchor';

// Program ID from your deployed contract
const programId = new PublicKey('BLW2czkQvfXUJFFNovX6BJgpikGx86xqdUuZyoBiX1GW');

// Fonction pour créer un wallet de test (uniquement pour le développement)
export const createTestWallet = () => {
  // Générer une paire de clés aléatoire
  const keypair = Keypair.generate();
  
  // Créer un objet wallet compatible avec Anchor
  const wallet = {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: Transaction) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: Transaction[]) => {
      txs.forEach(tx => tx.partialSign(keypair));
      return txs;
    },
    payer: keypair,
    _keypair: keypair
  };
  
  return wallet;
};

// Helper function to get the game state PDA
export const getGameStatePDA = async () => {
  const [gameState] = await PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    programId
  );
  return gameState;
};

// Helper function to get the escrow PDA
export const getEscrowPDA = async () => {
  const [escrow] = await PublicKey.findProgramAddressSync(
    [Buffer.from('escrow')],
    programId
  );
  return escrow;
};

// Helper function to get the bet PDA
export const getBetPDA = async (wallet: PublicKey, betId: number) => {
  // Utiliser BN.toArray pour la compatibilité maximale
  const betIdBuffer = Buffer.from(new BN(betId).toArray('le', 8));

  const [bet] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from('bet'),
      wallet.toBuffer(),
      betIdBuffer
    ],
    programId
  );
  return bet;
};

export const getProvider = (connection: Connection, wallet: any) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return provider;
};

export const getProgram = (provider: AnchorProvider) => {
  const program = new Program(idl as any, programId, provider);
  return program;
};

// Function to place a bet
export const placeBet = async (
  wallet: any,
  connection: Connection,
  amount: number,
  userChoice: 0 | 1,
  betId?: number
): Promise<{ success: boolean, signature?: string, error?: string, betId?: number }> => {
  try {
    // Vérifier si nous avons un wallet avec une clé publique
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Vérifier si le wallet a toutes les méthodes nécessaires
    if (!wallet.signTransaction) {
      // Si c'est juste une clé publique, créons un wallet en lecture seule pour la démonstration
      console.warn("Wallet sans méthode signTransaction détecté - creating read-only wallet");
      wallet = {
        publicKey: wallet.publicKey,
        signTransaction: async () => { throw new Error("Read-only wallet cannot sign"); },
        signAllTransactions: async () => { throw new Error("Read-only wallet cannot sign"); }
      };
    }

    const provider = getProvider(connection, wallet);
    const program = getProgram(provider);

    // Convert amount from SOL to lamports
    const lamports = amount * LAMPORTS_PER_SOL;

    // Get PDAs
    const gameState = await getGameStatePDA();
    const escrow = await getEscrowPDA();

    // Generate a unique bet ID based on timestamp if not provided
    const actualBetId = betId || Date.now();
    
    // Get bet PDA using the bet_id that will be part of the seed
    const bet = await getBetPDA(wallet.publicKey, actualBetId);

    console.log("Placing bet with:", {
      wallet: wallet.publicKey.toString(),
      amount: amount,
      userChoice: userChoice,
      betId: actualBetId,
      escrow: escrow.toString(),
      gameState: gameState.toString(),
      bet: bet.toString()
    });

    // Call the placeBet instruction avec seulement les deux arguments conformes à l'IDL
    // Note: Même si le programme Rust attend trois arguments, l'IDL n'en a que deux
    // La solution propre serait de mettre à jour l'IDL, mais cette approche est un contournement
    const tx = await program.methods
      .placeBet(
        new BN(lamports),
        userChoice
      )
      .accounts({
        player: wallet.publicKey,
        bet: bet,
        escrow: escrow,
        gameState: gameState,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { success: true, signature: tx, betId: actualBetId };
  } catch (error: any) {
    console.error('Error placing bet:', error);
    return { success: false, error: error.toString() };
  }
};

// Function to check the result of a bet
export const checkBetResult = async (
  connection: Connection,
  wallet: PublicKey,
  betId: number
) => {
  try {
    const provider = new AnchorProvider(
      connection,
      { publicKey: wallet } as any,
      AnchorProvider.defaultOptions()
    );
    const program = getProgram(provider);
    const bet = await getBetPDA(wallet, betId);
    
    // Afficher des informations sur le compte que nous essayons de récupérer
    console.log(`Checking bet account: ${bet.toString()} for wallet ${wallet.toString()} with betId ${betId}`);
    
    // Vérifier d'abord si le compte existe
    const accountInfo = await connection.getAccountInfo(bet);
    if (!accountInfo) {
      console.error('Bet account does not exist');
      return { success: false, error: 'Bet account not found' };
    }
    
    console.log('Account info found:', {
      owner: accountInfo.owner.toString(),
      lamports: accountInfo.lamports,
      data: accountInfo.data.length,
      executable: accountInfo.executable
    });
    
    try {
      const betAccount = await program.account.bet.fetch(bet) as any;
      console.log('Bet account data:', betAccount);
      
      // Décodage du statut (enum)
      let statusText;
      switch (betAccount.status.toString()) {
        case 'pending': statusText = 'En attente'; break;
        case 'won': statusText = 'Gagné'; break;
        case 'lost': statusText = 'Perdu'; break;
        default: statusText = `Inconnu (${betAccount.status.toString()})`;
      }
      
      return {
        success: true,
        result: betAccount.result, // 0 pour Pile (Heads), 1 pour Face (Tails)
        status: betAccount.status,
        statusText: statusText,
        amount: betAccount.amount.toString(),
        userChoice: betAccount.userChoice, // 0 pour Pile (Heads), 1 pour Face (Tails)
        player: betAccount.player.toString(),
        timestamp: betAccount.timestamp.toString(),
        isWon: betAccount.status.toString() === 'won',
        isLost: betAccount.status.toString() === 'lost',
        isPending: betAccount.status.toString() === 'pending',
        choiceText: betAccount.userChoice === 0 ? 'Pile (Heads)' : 'Face (Tails)',
        resultText: betAccount.result === 0 ? 'Pile (Heads)' : 'Face (Tails)',
      };
    } catch (fetchError) {
      console.error('Error fetching bet account data:', fetchError);
      return { 
        success: false, 
        error: `Error parsing bet account: ${fetchError.toString()}`,
        accountExists: true
      };
    }
  } catch (error: any) {
    console.error('Error checking bet result:', error);
    return { success: false, error: error.toString() };
  }
}; 