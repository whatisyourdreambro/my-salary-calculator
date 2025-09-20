import Link from "next/link";

export default function NotFound() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-signature-blue dark:text-gray-100">
        404 - 페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
        요청하신 페이지가 존재하지 않거나, 주소가 변경되었습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block p-4 bg-signature-blue text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
