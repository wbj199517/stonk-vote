import { createAppKit } from "@reown/appkit/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { metadata, projectId, solanaWeb3JsAdapter } from "./config";
import "./App.css";
import "./i18n";
import VotingPage from "./components/VotingPage";

// Create modal
createAppKit({
  projectId,
  metadata,
  themeMode: "dark",
  networks: [solana, solanaTestnet, solanaDevnet],
  adapters: [solanaWeb3JsAdapter],
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    connectMethodsOrder: ["wallet"],
  },
  themeVariables: {
    "--w3m-accent": "#000000",
  },
});

export function AppSol() {
  return (
    <div>
      <VotingPage />
    </div>
  );
}

export default AppSol;
