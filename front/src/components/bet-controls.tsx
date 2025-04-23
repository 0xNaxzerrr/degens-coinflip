"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface BetControlsProps {
    betAmount: number
    setBetAmount: (amount: number) => void
    isFlipping: boolean
}

export default function BetControls({ betAmount, setBetAmount, isFlipping }: BetControlsProps) {
    const [inputValue, setInputValue] = useState(betAmount.toString())

    useEffect(() => {
        setInputValue(betAmount.toString())
    }, [betAmount])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)

        const value = Number.parseFloat(e.target.value)
        if (!isNaN(value)) {
            // Clamp value between 0.1 and 5
            const clampedValue = Math.min(Math.max(value, 0.1), 5)
            setBetAmount(clampedValue)
        }
    }

    const presetAmounts = [0.1, 0.5, 1, 2, 5]

    return (
        <div>
            <label
                style={{
                    display: "block",
                    color: "#fdba74",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                }}
            >
                Bet Amount (SOL)
            </label>

            <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                min={0.1}
                max={5}
                step={0.1}
                disabled={isFlipping}
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "rgba(78, 20, 7, 0.5)",
                    border: "1px solid rgba(234, 88, 12, 0.3)",
                    borderRadius: "0.375rem",
                    color: "#fdba74",
                    marginBottom: "0.75rem",
                }}
            />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "0.5rem",
                }}
            >
                {presetAmounts.map((amount) => (
                    <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        disabled={isFlipping}
                        style={{
                            backgroundColor: betAmount === amount ? "#f59e0b" : "rgba(154, 52, 18, 0.3)",
                            color: betAmount === amount ? "#451a03" : "#fdba74",
                            border: betAmount === amount ? "none" : "1px solid rgba(234, 88, 12, 0.3)",
                            borderRadius: "0.375rem",
                            padding: "0.5rem",
                            cursor: isFlipping ? "not-allowed" : "pointer",
                        }}
                    >
                        {amount}
                    </button>
                ))}
            </div>
        </div>
    )
}
