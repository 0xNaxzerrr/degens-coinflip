"use client";

import { createAppKit } from "@reown/appkit/react";
import { BaseWalletAdapter, SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solanaDevnet } from "@reown/appkit/networks";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ReactNode } from "react";
import WalletContextProvider from "./wallet-provider";

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
    wallets: [
        new PhantomWalletAdapter({}) as unknown as BaseWalletAdapter<string>,
        new SolflareWalletAdapter({}) as unknown as BaseWalletAdapter<string>,
    ],
});

// 1. Get projectId from https://cloud.reown.com
const projectId = "f375046b56534a772eac99dadbbe3a9c";

// 2. Create a metadata object - optional
const metadata = {
    name: "Monke flip",
    description: "a coin flip for monke",
    url: "https://example.com", // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Create modal
createAppKit({
    adapters: [solanaWeb3JsAdapter],
    networks: [solanaDevnet],
    metadata: metadata,
    projectId,
    features: {
        analytics: false, // Optional - defaults to your Cloud configuration
    },
});

const SolWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <WalletContextProvider>
            {children}
        </WalletContextProvider>
    )
}

export default SolWrapper