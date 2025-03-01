import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  projectId,
  metadata,
  networks,
  wagmiAdapter,
  solanaWeb3JsAdapter,
} from "./config";
import VotingPage from "./components/VotingPage";
import "./App.css";
import "./i18n";
const queryClient = new QueryClient();

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: "dark" as const,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    "--w3m-accent": "#000000",
  },
};

// Create modal
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
});

export function App() {
  return (
    <div>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <VotingPage />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
