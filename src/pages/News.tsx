import type { ReactElement } from 'react'

const NEWS_LIST = [
  { cat: '공지사항', date: '2026.05.20', title: 'KDN, 2026 스마트그리드 혁신 컨퍼런스 개최', body: '에너지 AI·디지털 전환을 주제로 국내외 전력 산업 전문가 500명이 참여하는 대규모 컨퍼런스를 나주 KDN 본사에서 개최합니다.' },
  { cat: '수주소식', date: '2026.05.12', title: '제주 해상풍력 연계 변전소 건설 프로젝트 수주', body: '제주 한림 해상풍력 단지 200MW 규모 변전소 및 해저케이블 연계 시스템 구축 프로젝트를 약 1,800억 원 규모로 수주했습니다.' },
  { cat: '기술혁신', date: '2026.04.28', title: 'AI 기반 배전 자동화 시스템 특허 취득', body: '머신러닝을 활용한 실시간 고장 구간 자동 분리·복구 기술로 정전 시간 90% 단축을 실현한 기술에 대해 국내외 특허를 취득했습니다.' },
  { cat: '채용공고', date: '2026.04.15', title: '2026년 상반기 신입·경력 공채 모집 안내', body: '전력 엔지니어링, AI·데이터 분석, 사이버 보안 등 다양한 직군에서 인재를 모집합니다. 서류 접수: 5.1 ~ 5.31.' },
  { cat: '수주소식', date: '2026.03.30', title: '베트남 다낭 220kV 변전소 건설 EPC 계약 체결', body: '베트남 국영 전력공사(EVN)와 220kV 변전소 2개소 신설 및 154kV 배전선로 증설 EPC 계약을 약 850억 원 규모로 체결했습니다.' },
  { cat: '기술혁신', date: '2026.03.10', title: 'Grid AI 3.0 — ESS 통합 에너지 관리 플랫폼 출시', body: '배터리 ESS와 연계한 신재생에너지 발전량 예측 및 최적 충·방전 스케줄링 기능을 탑재한 AI 에너지 관리 플랫폼 Grid AI 3.0을 출시했습니다.' },
]

const CAT_COLORS: Record<string, string> = {
  '공지사항': '#7C3AED',
  '수주소식': '#0891B2',
  '기술혁신': '#DC2626',
  '채용공고': '#059669',
}

const News = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">News &amp; Announcement</div>
        <h1>뉴스&amp;공지</h1>
        <p>KDN의 최신 소식과 공지사항을 확인하세요.</p>
      </div>
    </section>

    <section className="section-ed">
      <div className="container">
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {NEWS_LIST.map((n, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: '32px',
                padding: '28px 0',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div style={{
                  display: 'inline-block',
                  background: CAT_COLORS[n.cat] ?? 'var(--navy-700)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '2px',
                  marginBottom: '8px',
                  letterSpacing: '0.04em',
                }}>{n.cat}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{n.date}</div>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '8px', lineHeight: 1.5 }}>
                  {n.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {n.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
)

export default News
