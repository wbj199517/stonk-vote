import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        vote: "Vote",
        filter_topic: "Filter Topics:",
        now: "NOW",
        past: "PAST",
        upcoming: "UPCOMING",
        wallet_connect_warn: "Pleae connect your wallet to vote",
        vote_time_warn: "Voting is only available during the voting period",
        vote_success: "Vote Success, Thank you for your participation",
        vote_failed: "Vote Fail. Error message:",
        info_box: "Notification",
        footer: "Powered by STONKS Community",
        connect_wallet: "Connect Wallet",
        disconnect_wallet: "Disconnect Wallet",
        start_date: "Start Date: ",
        end_date: "End Date: ",
        total_vote: "Total: ",
        response_messages: {
          1006: "Internal server error",
          1007: "Please check your input",
          1008: "Signature verification failed",
          1009: "Invalid wallet address",
          "-1": "You have already voted for this topic",
        },
      },
    },
    zh: {
      translation: {
        vote: "投票",
        filter_topic: "筛选投票话题:",
        now: "进行中",
        past: "过去",
        upcoming: "将来",
        wallet_connect_warn: "请连接钱包进行投票",
        vote_time_warn: "只有在投票进行期间才能投票",
        vote_success: "投票成功，谢谢参与",
        vote_failed: "投票失败, 错误信息： ",
        info_box: "提示窗口",
        footer: "由 STONKS 社区提供支持",
        connect_wallet: "连接钱包",
        disconnect_wallet: "断开钱包",
        start_date: "开始日期: ",
        end_date: "结束日期: ",
        total_vote: "总票数: ",
        response_messages: {
          1006: "内部服务器错误",
          1007: "请检查您的输入",
          1008: "签名验证失败",
          1009: "钱包地址无效",
          "-1": "你已经为该话题投票过了",
        },
      },
    },
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
