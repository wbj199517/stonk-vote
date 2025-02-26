import request from './request';
import{
  fetchTopicsUrl,
  getTopicDetailUrl,
  submitVoteUrl,
  getVotingRecordsUrl,
  getWalletVotingRecordUrl,
} from './url'
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
    {
      id: 2,
      title: 'Another Vote',
      start_time: '2025-02-21T14:00:00Z',
      end_time: '2025-02-28T14:00:00Z',
      created_at: '2025-02-20T14:00:00Z',
      options: [
        { id: 1, option_text: 'Option A', vote_count: 6 },
        { id: 2, option_text: 'Option B', vote_count: 4 },
        { id: 3, option_text: 'Option C', vote_count: 3 },
      ],
    },
  ];

  public async fetchTopicsReq(): Promise<{ code: number; message: string; data: Topic[] }> {
    return request(fetchTopicsUrl,{method:'GET'})
  }

  public async fetchTopicDetailsReq(id: number): Promise<{ code: number; message: string; data: Topic | null }> {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // const topic = this.initialData.find((topic) => topic.id === id);
    return request(getTopicDetailUrl(id),{method:'GET'})

    // if (topic) {
    //   return {
    //     code: 0,
    //     message: 'Success',
    //     data: topic,
    //   };
    // } else {
    //   return {
    //     code: 1007, // Topic not found
    //     message: 'Topic not found',
    //     data: null,
    //   };
    // }
  }

  public async submitVoteReq(topicId: number, optionId: number, walletAddress: string, nonce: string): Promise<{ code: number; message: string; data: { voteAmount: string } }> {
    const messageContent = {
      topicId,
      optionId,
      walletAddress,
      nonce,
      timestamp: new Date().toISOString(),
    };


    // Simulate a successful vote submission
    //await new Promise((resolve) => setTimeout(resolve, 1000));
    return request(submitVoteUrl,{method:'POST',data:messageContent})
    return {
      code: 0,
      message: 'Success',
      data: {
        voteAmount: '1', // Mock vote amount
      },
    };
  }

  public async getVotingRecordsReq(topicId: number): Promise<{ code: number; message: string; data: Array<{ id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string }> }> {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // return request(getVotingRecordsUrl(topicId),{method:'GET'})
    return request(getWalletVotingRecordUrl(topicId),{method:'GET'})
    // const records = [
    //   {
    //     id: 1,
    //     topic_id: topicId,
    //     option_id: 1,
    //     wallet_address: 'FU87r4fX8roQ9ezm3Zc1LA2Ktx1UL2on3W4nhkb97tN5',
    //     vote_amount: '0',
    //     created_at: '2024-01-01T12:00:00Z',
    //     option_text: 'STONKS',
    //   },
    // ];
    //
    // return {
    //   code: 0,
    //   message: 'Success',
    //   data: records,
    // };
  }

  public async fetchWalletVoteRecord(topicId: number, walletAddress: string): Promise<{ code: number; message: string; data: { id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string }[] | null }> {
    return request(getVotingRecordsUrl(topicId),{method:'GET'});
   /* const record = {
      id: 2,
      topic_id: 2,
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
    };*/
  }
}

const mockBackend = new MockBackend();
export default mockBackend;
