// src/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import type { Post, FormState, Poll } from "@/app/types";

// --- 부적절한 단어 필터링 목록 (대폭 강화) ---
const FORBIDDEN_WORDS = [
  // 욕설 및 비속어
  "개새끼",
  "개소리",
  "개자식",
  "씨발",
  "시발",
  "좆",
  "존나",
  "존나게",
  "미친",
  "미친놈",
  "미친년",
  "염병",
  "지랄",
  "새끼",
  "쌍놈",
  "쌍년",
  "아가리",
  "닥쳐",
  "꺼져",
  "병신",
  "등신",
  "또라이",
  "씹",
  "엠창",
  "애미",
  "애비",
  "패드립",
  "현피",
  "좆까",
  "좆되다",
  "좆밥",
  "일베",
  "페미",
  "한남",
  "한녀",
  "틀딱",
  "급식",

  // 성적인 단어
  "섹스",
  "야동",
  "음란",
  "성관계",
  "자위",
  "오르가즘",
  "페니스",
  "보지",
  "자지",
  "유두",
  "가슴",
  "엉덩이",
  "포르노",
  "AV",
  "망가",
  "헨타이",
  "성매매",
  "조건만남",
  "오피",
  "안마",
  "룸싸롱",
  "유흥업소",
  "노콘",
  "질싸",
  "정액",
  "쿠퍼액",
  "원나잇",
  "sm",
  "페티쉬",
  "변태",
  "치한",
  "성추행",
  "성폭행",
  "강간",

  // 폭력 및 혐오
  "살인",
  "자살",
  "폭력",
  "죽어",
  "죽여",
  "뒤져",
  "칼빵",
  "총살",
  "암살",
  "테러",
  "학살",
  "고문",
  "린치",
  "왕따",
  "괴롭힘",
  "일진",
  "빵셔틀",
  "조폭",
  "깡패",
  "장애인",
  "정신병",
  "게이",
  "레즈비언",
  "호모",
  "똥꼬",
  "에이즈",
  "매독",
  "짱깨",
  "쪽바리",
  "조선족",
  "흑인",
  "깜둥이",
  "백인",
  "양키",
  "김치녀",
  "된장녀",
  "맘충",
  "애새끼",

  // 기타 불쾌감을 줄 수 있는 단어
  "마약",
  "대마",
  "필로폰",
  "히로뽕",
  "도박",
  "토토",
  "사설",
  "불법",
  "사기",
  "주작",
  "조작",
  "뒷담화",
  "저격",
  "박제",
  "병맛",
  "오글",
  "극혐",
  "혐오",
  "일뽕",
  "국뽕",
];

// 텍스트에 금지된 단어가 포함되어 있는지 확인하는 함수
function containsForbiddenWords(text: string): boolean {
  return FORBIDDEN_WORDS.some((word) => text.includes(word));
}

// --- Post 관련 코드 (투표 기능 추가) ---
const postDb: { posts: Post[] } = { posts: [] };
let postIdCounter = 1;

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
    createdAt: new Date().toISOString(),
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
