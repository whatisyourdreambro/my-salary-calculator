// src/components/NewPostForm.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPost } from "@/app/actions";
import { useEffect, useRef, useState } from "react";
// [수정] 공유 타입을 import 합니다.
import type { FormState } from "@/app/types";

// 폼 제출 버튼 컴포넌트
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-signature-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
    >
      {pending ? "등록 중..." : "글쓰기"}
    </button>
  );
}

// [수정] 초기 상태에 명확한 타입을 지정합니다.
const initialState: FormState = {
  error: null,
  success: false,
};

export default function NewPostForm() {
  const [state, formAction] = useFormState(createPost, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [postType, setPostType] = useState<"text" | "poll">("text");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // 서버 액션이 성공적으로 완료되면 폼을 리셋
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPollOptions(["", ""]);
    }
  }, [state.success]);

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 space-y-4"
    >
      <input type="hidden" name="postType" value={postType} />

      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setPostType("text")}
          className={`flex-1 p-2 text-sm font-semibold rounded-md ${
            postType === "text" ? "bg-signature-blue text-white" : ""
          }`}
        >
          질문글
        </button>
        <button
          type="button"
          onClick={() => setPostType("poll")}
          className={`flex-1 p-2 text-sm font-semibold rounded-md ${
            postType === "poll" ? "bg-signature-blue text-white" : ""
          }`}
        >
          투표글
        </button>
      </div>

      <textarea
        name="content"
        placeholder="궁금한 점, 나누고 싶은 이야기를 자유롭게 작성해보세요."
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 min-h-[120px]"
        required
      />

      {postType === "poll" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">투표 항목</p>
          <input
            type="text"
            name="pollOption1"
            value={pollOptions[0]}
            onChange={(e) => handlePollOptionChange(0, e.target.value)}
            placeholder="항목 1"
            className="w-full p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="pollOption2"
            value={pollOptions[1]}
            onChange={(e) => handlePollOptionChange(1, e.target.value)}
            placeholder="항목 2"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      )}

      <SubmitButton />

      {state.error && (
        <p className="text-red-500 text-sm text-center">{state.error}</p>
      )}
      {state.success && (
        <p className="text-green-500 text-sm text-center">
          게시글이 성공적으로 등록되었습니다!
        </p>
      )}
    </form>
  );
}
