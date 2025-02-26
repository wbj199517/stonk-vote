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
  vote_count: string;
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

  public async fetchTopics(): Promise<{ code: number; message: string; data: Topic[] }> {
    return request(fetchTopicsUrl,{method:'GET'})
  }

  public async fetchTopicDetails(id: number): Promise<{ code: number; message: string; data: Topic | null }> {
    return request(getTopicDetailUrl(id),{method:'GET'})
  }

  public async sendVoteData(data: {    topicId: number,
                              optionId: number,
                              walletAddress: string,
                              signature: string,
    message: string}): Promise<{ code: number; message: string; data: { voteAmount: string } }> {

    // Simulate a successful vote submission
    return request(submitVoteUrl,{method:'POST',data})
  }

  public async getVotingRecordsReq(topicId: number): Promise<{ code: number; message: string; data: Array<{ id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string }> }> {
    return request(getWalletVotingRecordUrl(topicId),{method:'GET'})

  }

  public async fetchWalletVoteRecord(topicId: number, walletAddress: string): Promise<{ code: number; message: string; data: { id: number; topic_id: number; option_id: number; wallet_address: string; vote_amount: string; created_at: string; option_text: string }[] | null }> {
    return request(getVotingRecordsUrl(topicId),{method:'GET'});
  }
}

const backendService = new MockBackend();
export default backendService;
