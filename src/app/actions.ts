// src/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

// --- 기존 Post 관련 코드 (수정됨) ---
interface Post {
  id: number;
  content: string;
  createdAt: Date;
  author: string;
}
// 예시를 위한 가상 DB입니다. 실제 운영 시 Vercel Postgres 등으로 교체해야 합니다.
const postDb: { posts: Post[] } = { posts: [] };
let postIdCounter = 1; // 오류 수정을 위해 변수명 변경 및 사용

// 새로운 글을 생성하는 서버 액션 (오류 수정 완료)
export async function createPost(formData: FormData) {
  const content = formData.get("content") as string;

  if (!content || content.trim().length === 0) {
    return { error: "내용을 입력해주세요." };
  }

  // 익명 저자 생성 (예: '익명ab12')
  const authorId = Math.random().toString(36).substring(2, 8);

  // [수정] 누락되었던 newPost 객체 생성 로직 추가
  const newPost: Post = {
    id: postIdCounter++, // postIdCounter를 사용하여 ID를 부여하고 1 증가시킵니다.
    content,
    createdAt: new Date(),
    author: `익명${authorId}`,
  };

  // 실제 DB에 저장하는 로직
  postDb.posts.unshift(newPost);

  // 커뮤니티 페이지의 캐시를 갱신하여 새 글이 즉시 보이게 함
  revalidatePath("/community");

  return { success: true };
}

// 모든 글을 가져오는 함수
export async function getPosts() {
  // 실제 DB에서 글을 가져오는 로직
  return postDb.posts;
}

// --- [신규] 밸런스 게임 관련 코드 (변경 없음) ---
interface Poll {
  id: number;
  topic: string;
  optionA_text: string;
  optionA_votes: number;
  optionB_text: string;
  optionB_votes: number;
}

const pollDb: { polls: Poll[] } = {
  polls: [
    {
      id: 1,
      topic: "당신의 선택은?",
      optionA_text: "연봉 1억, 주 5일",
      optionA_votes: 1304,
      optionB_text: "연봉 8천, 주 4일",
      optionB_votes: 2891,
    },
    {
      id: 2,
      topic: "둘 중 하나만 가능하다면?",
      optionA_text: "평생 정년보장",
      optionA_votes: 3102,
      optionB_text: "성과 기반의 높은 연봉",
      optionB_votes: 1988,
    },
  ],
};

export async function getPoll(id: number) {
  return pollDb.polls.find((p) => p.id === id);
}

export async function voteForPoll(pollId: number, option: "A" | "B") {
  const poll = pollDb.polls.find((p) => p.id === pollId);
  if (!poll) {
    return { error: "Poll not found." };
  }

  if (option === "A") {
    poll.optionA_votes++;
  } else {
    poll.optionB_votes++;
  }

  revalidatePath(`/standoff/${pollId}`);
  return { success: true, updatedPoll: poll };
}
