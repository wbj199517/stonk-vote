import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  LinearProgress,
  Card,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import mockBackend, { Topic } from './mockBackend';
import stkLogo from './image/stklogo.png';
import bg from './image/bground1.jpeg';
import stkguy from './image/stkguy.png';

const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<'now' | 'past' | 'incoming'>('now');
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [optionColors, setOptionColors] = useState<{ [key: string]: string }>({
    USDT: '#4CAF50',
    SOL: '#FF9800',
    STONKS: '#2196F3',
  });

  useEffect(() => {
    const loadTopics = async () => {
      setLoading(true);
      const response = await mockBackend.fetchTopics();
      if (response.code === 0 && response.data.length > 0) {
        const fetchedTopics = response.data;
        setTopics(fetchedTopics);
        for (const fetchedTopic of fetchedTopics) {
          const topicDetailsResponse = await mockBackend.fetchTopicDetails(fetchedTopic.id);
          if (topicDetailsResponse.code === 0 && topicDetailsResponse.data) {
            const topicDetails = topicDetailsResponse.data;
            setVotes((prevVotes) => ({
              ...prevVotes,
              ...topicDetails.options.reduce((acc, option) => {
                acc[option.option_text] = option.vote_count;
                return acc;
              }, {} as { [key: string]: number }),
            }));
            setTotalVotes((prevTotal) =>
              prevTotal + topicDetails.options.reduce((acc, option) => acc + option.vote_count, 0)
            );
          } else {
            console.error(topicDetailsResponse.message);
          }
        }
      } else {
        console.error(response.message);
      }
      setLoading(false);
    };

    loadTopics();
  }, []);
  
  const handleLogoClick = () => {
    if (clickCount + 1 === 10) {
      setShowImage(true); // Show 彩蛋 after 10 clicks
    }
    setClickCount(prev => prev + 1);
  };

  const checkIfWalletHasVoted = async () => {
    if (walletAddress) {
      const updatedHasVoted: { [key: number]: boolean } = {};
      for (const topic of topics) {
        const voteRecordResponse = await mockBackend.fetchWalletVoteRecord(topic.id, walletAddress);
        if (voteRecordResponse.code === 0 && voteRecordResponse.data?.vote_amount !== '0' && voteRecordResponse.data?.topic_id === topic.id) {
          updatedHasVoted[topic.id] = true;
        } else {
          updatedHasVoted[topic.id] = false;
        }
      }
      setHasVoted(updatedHasVoted);
    }
  };

  useEffect(() => {
    checkIfWalletHasVoted();
  }, [walletAddress, topics]);

  useEffect(() => {
    const uniqueOptions = new Set(topics.flatMap((topic) => topic.options.map((opt) => opt.option_text)));
    setOptionColors((prevColors) => {
      const newColors = { ...prevColors };
      uniqueOptions.forEach((option) => {
        if (!newColors[option]) {
          newColors[option] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
      });
      return newColors;
    });
  }, [topics]);

  const handleVote = async (optionKey: string, topicId: number) => {
    if (!walletAddress) {
      alert('Please connect your wallet to vote.');
      return;
    }

    if (hasVoted[topicId]) {
      alert('You have already voted for this topic with this wallet address!');
      return;
    }

    const selectedOption = topics.flatMap((topic) => topic.options).find((option) => option.option_text === optionKey);
    if (!selectedOption) return;

    setVotes((prevVotes) => ({
      ...prevVotes,
      [optionKey]: prevVotes[optionKey] + 1,
    }));
    setTotalVotes((prevTotal) => prevTotal + 1);
    setHasVoted((prev) => ({ ...prev, [topicId]: true }));

    const nonce = Math.random().toString(36).substring(2, 15);
    const response = await mockBackend.sendVoteData(topicId, selectedOption.id, walletAddress, nonce);
    if (response.code !== 0) {
      console.error(response.message);
    }
  };

  const connectWallet = async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Wallet not found. Please install it.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setHasVoted({});
    alert('Wallet disconnected. You can connect again.');
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4, backgroundColor: '#121212', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ marginTop: 2, color: 'white' }}>
          Loading topic data...
        </Typography>
      </Box>
    );
  }

  if (topics.length === 0) return null;

  return (
    <Box
      sx={{
        textAlign: 'center',
        padding: 4,
        backgroundColor: '#121212',
        minHeight: '100vh',
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {showImage && (
        <img
          src={stkguy}
          alt="stkguy"
          style={{
            position: 'absolute',
            top: 0,
            right: '20%',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      )}

      <Button
        variant="text" 
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: { xs: '3%', sm: '5%' }, // Responsive positioning
          left: { xs: '3%', sm: '5%' },
          color: 'white',
          fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive font size
          fontWeight: 'bold', 
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Home
      </Button>
      <img
        src={stkLogo}
        alt="Logo"
        style={{
          width: '150px',
          height: 'auto',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
        onClick={handleLogoClick} 
      />
      <Box sx={{ marginTop: 2, marginBottom: 4 }}>
        {walletAddress ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff', marginBottom: 1 }}>
              Connected: {walletAddress}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={disconnectWallet}
            >
              断开钱包
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={connectWallet}
            sx={{
              backgroundColor: '#3f51b5',
              color: 'white',
              '&:hover': {
                backgroundColor: '#303f9f',
              },
            }}
          >
            连接钱包
          </Button>
        )}
      </Box>

      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="body2" sx={{ color: '#ffffff', marginBottom: 1 }}>
          Filter Topics:
        </Typography>
        <Button
          variant={filter === 'now' ? 'contained' : 'outlined'}
          onClick={() => setFilter('now')}
          sx={{ marginRight: 1 }}
        >
          Now
        </Button>
        <Button
          variant={filter === 'past' ? 'contained' : 'outlined'}
          onClick={() => setFilter('past')}
          sx={{ marginRight: 1 }}
        >
          Past
        </Button>
        <Button
          variant={filter === 'incoming' ? 'contained' : 'outlined'}
          onClick={() => setFilter('incoming')}
        >
          Incoming
        </Button>
      </Box>

      <Box sx={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {topics.filter((topic) => {
          const now = new Date();
          const startTime = new Date(topic.start_time);
          const endTime = new Date(topic.end_time);
          if (filter === 'now') {
            return now >= startTime && now <= endTime;
          } else if (filter === 'past') {
            return now > endTime;
          } else if (filter === 'incoming') {
            return now < startTime;
          }
          return true;
        }).map((topic) => (
          <Box key={topic.id} sx={{ width: '100%', marginBottom: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffff' }}>
              {topic.title} {hasVoted[topic.id] && '（您已投票）'}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#aaaaaa', fontSize: '16px', marginBottom: 2 }}>
              开始：<span style={{ fontWeight: 'bold' }}>{new Date(topic.start_time).toLocaleString()}</span> |
              结束：<span style={{ fontWeight: 'bold' }}>{new Date(topic.end_time).toLocaleString()}</span>
            </Typography>
            <Box sx={{ maxWidth: '600px', margin: 'auto', paddingTop: 2 }}>
              {topic.options.map((option) => {
                const percentage = totalVotes ? (votes[option.option_text] / totalVotes) * 100 : 0;
                return (
                  <Card
                    variant="outlined"
                    key={option.option_text}
                    sx={{
                      width: '90%',
                      backgroundColor: 'rgba(43, 42, 42, 0.15)',
                      padding: '2vh',
                      transition: 'background-color 0.3s ease-in-out',
                      color: 'white',
                      backdropFilter: 'blur(8px)', 
                      marginBottom: 2, 
                      border: '1px solid rgba(255, 255, 255, 0.3)', 
                      '&:hover': {
                        backgroundColor: 'rgba(23, 22, 22, 0.45)', 
                      },
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      <strong>{option.option_text} {percentage.toFixed(0)}% (Total: {votes[option.option_text]})</strong>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        marginBottom: 2,
                        height: 10,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: optionColors[option.option_text as keyof typeof optionColors] || '#3f51b5',
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleVote(option.option_text, topic.id)}
                      fullWidth
                      disabled={hasVoted[topic.id] || !walletAddress}
                      sx={{
                        fontWeight:"bold",
                        backgroundColor: 'rgba(23, 22, 22, 0.25)',
                        color: (theme) =>
                          hasVoted[topic.id] || !walletAddress ? 'rgba(255, 255, 255, 0.6) !important' : 'white !important', 
                        '&:hover': {
                          backgroundColor: '#303f9f !important',
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
          width: '100%',
          backgroundColor: 'black',
          color: 'white',
          padding: '16px 0',
          position: 'relative',
          bottom: 0,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          Powered by STONKS Community
        </Typography>
      </Box>
    </Box>
  );
};

export default VotingPage;
