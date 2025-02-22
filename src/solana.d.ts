// src/solana.d.ts

import { PublicKey } from '@solana/web3.js';

interface Solana {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
}

// Extend the Window interface to include the solana property
declare global {
  interface Window {
    solana: Solana;
  }
}
