import React, { useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Typography,
  Box,
  LinearProgress,
  Card,
  Divider,
  Modal,
  Toolbar,
} from "@mui/material";
import bs58 from "bs58";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
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
  const [errMessage, setErrMessage] = useState("");
  const [showErr, setShowErr] = useState(false);
  const [optionColors, setOptionColors] = useState<{ [key: string]: string }>({
    USDT: "#4CAF50",
    SOL: "#FF9800",
    STONKS: "#2196F3",
  });
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { disconnect } = useDisconnect();
  const { t } = useTranslation();

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
      setErrMessage(t("wallet_connect_warn"));
      setShowErr(true);
      return;
    }

    if (filter !== "now") {
      setErrMessage("t('vote_time_warn')");
      setShowErr(true);
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
      const err_message =
        t("vote_failed") + t(`response_messages.${response.code}`);
      setErrMessage(err_message);
      setShowErr(true);
    } else {
      setErrMessage(t("vote_success"));
      setShowErr(true);
    }
    loadTopics();
  };

  return (
    <div>
           {/* HEADER */}
           <AppBar position="static" sx={{ backgroundColor: "black", paddingY: 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-evenly", }}>
          {/* Home Button (Left) */}
          <Typography
            variant="h6"
            component="a"
            onClick={() => navigate("/")}
            sx={{
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Home
          </Typography>

          <appkit-button label={t("connect_wallet")} />
        </Toolbar>
      </AppBar>
      <Modal
        open={showErr}
        onClose={() => setShowErr(false)}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography id="error-modal-title" variant="h6" component="h2">
            {t("info_box")}
          </Typography>
          <Typography id="error-modal-description" sx={{ mt: 2 }}>
            {errMessage}
          </Typography>
          <Button
            onClick={() => setShowErr(false)}
            variant="contained"
            sx={{ mt: 2 }}
          >
            {t("Close")}
          </Button>
        </Box>
      </Modal>

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

        <LanguageSwitcher />
        

        <Box sx={{ marginBottom: 4 }}>
          <Typography
            variant="body2"
            sx={{ color: "#ffffff", marginBottom: 1, marginTop: 2 }}
          >
            {t("filter_topic")}
          </Typography>
          <Button
            variant={filter === "now" ? "contained" : "outlined"}
            onClick={() => setFilter("now")}
            sx={{ marginRight: 1 }}
          >
            {t("now")}
          </Button>
          <Button
            variant={filter === "past" ? "contained" : "outlined"}
            onClick={() => setFilter("past")}
            sx={{ marginRight: 1 }}
          >
            {t("past")}
          </Button>
          <Button
            variant={filter === "incoming" ? "contained" : "outlined"}
            onClick={() => setFilter("incoming")}
          >
            {t("upcoming")}
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
                  {t("start_date")}
                  <span style={{ fontWeight: "bold" }}>
                    {new Date(topic.start_time).toLocaleString()}
                  </span>{" "}
                  | {t("end_date")}
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
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography variant="h6">
                            <strong>{option.option_text}</strong>
                          </Typography>
                          <Typography variant="h6">
                            <strong>
                              {percentage.toFixed(0)}% ({t("total_vote")}:{" "}
                              {voteCount.toLocaleString()})
                            </strong>
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            marginBottom: 2,
                            marginTop: 1,
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
                          {t("vote")}
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
        <Typography variant="body2">{t("footer")}</Typography>
      </Box>
    </div>
  );
};

export default VotingPage;
