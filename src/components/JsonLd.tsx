// src/components/JsonLd.tsx
//
// JSON-LD 구조화 데이터 주입 wrapper.
// 모든 페이지에서 일관된 방식으로 schema.org 데이터를 head에 추가.

interface JsonLdProps {
 /** 구조화 데이터 객체 (단일 또는 배열) */
 data: object | object[];
}

export default function JsonLd({ data }: JsonLdProps) {
 const items = Array.isArray(data) ? data : [data];

 return (
 <>
 {items.map((item, index) => (
 <script
 key={index}
 type="application/ld+json"
 // XSS 하드닝: 데이터에 '</script>' 류 문자열이 섞여도 스크립트 이탈 불가하도록
 // <, U+2028, U+2029 이스케이프 (JSON 의미·렌더 결과 불변, 방어층)
 dangerouslySetInnerHTML={{
 __html: JSON.stringify(item)
 .replace(/</g, "\\u003c")
 .replace(/\u2028/g, "\\u2028")
 .replace(/\u2029/g, "\\u2029"),
 }}
 />
 ))}
 </>
 );
}
