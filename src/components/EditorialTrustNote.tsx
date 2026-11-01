// src/components/EditorialTrustNote.tsx
//
// 핵심 페이지의 '만든 사람과 확인 방법' 상자 (G4, 운영자 승인 2026-11-01 구글 개선 5번). 경로별 내용은 src/lib/editorialTrust.ts.
// ★ 배치 규칙: 페이지의 마지막 광고(쿠팡·제휴 배너 포함)와 공유 블록보다 아래, 그 컨테이너의 마지막 형제로만 둔다.
//   광고 위·결과와 결과 광고 사이에는 두지 않는다(2026-08-16 '광고 위 UI 삽입 금지'). 마지막 형제라 기존 형제 요소의
//   자동광고 CSS 경로도 바뀌지 않는다(CalcNewsNote·SalaryTableNextStepsFromPath 와 같은 선례).
//   layout 이 children 뒤에 광고를 그리는 경로(계산기·실수령액 표·회사 페이지)는 page 가 아니라 그 layout 맨 끝의
//   EditorialTrustNoteFromPath 로 그린다.
// - 훅이 없어 서버 page 와 클라이언트 래퍼 양쪽에서 쓴다. 경로에 내용이 없으면 null(DOM 무변경).
// - 링크는 이미 있는 주소만: /about 의 '정보를 확인하고 수정하는 기준'(#editorial-method)과 푸터에도 있는 /contact.
//   새 쿼리 주소(?type= 등)를 만들지 않는다 — 크롤 낭비 줄이기(G1)와 같은 방향.
import Link from "@/components/AppLink";
import {
  EDITORIAL_TRUST_AUTHOR,
  editorialTrustNoteFor,
  formatEditorialTrustDate,
} from "@/lib/editorialTrust";

const ROW = "sm:flex sm:gap-4";
const TERM = "shrink-0 font-semibold text-foreground sm:w-32";
const LINK = "inline-flex min-h-11 items-center font-medium text-link underline underline-offset-4";

export default function EditorialTrustNote({
  path,
  className = "",
}: {
  /** 끝 슬래시 없는 경로(있어도 무시). 대상이 아니면 아무것도 그리지 않는다 */
  path: string | null | undefined;
  /** 바깥 section 의 폭·여백 — 놓이는 컨테이너에 맞춘다 */
  className?: string;
}) {
  const note = editorialTrustNoteFor(path);
  if (!note) return null;
  const method = `${note.official ? "공식 자료" : "공개 자료"}와 대조: ${note.sources}`;
  const checkedLabel = note.checkedOn ? formatEditorialTrustDate(note.checkedOn) : null;

  return (
    <section
      data-msy-module="editorial-trust-note"
      aria-labelledby="editorial-trust-note-title"
      className={className}
    >
      <div className="ms-surface p-5 sm:p-6">
        <h2 id="editorial-trust-note-title" className="text-base font-bold text-foreground">
          만든 사람과 확인 방법
        </h2>
        <dl className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          <div className={ROW}>
            <dt className={TERM}>작성</dt>
            <dd>{EDITORIAL_TRUST_AUTHOR}</dd>
          </div>
          <div className={ROW}>
            <dt className={TERM}>확인 방법</dt>
            <dd>
              {method}
              {note.note && <span className="mt-1 block">{note.note}</span>}
            </dd>
          </div>
          {note.checkedOn && checkedLabel && (
            <div className={ROW}>
              <dt className={TERM}>{note.official ? "공식 자료 대조일" : "자료 대조일"}</dt>
              <dd>
                <time dateTime={note.checkedOn}>{checkedLabel}</time>
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-2 flex flex-wrap gap-x-5 text-sm">
          <Link href="/about#editorial-method" className={LINK}>
            운영 원칙과 수정 기준
          </Link>
          <Link href="/contact" className={LINK}>
            오류 제보
          </Link>
        </p>
      </div>
    </section>
  );
}
