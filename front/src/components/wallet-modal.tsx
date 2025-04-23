"use client"

import { useState } from "react"
import Image from "next/image"

interface WalletModalProps {
    onClose: () => void
    onConnect: () => void
}

export default function WalletModal({ onClose, onConnect }: WalletModalProps) {
    const [connecting, setConnecting] = useState(false)

    const handleConnect = () => {
        setConnecting(true)
        // Simulate connection delay
        setTimeout(() => {
            onConnect()
            setConnecting(false)
        }, 1000)
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: "1rem",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(to bottom, rgba(154, 52, 18, 0.9), rgba(146, 64, 14, 0.9))",
                    borderRadius: "1rem",
                    border: "1px solid rgba(234, 88, 12, 0.3)",
                    width: "100%",
                    maxWidth: "28rem",
                    padding: "1.5rem",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        color: "#fdba74",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.5rem",
                    }}
                >
                    ×
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <Image src="/monkey-logo.png" alt="Monkey Coinflip" width={40} height={40} style={{ borderRadius: "50%" }} />
                    <h2
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "bold",
                            color: "#fdba74",
                            fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                            letterSpacing: "0.05em",
                            textShadow: "1px 1px 0 rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        Connect Your Wallet
                    </h2>
                </div>

                <p style={{ color: "#fdba74", marginBottom: "1.5rem" }}>
                    Connect your Solana wallet to start playing Monkey Flip and win SOL!
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            gap: "0.75rem",
                            backgroundColor: "rgba(154, 52, 18, 0.5)",
                            color: "#fdba74",
                            padding: "1.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid rgba(234, 88, 12, 0.3)",
                            cursor: connecting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ fontWeight: "500" }}>Phantom</span>
                        {connecting && <span style={{ marginLeft: "auto", animation: "pulse 2s infinite" }}>Connecting...</span>}
                    </button>

                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            gap: "0.75rem",
                            backgroundColor: "rgba(154, 52, 18, 0.5)",
                            color: "#fdba74",
                            padding: "1.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid rgba(234, 88, 12, 0.3)",
                            cursor: connecting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ fontWeight: "500" }}>Solflare</span>
                    </button>

                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        style={{
                            width: "100%",
                            justifyContent: "flex-start",
                            gap: "0.75rem",
                            backgroundColor: "rgba(154, 52, 18, 0.5)",
                            color: "#fdba74",
                            padding: "1.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid rgba(234, 88, 12, 0.3)",
                            cursor: connecting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ fontWeight: "500" }}>Backpack</span>
                    </button>
                </div>

                <p style={{ color: "rgba(253, 186, 116, 0.7)", fontSize: "0.75rem", marginTop: "1.5rem", textAlign: "center" }}>
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                </p>

                <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
            </div>
        </div>
    )
}
