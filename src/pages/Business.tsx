import type { ReactElement } from 'react'

const BUSINESSES = [
  {
    num: '01',
    icon: '🔆',
    tag: 'Generation · Dispatch ICT',
    title: '발전·급전ICT',
    desc: '발전소 운영 정보화 및 실시간 급전자동화 시스템으로 전력 수급 균형을 유지하고 전력 계통의 안정 운영을 지원합니다.',
    points: [
      '발전소 운영정보 시스템 (POMIS)',
      '실시간 급전자동화 (EMS)',
      '발전 계획 및 연료 관리 최적화',
      '전력거래소 연계 정보 시스템',
      '발전 빅데이터 분석 플랫폼',
    ],
    tag2: '전력거래소·발전사 핵심 파트너',
  },
  {
    num: '02',
    icon: '⚡',
    tag: 'Transmission · Substation ICT',
    title: '송변전ICT',
    desc: '초고압 송전망 및 변전소 디지털화로 전국 전력망의 안정적 운영과 효율적 유지·보수를 실현합니다.',
    points: [
      'SCADA/EMS 변전소 자동화',
      'IEC 61850 디지털 변전소 구축',
      'GIS 기반 송전선로 관리 시스템',
      '변전설비 예방정비 AI 플랫폼',
      '원격 감시·제어 통합 관제',
    ],
    tag2: '전국 변전소 운영 솔루션 1위',
  },
  {
    num: '03',
    icon: '🔌',
    tag: 'Distribution ICT',
    title: '배전ICT',
    desc: '배전 지능화·자동화 시스템으로 정전 구간을 자동 분리·복구하여 전력 품질과 공급 신뢰도를 향상합니다.',
    points: [
      '배전자동화 시스템 (DAS)',
      '지능형 전력망 (Smart Grid) 구축',
      '배전 GIS 기반 설비 관리',
      '실시간 배전계통 모니터링',
      '배전 운영센터 통합 시스템',
    ],
    tag2: '전국 배전자동화 선도',
  },
  {
    num: '04',
    icon: '📊',
    tag: 'Sales ICT',
    title: '판매ICT',
    desc: 'AMI(스마트미터) 기반 전력 판매 정보화로 실시간 전력 사용량 관리 및 에너지 효율화 서비스를 제공합니다.',
    points: [
      'AMI(Advanced Metering Infrastructure) 구축',
      '스마트미터 데이터 수집·관리 플랫폼',
      '전기요금 청구·수납 정보 시스템',
      '전기차 충전 인프라 연계 (CHA-ON)',
      '에너지 DR(수요반응) 시스템',
    ],
    tag2: '스마트미터 2,300만 대 운영',
  },
  {
    num: '05',
    icon: '🛡️',
    tag: 'Power Telecom / Info-Security ICT',
    title: '전력통신/정보보호ICT',
    desc: '전력 전용 통신망 구축·운영 및 OT/IT 통합 사이버 보안 체계로 국가 핵심 에너지 인프라를 보호합니다.',
    points: [
      '전력 광케이블(OPGW) 통신망 운영',
      'OT/IT 통합 보안 관제센터 운영',
      'SCADA 사이버 위협 탐지·대응',
      '전력 정보보호 컨설팅 및 인증',
      '전력통신 위성·마이크로웨이브 백업망',
    ],
    tag2: 'ISMS-P 인증 · 국정원 검증필',
  },
  {
    num: '06',
    icon: '🌱',
    tag: 'New Energy Business',
    title: '에너지신사업',
    desc: '신재생에너지, ESS, 마이크로그리드, 수소 등 에너지 전환 시대를 선도하는 신사업 ICT 솔루션을 개척합니다.',
    points: [
      '신재생에너지 연계 계통 ICT',
      'ESS 통합 에너지 관리 시스템 (EMS)',
      '마이크로그리드 운영 최적화',
      '수소·연료전지 계통 연계 솔루션',
      '탄소중립 에너지 데이터 플랫폼',
    ],
    tag2: '에너지 전환 신사업 선도',
  },
]

const Business = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">Solutions &amp; Services</div>
        <h1>솔루션·서비스</h1>
        <p>한전KDN의 6대 에너지ICT 사업영역을 소개합니다.</p>
      </div>
    </section>

    <section className="section-ed">
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {BUSINESSES.map((b) => (
            <div
              key={b.num}
              style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: '48px',
                paddingBottom: '48px',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{b.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: '8px' }}>
                  {b.tag}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                  {b.title}
                </h3>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--kdn-red-100)',
                  color: 'var(--kdn-red-700)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '2px',
                }}>
                  {b.tag2}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                  {b.desc}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {b.points.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <span style={{ width: '6px', height: '6px', background: 'var(--gold)', borderRadius: '50%', flexShrink: 0, marginTop: '6px' }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
)

export default Business
