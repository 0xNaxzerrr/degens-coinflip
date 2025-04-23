"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import CoinFlip from "@/components/coin-flip"
import BetControls from "@/components/bet-controls"
import { useAppKitAccount } from "@reown/appkit/react"
import { placeBet as placeSolanaBet, createTestWallet, getBetPDA, getEscrowPDA, getGameStatePDA, checkBetResult } from "@/lib/solana"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { PhantomOnlyButton } from "@/components/wallet-button"
import { BN, Program } from "@project-serum/anchor"
import idl from "@/lib/idl/degen_coin_flip.json"

// Program ID from your deployed contract
const programId = new PublicKey('BLW2czkQvfXUJFFNovX6BJgpikGx86xqdUuZyoBiX1GW');

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const [betAmount, setBetAmount] = useState(0.1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [choice, setChoice] = useState<0 | 1>(0) // 0 for heads, 1 for tails
  const [result, setResult] = useState<null | boolean>(null)
  const [bananas, setBananas] = useState<Array<{ id: number; left: number; top: number }>>([])
  const { address, isConnected: isAppKitConnected } = useAppKitAccount()
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [latestBetId, setLatestBetId] = useState<number | null>(null)
  const [testWallet, setTestWallet] = useState<any>(null)

  const isConnected =  publicKey

  const displayWalletInfo = () => {
    console.log("Wallet Status:")
    console.log("AppKit Connected:", isAppKitConnected)
    console.log("AppKit Address:", address)
    console.log("Wallet Adapter Connected:", publicKey ? true : false)
    console.log("Wallet Adapter PublicKey:", publicKey?.toString())
    console.log("Test Wallet Active:", testWallet !== null)
    console.log("Test Wallet PublicKey:", testWallet?.publicKey?.toString())
    console.log("Combined isConnected:", isConnected)
    console.log("SendTransaction available:", typeof sendTransaction === 'function')

    // Vérification de Phantom dans window
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const phantomExists = !!window.phantom?.solana;
      console.log("Phantom existe dans window:", phantomExists);
    }
  }


  useEffect(() => {
    setIsMounted(true)
    
    // Vérification de Phantom dans la fenêtre
    const checkPhantom = () => {
      // @ts-ignore
      const isPhantomInstalled = window.phantom?.solana?.isPhantom;
      if (isPhantomInstalled) {
        console.log("Phantom est installé ✓");
      } else {
        console.log("Phantom n'est pas installé ✗");
      }
    };

    // Vérification après montage du composant
    if (typeof window !== 'undefined') {
      checkPhantom();
    }
    
    // Log wallet status on mount and when connection status changes
    displayWalletInfo()
  }, [isConnected, publicKey, address])

  const placeBet = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    // Afficher les informations détaillées du wallet
    displayWalletInfo()

    // Déterminer quel wallet utiliser
    const activeWallet = testWallet || { publicKey: publicKey || (address ? new PublicKey(address) : null) };

    // Si nous n'avons pas de clé publique, montrer une erreur
    if (!activeWallet.publicKey) {
      toast.error("Wallet connection issue. Please reconnect.")
      return
    }

    setIsFlipping(true)
    toast.loading("Preparing transaction...", { id: "transaction" })

    try {
      // Generate a unique bet ID based on timestamp
      const betId = Date.now()
      setLatestBetId(betId)

      // Vérifier si nous utilisons Phantom directement
      if (publicKey && sendTransaction) {
        toast.info(`Using Phantom wallet: ${publicKey.toString().slice(0, 10)}...`, { id: "wallet-info" })
        
        try {
          // Création manuelle de la transaction
          const walletPubkey = publicKey;
          const lamports = betAmount * LAMPORTS_PER_SOL;
          const userChoice = choice;
          
          // Obtenir les PDAs nécessaires
          const gameState = await getGameStatePDA();
          const escrow = await getEscrowPDA();
          const bet = await getBetPDA(walletPubkey, betId);
          
          console.log("Creating transaction with:", {
            wallet: walletPubkey.toString(),
            amount: betAmount,
            userChoice: userChoice,
            betId: betId,
            escrow: escrow.toString(),
            gameState: gameState.toString(),
            bet: bet.toString()
          });
          
          // Obtenir le blockhash récent
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          
          // Créer une nouvelle transaction
          const transaction = new Transaction({
            feePayer: walletPubkey,
            blockhash,
            lastValidBlockHeight
          });
          
          // Ajouter les instructions pour l'instruction placeBet
          // Note: Comme le programme attend place_bet avec 3 args mais l'IDL n'en définit que 2
          // On utilise une transaction simple avec serializeData pour inclure les données correctes
          const betIdBuffer = Buffer.from(new BN(betId).toArray('le', 8));
          const lamportsBuffer = Buffer.from(new BN(lamports).toArray('le', 8));
          const userChoiceBuffer = Buffer.from([userChoice]);
          
          // Créer l'instruction manuelle
          transaction.add({
            keys: [
              { pubkey: walletPubkey, isSigner: true, isWritable: true },
              { pubkey: bet, isSigner: false, isWritable: true },
              { pubkey: escrow, isSigner: false, isWritable: true },
              { pubkey: gameState, isSigner: false, isWritable: false },
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            programId,
            data: Buffer.concat([
              // Discriminator pour place_bet (8 premiers octets)
              Buffer.from([222, 62, 67, 220, 63, 166, 126, 33]),
              lamportsBuffer,           // amount (u64)
              userChoiceBuffer,         // userChoice (u8)
              betIdBuffer               // betId (u64)
            ])
          });
          
          // Envoyer la transaction via wallet-adapter
          const signature = await sendTransaction(transaction, connection);
          
          toast.success("Transaction sent!", { id: "transaction" });
          toast.info(`Transaction signature: ${signature.slice(0, 10)}...`, { id: "tx-info" });
          
          // Attendre la confirmation de la transaction
          const confirmation = await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature
          });
          
          if (confirmation.value.err) {
            toast.error(`Transaction failed: ${confirmation.value.err}`, { id: "transaction" });
            setIsFlipping(false);
            return;
          }
          
          toast.success("Transaction confirmed!", { id: "transaction" });
          
          // Pour le développement, nous simulons encore le résultat
          setTimeout(() => {
            const userWon = Math.random() > 0.5;
            setResult(userWon);
            setIsFlipping(false);
            
            if (userWon) {
              toast.success(`You won ${(betAmount * 2).toFixed(2)} SOL!`);
              spawnBananas();
            } else {
              toast.error(`You lost ${betAmount.toFixed(2)} SOL!`);
            }
          }, 2000);
          
        } catch (txError: any) {
          console.error("Transaction error with Phantom:", txError);
          toast.error(`Transaction error: ${txError.message}`, { id: "transaction" });
          setIsFlipping(false);
          
          // Fallback to simulation after error
          toast.warning("Falling back to simulation mode", { id: "simulation", duration: 3000 });
          simulateBet();
        }
      } else {
        // Si ce n'est pas Phantom ou pas de sendTransaction, utiliser la simulation
        toast.warning("Using simulation mode (wallet cannot sign)", { id: "transaction", duration: 5000 });
        simulateBet();
      }
    } catch (error: any) {
      console.error("Error placing bet:", error)
      toast.error(`Error: ${error.message || "Unknown error"}`, { id: "transaction" })
      setIsFlipping(false)
    }
  }
  
  // Fonction pour simuler un pari
  const simulateBet = () => {
    setTimeout(() => {
      toast.success("Transaction simulated!", { id: "transaction" })
      const userWon = Math.random() > 0.5
      setResult(userWon)
      setIsFlipping(false)
      if (userWon) {
        toast.success(`You won ${(betAmount * 2).toFixed(2)} SOL!`)
        spawnBananas()
      } else {
        toast.error(`You lost ${betAmount.toFixed(2)} SOL!`)
      }
    }, 2000)
  }

  const spawnBananas = () => {
    // Use fixed positions for bananas to avoid hydration mismatch
    const fixedPositions = [
      { left: 10, top: 20 },
      { left: 30, top: 15 },
      { left: 50, top: 25 },
      { left: 70, top: 10 },
      { left: 90, top: 30 },
      { left: 20, top: 40 },
      { left: 40, top: 35 },
      { left: 60, top: 45 },
      { left: 80, top: 50 },
      { left: 15, top: 60 },
      { left: 35, top: 55 },
      { left: 55, top: 65 },
      { left: 75, top: 70 },
      { left: 25, top: 80 },
      { left: 45, top: 75 },
      { left: 65, top: 85 },
      { left: 85, top: 90 },
      { left: 5, top: 95 },
      { left: 95, top: 5 },
      { left: 50, top: 50 },
    ]

    const newBananas = fixedPositions.map((pos, i) => ({
      id: Date.now() + i,
      left: pos.left,
      top: pos.top,
    }))

    setBananas(newBananas)

    // Remove bananas after animation
    setTimeout(() => {
      setBananas([])
    }, 3000)
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#2d1600",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background bananas with fixed positions - only shown after client-side hydration */}
      {isMounted &&
        [
          { left: "10%", top: "15%", rotate: "5deg" },
          { left: "25%", top: "35%", rotate: "-10deg" },
          { left: "40%", top: "20%", rotate: "8deg" },
          { left: "60%", top: "70%", rotate: "-5deg" },
          { left: "75%", top: "25%", rotate: "12deg" },
          { left: "85%", top: "60%", rotate: "-8deg" },
          { left: "15%", top: "80%", rotate: "7deg" },
          { left: "50%", top: "40%", rotate: "-12deg" },
          { left: "30%", top: "65%", rotate: "9deg" },
          { left: "70%", top: "10%", rotate: "-7deg" },
          { left: "90%", top: "45%", rotate: "6deg" },
          { left: "5%", top: "50%", rotate: "-9deg" },
          { left: "55%", top: "85%", rotate: "11deg" },
          { left: "80%", top: "75%", rotate: "-6deg" },
          { left: "35%", top: "5%", rotate: "10deg" },
        ].map((banana, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              fontSize: "2rem",
              zIndex: 0,
              left: banana.left,
              top: banana.top,
              opacity: 0.2,
              transform: `rotate(${banana.rotate})`,
            }}
          >
            🍌
          </div>
        ))}

      {/* Falling bananas animation - only shown after client-side hydration */}
      {isMounted &&
        bananas.map((banana) => (
          <div
            key={banana.id}
            style={{
              position: "absolute",
              fontSize: "2rem",
              zIndex: 50,
              left: `${banana.left}%`,
              top: `${banana.top}%`,
              animation: "fall 3s linear forwards",
            }}
          >
            🍌
          </div>
        ))}

      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Image src="/monkey-logo.png" alt="Monkey Coinflip" width={50} height={50} style={{ borderRadius: "50%" }} />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#f59e0b",
              fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
              letterSpacing: "0.05em",
              textShadow: "1px 1px 0 rgba(0, 0, 0, 0.3)",
            }}
          >
            MONKEY FLIP
          </h1>
        </div>

        {/* Wallets Buttons Container */}
        <div 
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}
        >
          {/* Phantom Button */}
          <div
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(154, 52, 18, 0.2)",
              border: "1px solid rgba(234, 88, 12, 0.5)",
              borderRadius: "0.375rem",
              color: "rgb(255, 237, 213)",
            }}
          >
            <PhantomOnlyButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          padding: "2rem 0",
          width: "100%",
          maxWidth: "400px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "rgba(154, 52, 18, 0.4)",
            borderRadius: "1rem",
            border: "1px solid rgba(234, 88, 12, 0.2)",
            padding: "2rem",
            width: "100%",
          }}
        >
          <CoinFlip isFlipping={isFlipping} result={result} choice={choice} setChoice={setChoice} />

          <div style={{ marginTop: "2rem" }}>
            <BetControls betAmount={betAmount} setBetAmount={setBetAmount} isFlipping={isFlipping} />
            {isConnected ? (
              <button
                onClick={placeBet}
                disabled={isFlipping}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  backgroundColor: "#f59e0b",
                  color: "#451a03",
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                  padding: "1.5rem 0",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: isFlipping ? "not-allowed" : "pointer",
                  fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                {isFlipping ? "Flipping..." : "FLIP COIN"}
              </button>
            ) : (
              <div
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  backgroundColor: "rgba(245, 158, 11, 0.8)",
                  borderRadius: "0.375rem",
                  padding: "0.75rem 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#451a03",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                <appkit-button label="CONNECT WALLET" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(253, 186, 116, 0.7)",
          fontSize: "0.875rem",
          zIndex: 10,
        }}
      >
        <p>Monkey Flip © 2024</p>
        <p>Powered by Solana</p>
      </div>

      {/* Large monkey background - LEFT */}
      <div
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          display: "flex",
          alignItems: "center",
          zIndex: 0,
        }}
      >
        <Image
          src="/monkey-logo.png"
          alt="Monkey Background"
          width={500}
          height={500}
          style={{
            objectFit: "contain",
            opacity: 0.3,
            marginLeft: "-80px",
          }}
        />
      </div>

      {/* Small monkey background - RIGHT */}
      <div
        style={{
          position: "absolute",
          right: "0",
          top: "20%",
          zIndex: 0,
        }}
      >
        <Image
          src="/monkey-logo.png"
          alt="Monkey Background"
          width={200}
          height={200}
          style={{
            objectFit: "contain",
            opacity: 0.3,
            transform: "rotate(15deg)",
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  )
}
