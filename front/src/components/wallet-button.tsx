'use client';

import { FC, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';

export const PhantomOnlyButton: FC = () => {
  const { publicKey, connected, disconnect, select } = useWallet();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const shortAddress = useMemo(() => {
    if (base58) {
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    }
    return '';
  }, [base58]);

  const connectPhantom = useCallback(() => {
    select('Phantom');
  }, [select]);

  if (connected && publicKey) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-white mb-1">{shortAddress}</span>
        <Button 
          variant="outline" 
          className="px-3 py-1 text-xs" 
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      className="bg-[#AB9FF2] hover:bg-[#9589D9] text-white" 
      onClick={connectPhantom}
    >
      Connect with Phantom
    </Button>
  );
};
