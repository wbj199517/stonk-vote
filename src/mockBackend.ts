import axios from 'axios';

export interface Option {
  id: number;
  option_text: string;
  vote_count: number;
}

export interface Topic {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  options: Option[];
}

class MockBackend {
  private initialData: Topic[] = [
    {
      id: 1,
      title: '社区分红代币',
      start_time: '2025-02-21T14:00:00Z',
      end_time: '2025-02-28T14:00:00Z',
      created_at: '2025-02-20T14:00:00Z',
      options: [
        { id: 1, option_text: 'USDT', vote_count: 5 },
        { id: 2, option_text: 'SOL', vote_count: 4 },
        { id: 3, option_text: 'STONKS', vote_count: 8 },
      ],
    },
  ];

  public async fetchTopics(): Promise<{ code: number; message: string; data: Topic[] }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      code: 0,
      message: 'Success',
      data: this.initialData,
    };
  }

  public async fetchTopicDetails(id: number): Promise<{ code: number; message: string; data: Topic | null }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const topic = this.initialData.find((topic) => topic.id === id);
    
    if (topic) {
      return {
        code: 0,
        message: 'Success',
        data: topic,
      };
    } else {
      return {
        code: 1007, // Topic not found
        message: 'Topic not found',
        data: null,
      };
    }
  }

  public async sendVoteData(topicId: number, optionId: number, walletAddress: string, nonce: string): Promise<{ code: number; message: string; data: { voteAmount: string } }> {
    const messageContent = {
      topicId,
      optionId,
      walletAddress,
      nonce,
      timestamp: new Date().toISOString(),
    };

    console.log('Sending vote data:', JSON.stringify(messageContent, null, 2)); // Pretty print JSON

    // Simulate a successful vote submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      code: 0,
      message: 'Success',
      data: {
        voteAmount: '1', // Mock vote amount
      },
    };
  }

  public async fetchVoteRecords(topicId: number): Promise<{ code: number; message: string; data: Array<{ id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string }> }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const records = [
      {
        id: 1,
        topic_id: topicId,
        option_id: 1,
        wallet_address: 'FU87r4fX8roQ9ezm3Zc1LA2Ktx1UL2on3W4nhkb97tN5',
        vote_amount: '1',
        created_at: '2024-01-01T12:00:00Z',
        option_text: 'STONKS',
      },
    ];

    return {
      code: 0,
      message: 'Success',
      data: records,
    };
  }

  public async fetchWalletVoteRecord(topicId: number, walletAddress: string): Promise<{ code: number; message: string; data: { id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string } | null }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const record = {
      id: 1,
      topic_id: topicId,
      option_id: 1,
      wallet_address: walletAddress,
      vote_amount: '1',
      created_at: '2024-01-01T12:00:00Z',
      option_text: 'STONKS',
    };

    return {
      code: 0,
      message: 'Success',
      data: record,
    };
  }
}

const mockBackend = new MockBackend();
export default mockBackend;
