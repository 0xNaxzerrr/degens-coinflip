'use client';

import { FC, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

export const WalletButton: FC = () => {
  const { publicKey, connected, disconnect } = useWallet();

  // Tronquer l'adresse du wallet pour l'affichage
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const shortAddress = useMemo(() => {
    if (base58) {
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    }
    return '';
  }, [base58]);

  // Gérer la déconnexion
  const handleDisconnect = useCallback(async () => {
    if (disconnect) {
      await disconnect();
    }
  }, [disconnect]);

  // Si l'utilisateur est connecté, afficher son adresse et un bouton de déconnexion
  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-white">{shortAddress}</span>
        <Button 
          variant="outline" 
          className="px-3 py-1 text-xs" 
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Sinon, afficher le bouton de connexion par défaut de wallet-adapter-react-ui
  return <WalletMultiButton className="phantom-button" />;
};

// Un composant qui force Phantom uniquement
export const PhantomOnlyButton: FC = () => {
  const { publicKey, connected, disconnect, select } = useWallet();

  // Tronquer l'adresse du wallet pour l'affichage
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const shortAddress = useMemo(() => {
    if (base58) {
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    }
    return '';
  }, [base58]);

  // Gérer la connexion spécifiquement à Phantom
  const connectPhantom = useCallback(() => {
    select('Phantom');
  }, [select]);

  // Si l'utilisateur est connecté, afficher son adresse et un bouton de déconnexion
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

  // Sinon, afficher un bouton spécifique pour Phantom
  return (
    <Button 
      className="bg-[#AB9FF2] hover:bg-[#9589D9] text-white" 
      onClick={connectPhantom}
    >
      Connect with Phantom
    </Button>
  );
};

export default WalletButton; 