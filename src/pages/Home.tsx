import { Link } from 'react-router-dom'
import type { ReactElement } from 'react'

const BIZ_AREAS = [
  {
    icon: '⚡',
    tag: 'Power Infrastructure',
    title: '전력 인프라',
    desc: '345kV 초고압 변전소부터 배전 자동화 시스템까지, 대한민국 전력망의 핵심 인프라를 설계하고 운영합니다.',
  },
  {
    icon: '🔋',
    tag: 'Smart Grid',
    title: '스마트그리드',
    desc: 'AI·IoT 기반 지능형 전력망 구축으로 실시간 전력 수요 예측과 최적화를 실현합니다.',
  },
  {
    icon: '🏗️',
    tag: 'Digital Substation',
    title: '디지털 변전',
    desc: 'IEC 61850 기반 디지털 변전소 구축으로 설비 운영 효율과 안전성을 극대화합니다.',
  },
  {
    icon: '🌿',
    tag: 'Renewable Energy',
    title: '신재생에너지',
    desc: '태양광·풍력·ESS 연계 시스템으로 탄소중립 에너지 전환을 선도합니다.',
  },
  {
    icon: '🤖',
    tag: 'AI · Data',
    title: 'AI·데이터 분석',
    desc: '전력 빅데이터와 AI 기술로 설비 이상 예측, 에너지 효율 최적화를 구현합니다.',
  },
  {
    icon: '🔐',
    tag: 'Cyber Security',
    title: '사이버 보안',
    desc: '전력 SCADA·OT 시스템 보안 솔루션으로 국가 에너지 인프라를 안전하게 보호합니다.',
  },
]

const NEWS = [
  {
    cat: '공지사항',
    date: '2026.05.20',
    title: 'KDN, 2026 스마트그리드 혁신 컨퍼런스 개최',
    excerpt: '에너지 AI·디지털 전환을 주제로 국내외 전력 산업 전문가 500명이 참여하는 대규모 컨퍼런스를 개최합니다.',
  },
  {
    cat: '수주소식',
    date: '2026.05.12',
    title: '제주 해상풍력 연계 변전소 건설 프로젝트 수주',
    excerpt: '제주 한림 해상풍력 단지 200MW 규모 변전소 및 해저케이블 연계 시스템 구축 프로젝트를 수주했습니다.',
  },
  {
    cat: '기술혁신',
    date: '2026.04.28',
    title: 'AI 기반 배전 자동화 시스템 특허 취득',
    excerpt: '머신러닝을 활용한 실시간 고장 구간 자동 분리·복구 기술로 정전 시간 90% 단축을 실현했습니다.',
  },
]

const Home = (): ReactElement => {
  const marqueeText = 'Smart Grid · Digital Substation · Renewable Energy · AI Platform · Power Infrastructure · Cyber Security · ESS · IoT'

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">KDN · Korea District Network · 에너지 혁신</div>
              <h1 className="hero-title">
                스마트 에너지로<br />
                <span className="accent">대한민국을 밝히는</span><br />
                기술 파트너
              </h1>
              <p className="hero-lead">
                KDN은 전력 인프라 설계·구축부터 AI 기반 스마트그리드, 신재생에너지 연계까지
                대한민국 에너지 전환을 이끄는 종합 에너지 기술 기업입니다.
              </p>
              <div className="hero-actions">
                <Link to="/business" className="btn btn-white">
                  사업영역 보기
                  <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
                <Link to="/contact" className="btn btn-outline" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.35)' }}>
                  문의하기
                </Link>
              </div>
            </div>

            <div className="hero-side">
              <div className="metric-stack">
                <div className="metric">
                  <div className="metric-num"><span className="accent">40</span><span className="small">년</span></div>
                  <div className="metric-label">업력</div>
                </div>
                <div className="metric">
                  <div className="metric-num">2,800<span className="small">+</span></div>
                  <div className="metric-label">임직원</div>
                </div>
                <div className="metric">
                  <div className="metric-num"><span className="accent">15</span></div>
                  <div className="metric-label">해외 사업국</div>
                </div>
                <div className="metric">
                  <div className="metric-num">1<span className="small">조</span></div>
                  <div className="metric-label">연간 매출</div>
                </div>
              </div>
              <div className="hero-badge">
                <div className="hero-badge-title">2026 핵심 전략</div>
                <ul className="hero-badge-list">
                  <li>AI 기반 전력망 디지털 전환 (Grid AI 2030)</li>
                  <li>해상풍력 연계 변전 인프라 구축</li>
                  <li>탄소중립 에너지 시스템 전환 선도</li>
                  <li>글로벌 스마트그리드 수출 확대</li>
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
            <div className="section-num">&mdash; 01 / Business</div>
            <h2 className="section-title-ed">6대 <span className="accent">사업영역</span></h2>
            <div className="section-meta">전력·에너지·AI · 미래 기술 선도</div>
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
              { num: '40', unit: '년', label: '업력' },
              { num: '2,800', unit: '+', label: '임직원' },
              { num: '4,200', unit: '+', label: '누적 프로젝트' },
              { num: '15', unit: '개국', label: '해외 진출' },
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
              <h2 className="section-title-ed">최신 <span className="accent">뉴스</span></h2>
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
                에너지 혁신,<br />
                <span className="accent">KDN과 함께</span> 시작하세요.
              </h2>
            </div>
            <div>
              <p className="cta-lead">
                전력 인프라 구축, 스마트그리드, AI 에너지 플랫폼 등
                다양한 에너지 기술 솔루션에 대해 전문가와 상담해보세요.
              </p>
              <div className="cta-actions">
                <Link to="/contact" className="btn btn-white">
                  문의 바로가기
                  <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
                <Link to="/about" className="btn btn-outline" style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.35)' }}>
                  회사 소개
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
