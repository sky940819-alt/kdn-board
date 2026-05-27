import { Link } from 'react-router-dom'
import type { ReactElement } from 'react'

const BIZ_AREAS = [
  {
    icon: '🔆',
    tag: 'Generation · Dispatch ICT',
    title: '발전·급전ICT',
    desc: '발전소 운영 최적화 및 실시간 급전 자동화 시스템으로 전력 수급 균형을 유지하고 전국 전력 계통의 안정 운영을 지원합니다.',
  },
  {
    icon: '⚡',
    tag: 'Transmission · Substation ICT',
    title: '송변전ICT',
    desc: '초고압 송전망 및 변전소 디지털화를 통해 전국 전력망의 안정적 운영과 효율적 유지·보수를 실현합니다.',
  },
  {
    icon: '🔌',
    tag: 'Distribution ICT',
    title: '배전ICT',
    desc: '배전 자동화·지능화 시스템으로 정전 구간을 자동 분리·복구하여 전력 품질과 공급 신뢰도를 향상합니다.',
  },
  {
    icon: '📊',
    tag: 'Sales ICT',
    title: '판매ICT',
    desc: 'AMI(스마트미터) 기반 전력 판매 정보화로 실시간 전력 사용량 관리 및 에너지 효율화 서비스를 제공합니다.',
  },
  {
    icon: '🛡️',
    tag: 'Power Telecom / Info-Security ICT',
    title: '전력통신/정보보호ICT',
    desc: '전력 전용 통신망 구축·운영 및 OT/IT 통합 사이버 보안 체계로 국가 핵심 에너지 인프라를 보호합니다.',
  },
  {
    icon: '🌱',
    tag: 'New Energy Business',
    title: '에너지신사업',
    desc: '신재생에너지, ESS, 마이크로그리드 등 에너지 전환 시대를 선도하는 신사업 ICT 솔루션을 개척합니다.',
  },
]

const NEWS = [
  {
    cat: '공지사항',
    date: '2026.05.20',
    title: '한전KDN, 2026 에너지ICT 혁신 포럼 개최',
    excerpt: '디지털 에너지 전환 및 전력망 AI 혁신을 주제로 국내외 에너지ICT 전문가가 참여하는 포럼을 나주 본사에서 개최합니다.',
  },
  {
    cat: '수주소식',
    date: '2026.05.12',
    title: '차세대 배전자동화 시스템 구축사업 수주',
    excerpt: '전국 배전 지능화를 위한 차세대 DAS 구축 프로젝트를 수주, 전력 공급 안정성 향상과 정전 시간 단축에 기여합니다.',
  },
  {
    cat: '기술혁신',
    date: '2026.04.28',
    title: 'AI 기반 전력설비 예방정비 플랫폼 특허 취득',
    excerpt: '머신러닝을 활용한 전력설비 이상 예측 기술로 예방정비 효율을 대폭 향상시킨 솔루션 특허를 국내외에서 취득했습니다.',
  },
]

