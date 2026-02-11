// src/app/api/og/route.tsx

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get('amount') || '5000';
    const netPay = searchParams.get('net') || '3,500,000';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F4C81', // Trust Blue
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '60px 80px',
              borderRadius: '40px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ color: '#FFD700', fontSize: 32, fontWeight: 900, marginBottom: 20 }}>
              2026 연봉 리포트
            </div>
            <div style={{ color: 'white', fontSize: 60, fontWeight: 900, marginBottom: 10 }}>
              연봉 {amount}만원?
            </div>
            <div style={{ color: 'white', fontSize: 40, fontWeight: 400, opacity: 0.8, marginBottom: 40 }}>
              진짜 월 실수령액은...
            </div>
            <div
              style={{
                backgroundColor: '#FFD700',
                color: '#381f15',
                padding: '20px 60px',
                borderRadius: '100px',
                fontSize: 64,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              {netPay}
              <span style={{ fontSize: 32, marginLeft: 8 }}>원</span>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 40, color: 'white', opacity: 0.4, fontSize: 24, fontWeight: 700 }}>
            moneysalary.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}