import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Box,
  LinearProgress,
  Card,
  Divider,
  Modal,
} from "@mui/material";
import bs58 from "bs58";
import SignClient from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { useNavigate } from "react-router-dom";
import mockBackend, { Topic } from "./mockBackend";
import stkLogo from "./image/stklogo.png";
import bg from "./image/bground1.jpeg";
import stkguy from "./image/stkguy.png";
import phantomLogo from "./logos/phantom.png";
import okxLogo from "./logos/okx.png";
import trustLogo from "./logos/trust.jpeg";

const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<"now" | "past" | "incoming">("now");
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<{ [key: number]: boolean }>({});
  const [optionColors, setOptionColors] = useState<{ [key: string]: string }>({
    USDT: "#4CAF50",
    SOL: "#FF9800",
    STONKS: "#2196F3",
  });
  const [walletOptionOpen, setWalletOptionOpen] = useState(false);
  const [SelectedWallet, setSelectedWallet] = useState("");
  const [availableWallets, setAvailableWallets] = useState<
    Record<string, boolean>
  >({});

  const WALLET_INFO = {
    phantom: {
      name: "Phantom",
      icon: phantomLogo,
      downloadUrl: "https://phantom.app/",
    },
    okx: {
      name: "OKX Wallet",
      icon: okxLogo,
      downloadUrl: "https://www.okx.com/web3",
    },
    metamask: {
      name: "MetaMask",
      icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      downloadUrl: "https://metamask.io/",
    },
    trustwallet: {
      name: "Trust Wallet",
      icon: trustLogo,
      downloadUrl: "https://trustwallet.com/",
    },
    walletconnect: {
      name: "WalletConnect",
      icon: "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg",
      downloadUrl: "https://walletconnect.com/",
    },
  };
  useEffect(() => {
    const detectedWallets = checkWalletProviders();
    console.log("Detected wallets:", detectedWallets);
    setAvailableWallets(detectedWallets);
  }, []);

  useEffect(() => {
    loadTopics();
  }, []);

  const handleClickOpen = () => {
    setWalletOptionOpen(true);
  };

  const handleClose = () => {
    setWalletOptionOpen(false);
  };

  const handleSelectWallet = (walletType: string) => {
    console.log("Selected wallet:", walletType);
    // Call your connectWallet function here
    setSelectedWallet(walletType);
    connectWalletNew(walletType);
    handleClose();
  };

  const checkWalletProviders = () => {
    const providers = {
      phantom: (window as any).solana?.isPhantom,
      okx: (window as any).okxwallet?.isOKExWallet,
      metamask: (window as any).ethereum?.isMetaMask,
      trustwallet: (window as any).trustwallet?.isTrust,
      walletconnect: true, // WalletConnect is always available
    };

    const availableWallets: Record<string, boolean> = {};
    for (const [key, isAvailable] of Object.entries(providers)) {
      if (isAvailable) {
        availableWallets[key] = true;
        console.log(`Found wallet: ${key}`);
      }
    }

    return availableWallets;
  };

  const loadTopics = async () => {
    const response = await mockBackend.fetchTopics();
    if (response.code === 0 && response.data.length > 0) {
      const fetchedTopics = response.data;
      setTopics(fetchedTopics);
      for (const fetchedTopic of fetchedTopics) {
        const topicDetailsResponse = await mockBackend.fetchTopicDetails(
          fetchedTopic.id
        );
        if (topicDetailsResponse.code === 0 && topicDetailsResponse.data) {
          const topicDetails = topicDetailsResponse.data;
          setVotes((prevVotes) => ({
            ...prevVotes,
            ...topicDetails.options.reduce((acc, option) => {
              acc[option.option_text] = option.vote_count;
              return acc;
            }, {} as { [key: string]: number }),
          }));
          setTotalVotes(
            (prevTotal) =>
              prevTotal +
              topicDetails.options.reduce(
                (acc, option) => acc + option.vote_count,
                0
              )
          );
        } else {
          console.error(topicDetailsResponse.message);
        }
      }
    } else {
      console.error(response.message);
    }
  };
  // Connect to wallet
  const connectWalletNew = async (type: string) => {
    try {
      let walletAddress: "" | string = "";

      switch (type) {
        case "phantom":
          if (!window.solana?.isPhantom) {
            window.open("https://phantom.app/", "_blank");
            throw new Error("请安装 Phantom 钱包");
          }
          const phantomResp = await window.solana.connect();
          walletAddress = phantomResp.publicKey.toString();
          break;

        case "okx":
          if (!window.okxwallet?.isOKExWallet) {
            window.open("https://www.okx.com/web3", "_blank");
            throw new Error("请安装 OKX 钱包");
          }
          try {
            const provider = window.okxwallet.solana;
            const resp = await provider.connect();
            walletAddress = resp.publicKey.toString();
          } catch (err) {
            console.error("OKX wallet connect error:", err);
            throw new Error("OKX 钱包连接失败");
          }
          break;

        case "metamask":
          if (!window.ethereum?.isMetaMask) {
            window.open("https://metamask.io/", "_blank");
            throw new Error("请安装 MetaMask 钱包");
          }
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          walletAddress = accounts[0];
          break;

        case "trustwallet":
          if (!window.trustwallet?.isTrust) {
            window.open("https://trustwallet.com/", "_blank");
            throw new Error("请安装 Trust Wallet");
          }
          const trustResp = await window.trustwallet.solana.connect();
          walletAddress = trustResp.publicKey.toString();
          break;

        case "walletconnect":
          const signClient = await SignClient.init({
            projectId: "471f8b666303999a24c8ca965b2384ee",
          });

          const { uri, approval } = await signClient.connect({
            requiredNamespaces: {
              eip155: {
                methods: [
                  "eth_signTransaction",
                  "personal_sign",
                  "eth_sendTransaction",
                ],
                chains: ["eip155:1"], // Ethereum mainnet
                events: ["chainChanged", "accountsChanged"],
              },
            },
          });

          if (uri) {
            QRCodeModal.open(uri, () => console.log("QR Code Modal Closed"));
          }

          const session = await approval();
          walletAddress = session.namespaces.eip155.accounts[0].split(":")[2]; // Extract wallet address

          console.log("WalletConnect session:", session);
          QRCodeModal.close();
          break;
        default:
          // connectWallet();
          throw new Error("不支持的钱包类型");
      }
      setWalletAddress(walletAddress);

      console.log("Connected wallet address:", walletAddress);
      return {
        address: walletAddress,
        type: type,
      };
    } catch (err) {
      console.error("Wallet connection error:", err);
      throw err;
    }
  };

  const handleLogoClick = () => {
    if (clickCount + 1 === 10) {
      setShowImage(true); // Show 彩蛋 after 10 clicks
    }
    setClickCount((prev) => prev + 1);
  };

  const checkIfWalletHasVoted = async () => {
    if (walletAddress) {
      const updatedHasVoted: { [key: number]: boolean } = {};
      for (const topic of topics) {
        const voteRecordResponse = await mockBackend.fetchWalletVoteRecord(
          topic.id,
          walletAddress
        );
        if (
          voteRecordResponse.code === 0 &&
          voteRecordResponse.data?.vote_amount !== "0" &&
          voteRecordResponse.data?.topic_id === topic.id
        ) {
          updatedHasVoted[topic.id] = true;
        } else {
          updatedHasVoted[topic.id] = false;
        }
      }
      setHasVoted(updatedHasVoted);
      console.log("voted?", hasVoted);
    }
  };

  useEffect(() => {
    checkIfWalletHasVoted();
  }, [walletAddress, topics]);

  useEffect(() => {
    const uniqueOptions = new Set(
      topics.flatMap((topic) => topic.options.map((opt) => opt.option_text))
    );
    setOptionColors((prevColors) => {
      const newColors = { ...prevColors };
      uniqueOptions.forEach((option) => {
        if (!newColors[option]) {
          newColors[option] = `#${Math.floor(Math.random() * 16777215).toString(
            16
          )}`;
        }
      });
      return newColors;
    });
  }, [topics]);

  const handleVote = async (optionKey: string, topicId: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet to vote.");
      return;
    }

    if (hasVoted[topicId]) {
      alert("You have already voted for this topic with this wallet address!");
      return;
    }

    const selectedOption = topics
      .flatMap((topic) => topic.options)
      .find((option) => option.option_text === optionKey);
    if (!selectedOption) return;

    // Update votes locally for demo/mock use
    setVotes((prevVotes) => ({
      ...prevVotes,
      [optionKey]: (prevVotes[optionKey] || 0) + 1,
    }));
    setTotalVotes((prevTotal) => prevTotal + 1);
    setHasVoted((prev) => ({ ...prev, [topicId]: true }));

    const nonce = Math.random().toString(36).substring(2, 15);
    const messageContent =
      `Signature for voting:\n` +
      `Topic ID: ${topicId}\n` +
      `Option ID: ${selectedOption.id}\n` + // Use selectedOption.id instead of selectedOption
      `Wallet: ${walletAddress}\n` +
      `Nonce: ${nonce}\n` +
      `Timestamp: ${new Date().toISOString()}`;
    let signature: string;
    try {
      signature = await handleSignMessage(messageContent);
    } catch (err: any) {
      if (err.code === 4001) {
        // User rejected the request

        // Rollback the vote if signing fails
        setVotes((prevVotes) => ({
          ...prevVotes,
          [optionKey]: (prevVotes[optionKey] || 0) - 1,
        }));
        setTotalVotes((prevTotal) => prevTotal - 1);
        setHasVoted((prev) => ({ ...prev, [topicId]: false }));
        return;
      }

      // Handle other potential errors
      console.log(err);
      alert("An error occurred while signing the message. Please try again.");
      return;
    }

    // If the signing was successful, send the vote data
    const response = await mockBackend.sendVoteData(
      topicId,
      selectedOption.id,
      walletAddress,
      nonce,
      signature
    );
    if (response.code !== 0) {
      console.error(response.message);
      alert("Failed to submit your vote. Please try again.");
    }
    //  uncomment below in real api call
    // loadTopics();
  };

  const handleSignMessage = async (message: string) => {
    const messageBytes = new TextEncoder().encode(message);
    let signature: string;
    try {
      if (window.ethereum?.isMetaMask && SelectedWallet === "metamask") {
        console.log("Signing message with MetaMask");
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        });
      } else if (window.okxwallet?.isOKExWallet && SelectedWallet === "okx") {
        console.log("Signing message with OKX wallet");
        const signedMessage = await window.okxwallet.solana.signMessage(
          messageBytes,
          "utf8"
        );
        signature = bs58.encode(new TextEncoder().encode(signedMessage));
      } else if (window.solana?.isPhantom && SelectedWallet === "phantom") {
        console.log("Signing message with Phantom wallet");
        const signedMessage = await window.solana.signMessage(
          messageBytes,
          "utf8"
        );
        signature = bs58.encode(new TextEncoder().encode(signedMessage));
      } else {
        throw new Error("未找到支持的钱包");
      }
    } catch (err: any) {
      if (err.code === 4001) {
        alert("用户拒绝了签名请求");
        throw err;
      } else {
        throw err;
      }
    }

    return signature;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setHasVoted({});
    setSelectedWallet("");
    alert("Wallet disconnected. You can connect again.");
  };

  if (topics.length === 0) return null;

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: 4,
        backgroundColor: "#121212",
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {showImage && (
        <img
          src={stkguy}
          alt="stkguy"
          style={{
            position: "absolute",
            top: 0,
            right: "20%",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
      )}

      <Button
        variant="text"
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          top: { xs: "3%", sm: "5%" }, // Responsive positioning
          left: { xs: "3%", sm: "5%" },
          color: "white",
          fontSize: { xs: "1rem", sm: "1.2rem" }, // Responsive font size
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        Home
      </Button>
      <img
        src={stkLogo}
        alt="Logo"
        style={{
          width: "150px",
          height: "auto",
          marginBottom: "20px",
          cursor: "pointer",
        }}
        onClick={handleLogoClick}
      />
      <Box sx={{ marginTop: 2, marginBottom: 4 }}>
        <Button
          variant="outlined"
          onClick={handleClickOpen}
          sx={{
            backgroundColor: "#3f51b5",
            color: "white",
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
        >
          连接钱包
        </Button>

        <Modal open={walletOptionOpen} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50%",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              选择钱包
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(WALLET_INFO)
                .filter(([key]) => availableWallets[key]) // Only include available wallets
                .map(([key, { name, icon, downloadUrl }]) => (
                  <Button
                    key={key}
                    variant="contained"
                    onClick={() => handleSelectWallet(key)}
                    sx={{
                      backgroundColor: "#3f51b5",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#303f9f",
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <img
                      src={icon}
                      alt={name}
                      style={{ width: 24, height: 24 }}
                    />
                    {name}
                  </Button>
                ))}
            </Box>
          </Box>
        </Modal>
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", color: "#ffffff", marginBottom: 1 }}
        >
          当前钱包：{SelectedWallet ? SelectedWallet : "未选择"}
        </Typography>

        {walletAddress ? (
          <>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "#ffffff", marginBottom: 1 }}
            >
              已连接: {walletAddress}
            </Typography>
            <Button variant="outlined" color="error" onClick={disconnectWallet}>
              断开钱包
            </Button>
          </>
        ) : (
          <> </>
        )}
      </Box>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="body2" sx={{ color: "#ffffff", marginBottom: 1 }}>
          Filter Topics:
        </Typography>
        <Button
          variant={filter === "now" ? "contained" : "outlined"}
          onClick={() => setFilter("now")}
          sx={{ marginRight: 1 }}
        >
          Now
        </Button>
        <Button
          variant={filter === "past" ? "contained" : "outlined"}
          onClick={() => setFilter("past")}
          sx={{ marginRight: 1 }}
        >
          Past
        </Button>
        <Button
          variant={filter === "incoming" ? "contained" : "outlined"}
          onClick={() => setFilter("incoming")}
        >
          Incoming
        </Button>
      </Box>

      <Box
        sx={{
          maxWidth: "800px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {topics
          .filter((topic) => {
            const now = new Date();
            const startTime = new Date(topic.start_time);
            const endTime = new Date(topic.end_time);
            if (filter === "now") {
              return now >= startTime && now <= endTime;
            } else if (filter === "past") {
              return now > endTime;
            } else if (filter === "incoming") {
              return now < startTime;
            }
            return true;
          })
          .map((topic) => (
            <Box key={topic.id} sx={{ width: "100%", marginBottom: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#ffffff" }}
              >
                {topic.title} {hasVoted[topic.id] && "（您已投票）"}
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ color: "#aaaaaa", fontSize: "16px", marginBottom: 2 }}
              >
                开始：
                <span style={{ fontWeight: "bold" }}>
                  {new Date(topic.start_time).toLocaleString()}
                </span>{" "}
                | 结束：
                <span style={{ fontWeight: "bold" }}>
                  {new Date(topic.end_time).toLocaleString()}
                </span>
              </Typography>
              <Box sx={{ maxWidth: "600px", margin: "auto", paddingTop: 2 }}>
                {topic.options.map((option) => {
                  const percentage = totalVotes
                    ? (votes[option.option_text] / totalVotes) * 100
                    : 0;
                  return (
                    <Card
                      variant="outlined"
                      key={option.option_text}
                      sx={{
                        width: "90%",
                        backgroundColor: "rgba(43, 42, 42, 0.15)",
                        padding: "2vh",
                        transition: "background-color 0.3s ease-in-out",
                        color: "white",
                        backdropFilter: "blur(8px)",
                        marginBottom: 2,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(23, 22, 22, 0.45)",
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        <strong>
                          {option.option_text} {percentage.toFixed(0)}% (Total:{" "}
                          {votes[option.option_text]})
                        </strong>
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          marginBottom: 2,
                          height: 10,
                          backgroundColor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              optionColors[
                                option.option_text as keyof typeof optionColors
                              ] || "#3f51b5",
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleVote(option.option_text, topic.id)}
                        fullWidth
                        disabled={hasVoted[topic.id] || !walletAddress}
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: "rgba(23, 22, 22, 0.25)",
                          color: (theme) =>
                            hasVoted[topic.id] || !walletAddress
                              ? "rgba(255, 255, 255, 0.6) !important"
                              : "white !important",
                          "&:hover": {
                            backgroundColor: "#303f9f !important",
                          },
                        }}
                      >
                        Vote
                      </Button>
                    </Card>
                  );
                })}
              </Box>
              <Divider sx={{ marginY: 4 }} />
            </Box>
          ))}
      </Box>
      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "black",
          color: "white",
          padding: "16px 0",
          position: "relative",
          bottom: 0,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">Powered by STONKS Community</Typography>
      </Box>
    </Box>
  );
};

export default VotingPage;
