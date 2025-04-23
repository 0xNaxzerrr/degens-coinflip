const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { BN } = require('bn.js');
const fs = require('fs');
const os = require('os');

// Chargez votre porte-monnaie
function loadWallet(keypairFile) {
  const keypairData = JSON.parse(fs.readFileSync(keypairFile, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

async function main() {
  // Configuration
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = loadWallet(os.homedir() + '/.config/solana/id.json');
  
  // ID de votre programme
  const programId = new PublicKey('7K22gKZ7nFshbGGBMZetA4W4Dakn58kauwhVTs3yHDk9');
  
  // Dérivez les PDAs
  const [gameStatePDA] = await PublicKey.findProgramAddress(
    [Buffer.from('game_state')],
    programId
  );
  
  const [escrowPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('escrow')],
    programId
  );
  
  // Choisissez un betId unique
  const betId = new BN(Math.floor(Math.random() * 1000000));
  
  const [betPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('bet'),
      wallet.publicKey.toBuffer(),
      betId.toArrayLike(Buffer, 'le', 8)
    ],
    programId
  );
  
  console.log('GameState PDA:', gameStatePDA.toString());
  console.log('Escrow PDA:', escrowPDA.toString());
  console.log('Bet PDA:', betPDA.toString());
  console.log('Using BetId:', betId.toString());
  
  try {
    // Définissez les paramètres
    const amount = new BN(100000000); // 0.1 SOL
    const userChoice = 0; // 0 pour Pile (Heads), 1 pour Face (Tails)
    
    console.log('Placing bet with:');
    console.log('- Amount:', amount.toString(), 'lamports (0.1 SOL)');
    console.log('- Choice:', userChoice === 0 ? 'Heads' : 'Tails');
    console.log('- BetId:', betId.toString());
    
    // Utilisez le discriminateur correct obtenu à partir du script get-discriminator.js
    // Remplacez ceci par le résultat que vous avez obtenu
    const placeBetDiscriminator = [
        222,  62,  67, 220,
         63, 166, 126,  33
      ]
    
    // Créez une instruction personnalisée pour place_bet
    const data = Buffer.concat([
      Buffer.from(placeBetDiscriminator),              // Discriminateur pour place_bet
      amount.toArrayLike(Buffer, 'le', 8),             // amount (u64)
      Buffer.from([userChoice]),                       // userChoice (u8)
      betId.toArrayLike(Buffer, 'le', 8)               // betId (u64)
    ]);

    // Créez la transaction
    const transaction = new Transaction().add({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },          // player
        { pubkey: betPDA, isSigner: false, isWritable: true },                   // bet
        { pubkey: escrowPDA, isSigner: false, isWritable: true },                // escrow
        { pubkey: gameStatePDA, isSigner: false, isWritable: false },            // gameState
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
      ],
      programId,
      data
    });

    // Envoyez la transaction
    const signature = await connection.sendTransaction(transaction, [wallet]);
    console.log('Transaction signature:', signature);
    
    // Attendez la confirmation
    await connection.confirmTransaction(signature);
    console.log('Transaction confirmed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().then(() => console.log('Done')).catch(console.error);