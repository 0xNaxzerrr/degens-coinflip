"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface CoinFlipProps {
    isFlipping: boolean
    result: boolean | null
    choice: 0 | 1
    setChoice: (choice: 0 | 1) => void
}

export default function CoinFlip({ isFlipping, result, choice, setChoice }: CoinFlipProps) {
    const [flipCount, setFlipCount] = useState(0)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const prevResultRef = useRef<boolean | null>(null)

    useEffect(() => {
        // Initialize audio
        if (typeof window !== "undefined" && !audioRef.current) {
            audioRef.current = new Audio("/monkey-sound.mp3")
        }

        // Clean up
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
        }
    }, [])

    useEffect(() => {
        if (isFlipping) {
            const interval = setInterval(() => {
                setFlipCount((prev) => prev + 1)
            }, 150)

            return () => clearInterval(interval)
        } else {
            setFlipCount(0)
        }
    }, [isFlipping])

    // Play monkey sound when result changes to false (loss)
    useEffect(() => {
        // Only play sound when result changes from null/true to false (player lost)
        if (result === false && prevResultRef.current !== false && !isFlipping) {
            if (audioRef.current) {
                audioRef.current.volume = 0.7 // Set volume to 70%
                audioRef.current.currentTime = 0 // Reset to beginning

                // Small delay to sync with the animation
                setTimeout(() => {
                    audioRef.current?.play().catch((err) => {
                        console.error("Error playing audio:", err)
                    })
                }, 300)
            }
        }

        // Update previous result
        prevResultRef.current = result
    }, [result, isFlipping])

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <button
                    onClick={() => !isFlipping && setChoice(0)}
                    style={{
                        width: "6rem",
                        padding: "0.5rem",
                        backgroundColor: choice === 0 ? "#f59e0b" : "rgba(154, 52, 18, 0.3)",
                        color: choice === 0 ? "#451a03" : "#fdba74",
                        border: choice === 0 ? "none" : "1px solid rgba(234, 88, 12, 0.3)",
                        borderRadius: "0.375rem",
                        cursor: isFlipping ? "not-allowed" : "pointer",
                    }}
                >
                    Heads
                </button>
                <button
                    onClick={() => !isFlipping && setChoice(1)}
                    style={{
                        width: "6rem",
                        padding: "0.5rem",
                        backgroundColor: choice === 1 ? "#f59e0b" : "rgba(154, 52, 18, 0.3)",
                        color: choice === 1 ? "#451a03" : "#fdba74",
                        border: choice === 1 ? "none" : "1px solid rgba(234, 88, 12, 0.3)",
                        borderRadius: "0.375rem",
                        cursor: isFlipping ? "not-allowed" : "pointer",
                    }}
                >
                    Tails
                </button>
            </div>

            <div
                style={{
                    position: "relative",
                    width: "10rem",
                    height: "10rem",
                    perspective: "1000px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.5s ease-in-out",
                        transform: isFlipping
                            ? `rotateY(${flipCount * 180}deg)`
                            : result === null
                                ? "rotateY(0deg)"
                                : result === (choice === 0)
                                    ? "rotateY(0deg)"
                                    : "rotateY(180deg)",
                    }}
                >
                    {/* Heads side */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            borderRadius: "50%",
                            background: "linear-gradient(to right, #fcd34d, #f59e0b)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            border: "4px solid #d97706",
                        }}
                    >
                        <div
                            style={{
                                width: "8rem",
                                height: "8rem",
                                borderRadius: "50%",
                                backgroundColor: "#fbbf24",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    color: "#92400e",
                                    fontWeight: "bold",
                                    fontSize: "1.5rem",
                                    fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                                    letterSpacing: "0.05em",
                                    textShadow: "1px 1px 0 rgba(0, 0, 0, 0.3)",
                                }}
                            >
                                HEADS
                            </div>
                        </div>
                    </div>

                    {/* Tails side */}
                    <div
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            borderRadius: "50%",
                            background: "linear-gradient(to right, #fb923c, #ea580c)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            border: "4px solid #c2410c",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <div
                            style={{
                                width: "8rem",
                                height: "8rem",
                                borderRadius: "50%",
                                backgroundColor: "#f97316",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    color: "#7c2d12",
                                    fontWeight: "bold",
                                    fontSize: "1.5rem",
                                    fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                                    letterSpacing: "0.05em",
                                    textShadow: "1px 1px 0 rgba(0, 0, 0, 0.3)",
                                }}
                            >
                                TAILS
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {result !== null && !isFlipping && (
                <div
                    style={{
                        marginTop: "1.5rem",
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        color: result ? "#4ade80" : "#f87171",
                        fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                        letterSpacing: "0.05em",
                        textShadow: "1px 1px 0 rgba(0, 0, 0, 0.3)",
                    }}
                >
                    {result ? "YOU WON!" : "YOU LOST!"}
                </div>
            )}

            {result === false && !isFlipping && (
                <div style={{ marginTop: "1rem" }}>
                    <Image
                        src="/sad-monkey.png"
                        alt="Sad Monkey"
                        width={150}
                        height={150}
                        style={{
                            animation: "bounce-slow 2s ease-in-out infinite",
                        }}
                    />
                </div>
            )}
        </div>
    )
}
