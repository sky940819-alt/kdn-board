import type { ReactElement } from 'react'

const NEWS_LIST = [
  { cat: '공지사항', date: '2026.05.20', title: '한전KDN, 2026 에너지ICT 혁신 포럼 개최', body: '디지털 에너지 전환을 주제로 나주 한전KDN 본사에서 국내외 에너지ICT 전문가 300명이 참여하는 포럼을 개최합니다.' },
  { cat: '수주소식', date: '2026.05.12', title: '차세대 배전자동화 시스템 구축사업 수주', body: '전국 배전 지능화를 위한 차세대 배전자동화 시스템 구축 사업을 수주하여 전력 공급 안정성 향상에 기여합니다.' },
  { cat: '기술혁신', date: '2026.04.28', title: 'AI 기반 전력설비 예방정비 플랫폼 특허 취득', body: '머신러닝을 활용한 전력설비 이상 징후 예측 기술 특허를 국내외에서 취득, 예방정비 효율을 대폭 향상시켰습니다.' },
  { cat: '채용공고', date: '2026.04.15', title: '2026년 상반기 신입·경력 채용 공고', body: '에너지ICT 엔지니어링, AI·데이터 분석, 사이버 보안 등 다양한 직군에서 인재를 모집합니다. 접수: 5.1~5.31.' },
  { cat: '수주소식', date: '2026.03.30', title: '해외 전력계통 정보화 사업 신규 수주', body: '동남아시아 국가 전력공사와 송변전 ICT 인프라 구축 사업 계약을 체결했습니다.' },
  { cat: '보도자료', date: '2026.03.10', title: '한전KDN, ESG경영 우수기업 선정', body: '환경·사회·지배구조 전 분야에서 우수한 성과를 인정받아 에너지 공기업 ESG경영 우수기업으로 선정되었습니다.' },
]

const CAT_COLORS: Record<string, string> = {
  '공지사항': '#E4002B',
  '수주소식': '#0891B2',
  '기술혁신': '#F0851A',
  '채용공고': '#059669',
  '보도자료': '#54585A',
}

const News = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">News &amp; Announcement</div>
        <h1>뉴스&amp;공지</h1>
        <p>한전KDN의 최신 소식과 공지사항을 확인하세요.</p>
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
                  background: CAT_COLORS[n.cat] ?? 'var(--kdn-gray-500)',
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
