import type { ReactElement } from 'react'

const HISTORY = [
  { year: '1992', desc: '한전KDN 창립 (한전 출자 법인, Korea Electric Power Data & Network)' },
  { year: '1995', desc: '전력 정보화 사업 본격 착수 · 배전자동화 시스템 구축 시작' },
  { year: '2001', desc: '배전 자동화 시스템 전국 확대 완료' },
  { year: '2009', desc: '스마트그리드 국가 실증 사업 참여 (제주 실증 단지)' },
  { year: '2014', desc: '나주 혁신도시 본사 이전 (전라남도 나주시 빛가람로 661)' },
  { year: '2018', desc: '해외 에너지ICT 수출 20개국 달성' },
  { year: '2022', desc: '탄소중립 에너지 전환 로드맵 발표 · ESG경영 선언' },
  { year: '2026', desc: 'Digital KDN 선언 — AI 기반 에너지ICT 글로벌 리더 도약' },
]

const LEADERS = [
  { name: '대표이사', title: '한전KDN 대표이사 사장', bg: '#E4002B' },
  { name: '부사장', title: '기술·사업 총괄', bg: '#C9002A' },
  { name: '전무', title: '경영지원 총괄', bg: '#F0851A' },
]

const About = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">Company Overview</div>
        <h1>회사소개</h1>
        <p>한전KDN의 비전과 역사, 그리고 에너지ICT 사업을 소개합니다.</p>
      </div>
    </section>

    {/* 회사 개요 */}
    <section className="section-ed">
      <div className="container">
        <div className="about-grid">
          <div>
            <div className="section-num">&mdash; About 한전KDN</div>
            <h2 className="section-title-ed">
              1992년 창립,<br />
              <span className="accent">에너지ICT 혁신</span>의 역사
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '24px' }}>
              한전KDN은 1992년 창립 이래 대한민국 전력 디지털화를 이끌어온
              에너지ICT 전문 공기업입니다. 발전·급전·송변전·배전·판매·전력통신·
              정보보호·에너지신사업 등 전력 전 분야에서 ICT 솔루션을 제공합니다.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              "디지털 혁신, 에너지 대전환을 선도하는 글로벌 에너지ICT의 중심"을
              비전으로, AI·빅데이터·클라우드 기반 차세대 에너지 서비스를 개척해 나갑니다.
            </p>
          </div>
          <div className="about-panel">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '16px' }}>
              COMPANY PROFILE
            </div>
            {[
              ['회사명', '한전KDN (주)'],
              ['영문명', 'Korea Electric Power Data & Network Co., Ltd.'],
              ['설립일', '1992년'],
              ['임직원', '3,500명+'],
              ['본사', '전라남도 나주시 빛가람로 661'],
              ['전화', '061-931-7114'],
              ['사업자', '116-81-32242'],
              ['해외사업', '30개국 진출'],
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
              { num: 'V', label: '비전', desc: '디지털 혁신, 에너지 대전환을 선도하는 글로벌 에너지ICT의 중심' },
              { num: 'M', label: '미션', desc: '전력 ICT 혁신으로 안정적 에너지 공급과 사회적 가치를 창출한다' },
              { num: 'C', label: '핵심가치', desc: '혁신 · 신뢰 · 안전 · 협력 · 도전' },
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
