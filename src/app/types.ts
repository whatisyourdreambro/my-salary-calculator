// src/app/types.ts

// 커뮤니티 게시글 데이터 구조
export interface PollOption {
  text: string;
  votes: number;
}

export interface Post {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
  postType: "text" | "poll";
  pollOptions?: [PollOption, PollOption];
}

// 밸런스 게임 데이터 구조
export interface Poll {
  id: number;
  topic: string;
  optionA_text: string;
  optionA_votes: number;
  optionB_text: string;
  optionB_votes: number;
}

// 서버와 클라이언트가 공유할 폼 상태 타입
export type FormState = {
  error?: string | null;
  success?: boolean;
};
