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
 dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
 />
 ))}
 </>
 );
}
