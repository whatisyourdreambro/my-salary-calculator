// src/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
// [수정] 공유 타입을 import 합니다.
import type { Post, FormState, Poll } from "@/app/types";

// --- 부적절한 단어 필터링 목록 ---
const FORBIDDEN_WORDS = [
  "바보",
  "멍청이",
  "개자식",
  "시발",
  "존나", // 비속어
  "섹스",
  "야동",
  "음란", // 성적인 단어
  "살인",
  "자살",
  "폭력", // 폭력적인 단어
];

// 텍스트에 금지된 단어가 포함되어 있는지 확인하는 함수
function containsForbiddenWords(text: string): boolean {
  return FORBIDDEN_WORDS.some((word) => text.includes(word));
}

// --- Post 관련 코드 (투표 기능 추가) ---
const postDb: { posts: Post[] } = { posts: [] };
let postIdCounter = 1;

// [수정] prevState의 'any' 타입을 'FormState'로 변경하고, 반환 타입도 명시합니다.
export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const content = formData.get("content") as string;
  const postType = formData.get("postType") as "text" | "poll";

  // 유효성 검사
  if (!content || content.trim().length === 0) {
    return { error: "내용을 입력해주세요." };
  }
  if (content.length > 500) {
    return { error: "내용은 500자 이하로 작성해주세요." };
  }

  // 콘텐츠 필터링
  if (containsForbiddenWords(content)) {
    return { error: "부적절한 단어가 포함되어 있습니다." };
  }

  const authorId = Math.random().toString(36).substring(2, 8);
  const newPost: Post = {
    id: postIdCounter++,
    content,
    createdAt: new Date(),
    author: `익명${authorId}`,
    postType: postType,
  };

  if (postType === "poll") {
    const option1 = formData.get("pollOption1") as string;
    const option2 = formData.get("pollOption2") as string;

    if (
      !option1 ||
      !option2 ||
      option1.trim().length === 0 ||
      option2.trim().length === 0
    ) {
      return { error: "투표 항목을 모두 입력해주세요." };
    }
    if (containsForbiddenWords(option1) || containsForbiddenWords(option2)) {
      return { error: "투표 항목에 부적절한 단어가 포함되어 있습니다." };
    }

    newPost.pollOptions = [
      { text: option1, votes: 0 },
      { text: option2, votes: 0 },
    ];
  }

  postDb.posts.unshift(newPost);
  revalidatePath("/community");

  return { success: true, error: null };
}

// 투표 액션
export async function voteOnPoll(postId: number, optionIndex: number) {
  const post = postDb.posts.find((p) => p.id === postId);

  if (
    post &&
    post.postType === "poll" &&
    post.pollOptions &&
    (optionIndex === 0 || optionIndex === 1)
  ) {
    post.pollOptions[optionIndex].votes++;
    revalidatePath("/community");
    return { success: true, updatedPost: post };
  }
  return { error: "투표에 실패했습니다." };
}

// 모든 글을 가져오는 함수
export async function getPosts() {
  return postDb.posts;
}

// --- 밸런스 게임 관련 코드 ---
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
