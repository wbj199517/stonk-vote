import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Box,
  LinearProgress,
  Card,
  Divider,
} from "@mui/material";
import bs58 from "bs58";
import {
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { useNavigate } from "react-router-dom";
import backendService, { Topic } from "./backendService";
import stkLogo from "../assets/stklogo.png";
import bg from "../assets/bground1.jpeg";
import stkguy from "../assets/stkguy.png";
import { Provider } from "@reown/appkit-adapter-solana/react";

const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<"now" | "past" | "incoming">("now");
  const [votes, setVotes] = useState<{ [key: number]: number }>({});
  const [clickCount, setClickCount] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [optionColors, setOptionColors] = useState<{ [key: string]: string }>({
    USDT: "#4CAF50",
    SOL: "#FF9800",
    STONKS: "#2196F3",
  });
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { disconnect } = useDisconnect();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const response = await backendService.fetchTopics();
    if (response.data.length > 0) {
      const fetchedTopics = response.data;
      setTopics(fetchedTopics);
      let newVotes: { [key: string]: number } = {};
      for (const fetchedTopic of fetchedTopics) {
        const topicDetailsResponse = await backendService.fetchTopicDetails(
          fetchedTopic.id
        );

        if (topicDetailsResponse.code === 0 && topicDetailsResponse.data) {
          const topicDetails = topicDetailsResponse.data;

          topicDetails.options.forEach((option: any) => {
            const voteCount = parseInt(option.vote_count, 10) || 0;
            newVotes[option.id] = voteCount;
          });
        } else {
          console.error(topicDetailsResponse.message);
        }
      }

      setVotes(newVotes);
    } else {
      console.error(response.message);
    }
  };
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleLogoClick = () => {
    if (clickCount + 1 === 10) {
      setShowImage(true); // Show 彩蛋 after 10 clicks
    }
    setClickCount((prev) => prev + 1);
  };

  useEffect(() => {
    const uniqueOptions = new Set(
      topics.flatMap((topic) =>
        topic.options.map((opt: any) => opt.option_text)
      )
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
    if (!address) {
      alert("Please connect your wallet to vote.");
      return;
    }

    if (filter !== "now") {
      alert("您只能在正在进行投票中的话题投票。");
      return;
    }

    const selectedOption = topics
      .flatMap((topic) => topic.options)
      .find((option) => option.option_text === optionKey);
    if (!selectedOption) return;

    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const messageContent =
      `Signature for voting:\n` +
      `Topic ID: ${topicId}\n` +
      `Option ID: ${selectedOption.id}\n` +
      `Wallet: ${address}\n` +
      `Nonce: ${nonce}\n` +
      `Timestamp: ${new Date().toISOString()}`;

    console.log("Message to sign:", messageContent);

    if (!walletProvider || !address) throw Error("user is disconnected");

    const encodedMessage = new TextEncoder().encode(messageContent);
    console.log("encodedMessage: ", encodedMessage);
    const sig = await walletProvider.signMessage(encodedMessage);
    console.log("Signature: ", sig);
    let signature: string;
    signature = bs58.encode(sig);

    console.log("final signature", signature);
    const response = await backendService.sendVoteData(
      topicId,
      selectedOption.id,
      address,
      signature,
      messageContent
    );
    if (response.code !== 0) {
      console.error(response.message);
      alert("投票失败，请重新投票。");
    }
    loadTopics();
  };

  return (
    <div>
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
              top: "30vh",
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
        <appkit-button label="连接钱包" />
        {isConnected ? (
          <Button variant="outlined" color="error" onClick={handleDisconnect}>
            断开钱包
          </Button>
        ) : (
          <></>
        )}

        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="body2"
            sx={{ color: "#ffffff", marginBottom: 1, marginTop: 2 }}
          >
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
                  {topic.title}
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
                  {topic.options.map((option: any) => {
                    const totalVotes = topic.options.reduce(
                      (acc: any, option: any) => {
                        return acc + (votes[option.id] || 0);
                      },
                      0
                    );
                    const voteCount = votes[option.id] || 0;
                    const percentage = totalVotes
                      ? (voteCount / totalVotes) * 100
                      : 0;

                    return (
                      <Card
                        variant="outlined"
                        key={option.id}
                        sx={{
                          width: "100%",
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
                            {option.option_text} {percentage.toFixed(0)}%
                            (Total: {voteCount})
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
                          onClick={() =>
                            handleVote(option.option_text, topic.id)
                          }
                          fullWidth
                          disabled={!address}
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "rgba(23, 22, 22, 0.25)",
                            color: () =>
                              !address
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
    </div>
  );
};

export default VotingPage;
