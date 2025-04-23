"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import CoinFlip from "@/components/coin-flip"
import BetControls from "@/components/bet-controls"
import { useAppKitAccount } from "@reown/appkit/react"

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const [betAmount, setBetAmount] = useState(0.1)
  const [isFlipping, setIsFlipping] = useState(false)
  const [choice, setChoice] = useState<0 | 1>(0) // 0 for heads, 1 for tails
  const [result, setResult] = useState<null | boolean>(null)
  const [bananas, setBananas] = useState<Array<{ id: number; left: number; top: number }>>([])
  const { address, isConnected } = useAppKitAccount()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const placeBet = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsFlipping(true)
    toast.loading("Transaction sent to Solana network...", { id: "transaction" })

    // Simulate blockchain delay
    setTimeout(() => {
      toast.success("Transaction confirmed!", { id: "transaction" })

      // Simulate random result (50/50 chance)
      const outcome = Math.random() > 0.5 ? 0 : 1
      const userWon = outcome === choice

      setTimeout(() => {
        setResult(userWon)
        setIsFlipping(false)

        if (userWon) {
          toast.success(`You won ${(betAmount * 2).toFixed(2)} SOL!`)
          spawnBananas()
        } else {
          toast.error(`You lost ${betAmount.toFixed(2)} SOL!`)
        }
      }, 3000) // After 3 seconds show result
    }, 2000) // Simulate 2 second blockchain confirmation
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(154, 52, 18, 0.2)",
            border: "1px solid rgba(234, 88, 12, 0.5)",
            borderRadius: "0.375rem",
            color: "rgb(255, 237, 213)",
          }}
        >
          <appkit-button />
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
                  backgroundColor: "#f59e0b",
                  borderRadius: "0.375rem",
                  padding: "0.75rem 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <appkit-button />
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
