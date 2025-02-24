// src/solana.d.ts

import { PublicKey } from '@solana/web3.js';

interface Solana {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: () => void) => void;
  signMessage: (message: Uint8Array, encoding: 'utf8' | 'hex') => Promise<string>; // Add signMessage method
}

// Extend the Window interface to include the solana property
declare global {
  interface Window {
    solana: Solana;
  }
}

// src/walletconnect.d.ts
declare module '@walletconnect/client' {
  export interface WalletConnectClient {
    connected: boolean;
    connect: () => Promise<void>;
    accounts: string[];
  }

  export default class WalletConnect {
    constructor(options: { bridge: string; qrcodeModal: any });
    connect(): Promise<void>;
    on(event: string, callback: () => void): void;
    connected: boolean;
  }
}

declare module '@walletconnect/qrcode-modal' {
  export interface QRCodeModal {
    open(uri: string, onClose: () => void): void;
    close(): void;
  }

  const QRCodeModal: QRCodeModal;
  export default QRCodeModal;
}

