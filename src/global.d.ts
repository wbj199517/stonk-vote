// global.d.ts
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  };
  
  
  okxwallet?: {
    isOKExWallet?: boolean;

    solana: {
      connect: () => any;
      on:any;
      signMessage:any;

    };
    getAccount: () => Promise<string>;
    signMessage: (message: Uint8Array, encoding: 'utf8' | 'hex') => Promise<string>; // Add signMessage method
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  };

  trustwallet?: {
    isTrust?: boolean;
    solana: {
      connect: () => Promise<{ publicKey: string }>;
    };
  };
}
