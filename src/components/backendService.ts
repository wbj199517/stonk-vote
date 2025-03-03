import axios from "axios";

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
// const API_BASE_URL = "http://localhost:9000/api";
const API_BASE_URL = "http://8.211.146.92:9000/api";
// const API_BASE_URL = "/api";

class MockBackend {
  // private mockData: Topic[] = [
  //   {
  //     id: 1,
  //     title: "社区分红代币",
  //     start_time: "2025-02-21T14:00:00Z",
  //     end_time: "2025-02-28T14:00:00Z",
  //     created_at: "2025-02-20T14:00:00Z",
  //     options: [
  //       { id: 1, option_text: "USDT", vote_count: 5 },
  //       { id: 2, option_text: "SOL", vote_count: 4 },
  //       { id: 3, option_text: "STONKS", vote_count: 8 },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     title: "Another Vote",
  //     start_time: "2025-02-21T14:00:00Z",
  //     end_time: "2025-02-28T14:00:00Z",
  //     created_at: "2025-02-20T14:00:00Z",
  //     options: [
  //       { id: 1, option_text: "Option A", vote_count: 6 },
  //       { id: 2, option_text: "Option B", vote_count: 4 },
  //       { id: 3, option_text: "Option C", vote_count: 3 },
  //     ],
  //   },
  // ];

  public async fetchTopics(): Promise<{
    code: number;
    message: string;
    data: Topic[];
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/topics`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending vote:",
        error.response?.data || error.message
      );
      // please enable the below comment when use the real backend. This is for demo use.
      return { code: error.response?.data?.code ?? -1, message: "Failed to fetch topic", data: [] };
      // return {
      //   code: 0,
      //   message: "Success",
      //   data: this.mockData,
      // };
    }
  }

  public async fetchTopicDetails(id: number): Promise<{
    code: number;
    message: string;
    data: {
      topic: Topic;
      options: { id: number; option_text: string; vote_count: string }[];
    } | null;
  }> {
    try {
      const response = await axios.get<{
        code: number;
        message: string;
        data: {
          topic: Topic;
          options: { id: number; option_text: string; vote_count: string }[];
        };
      }>(`${API_BASE_URL}/topics/${id}`);
      return response.data;
    } catch (error: any) {
      // const topic: any = this.mockData.find((topic) => topic.id === id);
      // return {
      //   code: 0,
      //   message: "Success",
      //   data: topic,
      // };
      // please enable the below comment when use the real backend. This is for demo use.
      return { code: error.response?.data?.code ?? -1, message: "Failed to fetch topic", data: null };
    }
  }

  public async sendVoteData(
    topicId: number,
    optionId: number,
    walletAddress: string,
    signature: string,
    messageContent: string
  ): Promise<{
    code: number;
    message: string;
    data: { voteAmount: string } | null;
  }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/vote`, {
        topicId,
        optionId,
        walletAddress,
        signature,
        message: messageContent,
      });

      console.log("Vote submission response:", response.data);

      if (response.data.code === 0) {
        return response.data;
      } else {
        throw new Error(response.data.message); // Use backend error message
      }
    } catch (err: any) {
      return {
        code: err.response?.data?.code ?? -1,
        message: err.response.data.message || "提交投票失败",
        data: null,
      };
    }
  }
}

const mockBackend = new MockBackend();
export default mockBackend;