const Home = (): ReactElement => {
  const marqueeText = '발전·급전ICT · 송변전ICT · 배전ICT · 판매ICT · 전력통신ICT · 정보보호ICT · 에너지신사업 · 디지털 혁신'

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">한전KDN · Korea Electric Power Data &amp; Network · 에너지ICT 혁신</div>
              <h1 className="hero-title">
                디지털 혁신으로<br />
                <span className="accent">에너지 대전환을</span><br />
                선도합니다
              </h1>
              <p className="hero-lead">
                한전KDN은 발전·급전·송변전·배전·판매·전력통신·정보보호·에너지신사업 등
                전력 전 분야 ICT 솔루션으로 대한민국 에너지 디지털 전환을 이끄는
                글로벌 에너지ICT 전문 공기업입니다.
              </p>
              <div className="hero-actions">
                <Link to="/business" className="btn btn-primary">
                  솔루션·서비스 보기
                  <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
                <Link to="/contact" className="btn btn-outline">
                  국민소통
                </Link>
              </div>
            </div>

            <div className="hero-side">
              <div className="metric-stack">
                <div className="metric">
                  <div className="metric-num"><span className="accent">33</span><span className="small">년</span></div>
                  <div className="metric-label">업력 (1992~)</div>
                </div>
                <div className="metric">
                  <div className="metric-num">3,500<span className="small">+</span></div>
                  <div className="metric-label">임직원</div>
                </div>
                <div className="metric">
                  <div className="metric-num"><span className="accent">30</span></div>
                  <div className="metric-label">해외 사업국</div>
                </div>
                <div className="metric">
                  <div className="metric-num">1.2<span className="small">조</span></div>
                  <div className="metric-label">연간 매출</div>
                </div>
              </div>
              <div className="hero-badge">
                <div className="hero-badge-title">2026 핵심 전략</div>
                <ul className="hero-badge-list">
                  <li>전력망 AI 디지털 전환 가속화</li>
                  <li>에너지 신사업 포트폴리오 확장</li>
                  <li>글로벌 에너지ICT 수출 확대</li>
                  <li>탄소중립 에너지 전환 선도</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee">
        <div className="marquee-track">
          <span>
            {[0, 1].map((i) => (
              <span key={i}>
                {marqueeText.split(' · ').map((w, j) => (
                  <span key={`${i}-${j}`}>{w}<span className="dot">★</span></span>
                ))}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ── Business Areas ── */}
      <section className="section-ed" id="business">
        <div className="container">
          <div className="section-head">
            <div className="section-num">&mdash; 01 / Solutions &amp; Services</div>
            <h2 className="section-title-ed">6대 <span className="accent">에너지ICT 사업영역</span></h2>
            <div className="section-meta">전력·에너지·ICT 전 분야에서 혁신을 선도합니다</div>
          </div>
          <div className="biz-grid">
            {BIZ_AREAS.map((b, i) => (
              <div className="biz-card" key={i}>
                <div className="biz-icon">{b.icon}</div>
                <div className="biz-tag">{b.tag}</div>
                <h3 className="biz-title">{b.title}</h3>
                <p className="biz-desc">{b.desc}</p>
                <Link to="/business" className="biz-more">
                  자세히 보기
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-row">
            {[
              { num: '1992', unit: '년', label: '창립' },
              { num: '3,500', unit: '+', label: '임직원' },
              { num: '6', unit: '개', label: '핵심 사업영역' },
              { num: '30', unit: '개국', label: '해외 진출' },
            ].map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-num">
                  <span className="accent">{s.num}</span><span className="small">{s.unit}</span>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── News ── */}
      <section className="section-ed" id="news">
        <div className="container">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-num">&mdash; 02 / News</div>
              <h2 className="section-title-ed">최신 <span className="accent">뉴스&amp;공지</span></h2>
            </div>
            <Link to="/news" className="btn btn-outline" style={{ alignSelf: 'flex-end' }}>
              전체보기
              <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
          <div className="news-grid">
            {NEWS.map((n, i) => (
              <Link to="/news" className="news-card" key={i}>
                <div className="news-thumb">
                  <div className="news-thumb-label">KDN</div>
                  <span className="news-cat">{n.cat}</span>
                </div>
                <div className="news-body">
                  <div className="news-date">{n.date}</div>
                  <h3 className="news-title">{n.title}</h3>
                  <p className="news-excerpt">{n.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div>
              <div className="cta-eyebrow">&mdash; Contact Us</div>
              <h2 className="cta-title">
                에너지ICT 혁신,<br />
                <span className="accent">한전KDN과 함께</span> 시작하세요.
              </h2>
            </div>
            <div>
              <p className="cta-lead">
                발전·송변전·배전·판매·전력통신·에너지신사업 등
                다양한 에너지ICT 솔루션에 대해 전문가와 상담해보세요.
              </p>
              <div className="cta-actions">
                <Link to="/contact" className="btn btn-white">
                  국민소통 바로가기
                  <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
                <Link to="/about" className="btn btn-outline" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.35)' }}>
                  회사소개
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
