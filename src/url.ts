export const fetchTopicsUrl ='/api/topics';
export const getTopicDetailUrl = (id:number)=>`/api/topics/${id}`;
export const submitVoteUrl ='/api/vote';
export const getVotingRecordsUrl =(id:number)=>`/api/topics/${id}/records`;
export const getWalletVotingRecordUrl =(id:number)=>`/api/topics/${id}`;

