import type { ReactElement } from 'react'

const HISTORY = [
  { year: '1985', desc: '한국전력기술(KDN) 창립' },
  { year: '1992', desc: '전력 IT 사업부 신설 · SCADA 시스템 국산화 성공' },
  { year: '2001', desc: '배전 자동화 시스템 전국 확대 완료' },
  { year: '2009', desc: '스마트그리드 파일럿 사업 착수 (제주 실증 단지)' },
  { year: '2015', desc: '해외 수출 첫 성과 — 사우디 변전소 EPC 수주' },
  { year: '2019', desc: 'AI 에너지 플랫폼 "Grid AI" 출시' },
  { year: '2022', desc: '탄소중립 에너지 전환 로드맵 2030 발표' },
  { year: '2026', desc: 'Digital KDN 선언 — AI·데이터 기반 스마트 에너지 기업 전환' },
]

const LEADERS = [
  { name: '박현준', title: '대표이사', bg: '#1B2A4A' },
  { name: '이정민', title: '부사장 (기술총괄)', bg: '#2A3A5C' },
  { name: '최수아', title: '전무 (사업개발)', bg: '#3D6FE0' },
]

const About = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">Company Overview</div>
        <h1>회사소개</h1>
        <p>에너지 기술의 새로운 표준을 만들어가는 KDN을 소개합니다.</p>
      </div>
    </section>

    {/* 회사 개요 */}
    <section className="section-ed">
      <div className="container">
        <div className="about-grid">
          <div>
            <div className="section-num">&mdash; About KDN</div>
            <h2 className="section-title-ed">
              40년의 신뢰,<br />
              <span className="accent">에너지 혁신</span>의 역사
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '24px' }}>
              KDN(한국전력기술)은 1985년 창립 이래 대한민국 전력 인프라의 설계·구축·운영을 담당해온
              에너지 기술 전문 기업입니다. 전력 IT, 스마트그리드, 신재생에너지, AI·데이터 플랫폼 등
              6개 핵심 사업 영역에서 혁신을 이어오고 있습니다.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              2026년 "Digital KDN" 선언을 통해 AI 기반 스마트 에너지 기업으로의 전환을 선언하고,
              탄소중립 에너지 전환 시대를 이끌어가고 있습니다.
            </p>
          </div>
          <div className="about-panel">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '16px' }}>
              COMPANY PROFILE
            </div>
            {[
              ['회사명', 'KDN 한국전력기술(주)'],
              ['설립일', '1985년 3월 15일'],
              ['대표이사', '박현준'],
              ['임직원', '2,800명+'],
              ['본사', '전라남도 나주시 빛가람로 760'],
              ['사업영역', '전력 인프라 · 스마트그리드 · AI 플랫폼'],
              ['연간 매출', '약 1조 2,000억 원 (2025)'],
              ['해외 사업', '15개국 진출'],
            ].map(([k, v]) => (
              <div className="about-panel-row" key={k}>
                <span className="about-panel-key">{k}</span>
                <span className="about-panel-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 비전 */}
        <div>
          <div className="section-num" style={{ marginBottom: '16px' }}>&mdash; Vision &amp; Mission</div>
          <h2 className="section-title-ed" style={{ marginBottom: '8px' }}>
            비전 <span className="accent">&amp;</span> 미션
          </h2>
          <div className="vision-grid">
            {[
              { num: 'V', label: '비전', desc: '스마트 에너지 기술로 지속 가능한 미래를 선도하는 대한민국 대표 에너지 기업' },
              { num: 'M', label: '미션', desc: '혁신적인 에너지 기술과 디지털 전환으로 사회적 가치를 창출하고 국민 생활에 기여한다' },
              { num: 'V', label: '핵심가치', desc: '기술 혁신 · 안전 최우선 · 고객 신뢰 · 지속 성장 · 사회 책임' },
            ].map((item, i) => (
              <div className="vision-card" key={i}>
                <div className="vision-num">{item.num}</div>
                <div className="vision-label">{item.label}</div>
                <p className="vision-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* 연혁 */}
    <section className="section-ed" style={{ background: 'var(--bg-light-gray)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="container">
        <div className="section-num">&mdash; History</div>
        <h2 className="section-title-ed" style={{ marginBottom: '40px' }}>
          주요 <span className="accent">연혁</span>
        </h2>
        <div style={{ maxWidth: '680px' }}>
          {HISTORY.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '24px',
                paddingBottom: '24px',
                marginBottom: '24px',
                borderBottom: i < HISTORY.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <div style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--gold)',
                width: '60px',
                flexShrink: 0,
                letterSpacing: '-0.01em',
              }}>{h.year}</div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{h.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 경영진 */}
    <section className="section-ed">
      <div className="container">
        <div className="section-num">&mdash; Leadership</div>
        <h2 className="section-title-ed" style={{ marginBottom: '40px' }}>
          <span className="accent">경영진</span> 소개
        </h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {LEADERS.map((l, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-medium-gray)',
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                width: '220px',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '72px', height: '72px',
                background: l.bg,
                borderRadius: '50%',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                color: '#fff',
              }}>{l.name[0]}</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '4px' }}>{l.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{l.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
)

export default About
