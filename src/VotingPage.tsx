import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, LinearProgress, Card, Divider, CircularProgress } from '@mui/material';
import mockBackend, { Topic } from './mockBackend';

const optionColors = {
  'USDT': '#4CAF50', // Green
  'SOL': '#FF9800',  // Orange
  'STONKS': '#2196F3', // Blue
};

const VotingPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]); // Store multiple topics
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasVotedForWallet, setHasVotedForWallet] = useState(false); // Track if wallet has voted
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      setLoading(true);
      const response = await mockBackend.fetchTopics(); // Fetch the list of topics
      if (response.code === 0 && response.data.length > 0) {
        const fetchedTopics = response.data;
        setTopics(fetchedTopics); // Store all fetched topics
        for (const fetchedTopic of fetchedTopics) {
          const topicDetailsResponse = await mockBackend.fetchTopicDetails(fetchedTopic.id); // Fetch topic details using the ID
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

  const checkIfWalletHasVoted = async () => {
    if (walletAddress) {
      const voteRecordResponse = await mockBackend.fetchWalletVoteRecord(topics[0].id, walletAddress);
      if (voteRecordResponse.code === 0 && voteRecordResponse.data) {
        setHasVotedForWallet(true);
      }
    }
  };

  useEffect(() => {
    checkIfWalletHasVoted(); // Check if wallet has voted whenever walletAddress changes
  }, [walletAddress, topics]);

  const handleVote = async (optionKey: string) => {
    if (!walletAddress) {
      alert('Please connect your wallet to vote.');
      return;
    }

    if (hasVotedForWallet) {
      alert('You have already voted with this wallet address!');
      return;
    }

    const selectedOption = topics.flatMap(topic => topic.options).find(option => option.option_text === optionKey);
    if (!selectedOption) return; // Ensure selected option exists

    setVotes((prevVotes) => ({
      ...prevVotes,
      [optionKey]: prevVotes[optionKey] + 1,
    }));
    setTotalVotes((prevTotal) => prevTotal + 1);
    setHasVotedForWallet(true); // Update the state to indicate the wallet has voted

    const nonce = Math.random().toString(36).substring(2, 15); // Generate a random nonce
    const response = await mockBackend.sendVoteData(topics[0].id, selectedOption.id, walletAddress, nonce); // Use topics[0].id directly
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
      alert('Phantom Wallet not found. Please install it.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setHasVotedForWallet(false); // Reset the wallet voted state
    alert('Wallet disconnected. You can connect again.');
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Loading topic data...
        </Typography>
      </Box>
    );
  }

  if (topics.length === 0) return null;

  return (
    <Box sx={{ textAlign: 'center', padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {topics.map(topic => (
        <div key={topic.id}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            {topic.title}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#555', fontSize: '16px', marginBottom: 2 }}>
            开始：<span style={{ fontWeight: 'bold' }}>{new Date(topic.start_time).toLocaleString()}</span> | 
            结束：<span style={{ fontWeight: 'bold' }}>{new Date(topic.end_time).toLocaleString()}</span>
          </Typography>
        </div>
      ))}
      {walletAddress ? (
        <>
          <Typography variant="body1" gutterBottom>
            Connected: {walletAddress}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={disconnectWallet}
            sx={{ margin: 2 }}
          >
            Disconnect Wallet
          </Button>
        </>
      ) : (
        <Button 
          variant="contained" 
          sx={{ margin: 2 }} 
          onClick={connectWallet}
        >
          连接钱包
        </Button>
      )}
      <Divider sx={{ marginY: 4 }} />
      <Box sx={{ maxWidth: '600px', margin: 'auto', paddingTop: 4 }}>
        {topics.flatMap(topic => topic.options).map((option) => {
          const percentage = totalVotes ? (votes[option.option_text] / totalVotes) * 100 : 0;
          return (
            <Card 
              variant="outlined" 
              key={option.option_text} 
              sx={{ 
                marginBottom: 2, 
                padding: 2, 
                border: '2px solid #3f51b5',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                {option.option_text} {percentage.toFixed(0)}% (Total: {votes[option.option_text]})
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
                onClick={() => handleVote(option.option_text)} 
                fullWidth 
                disabled={hasVotedForWallet || !walletAddress} 
                sx={{
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                }}
              >
                Vote
              </Button>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default VotingPage;
