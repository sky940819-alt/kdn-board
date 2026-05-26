import type { ReactElement } from 'react'

const BUSINESSES = [
  {
    num: '01',
    icon: '⚡',
    tag: 'Power Infrastructure',
    title: '전력 인프라',
    desc: '345kV 초고압 변전소 설계·건설부터 배전 자동화 시스템 구축까지 전력 인프라 전 분야를 아우릅니다. KEPCO 협력사로서 전국 154개 변전소 운영 노하우를 보유하고 있습니다.',
    points: ['초고압 변전소 설계·건설 (345kV, 154kV)', '배전 자동화 시스템 (DAS)', '지중화 케이블 시공 관리', '전력 기자재 품질 관리', '전력계통 안정화 솔루션'],
    tag2: '국내 시장점유율 1위',
  },
  {
    num: '02',
    icon: '🔋',
    tag: 'Smart Grid',
    title: '스마트그리드',
    desc: 'IoT 센서·AI·빅데이터를 결합한 지능형 전력망으로 실시간 부하 예측과 최적 전력 배분을 실현합니다. 전국 1,200만 스마트미터 운영 데이터를 기반으로 합니다.',
    points: ['AMI(스마트미터) 구축 및 운영', '실시간 전력 수요 예측 AI', '피크 부하 저감 자동화', '전기차 충전 인프라 연계', '에너지 저장장치(ESS) 통합 관리'],
    tag2: '스마트미터 1,200만 대 운영',
  },
  {
    num: '03',
    icon: '🏗️',
    tag: 'Digital Substation',
    title: '디지털 변전',
    desc: 'IEC 61850 국제 표준 기반 디지털 변전소를 구축하여 설비 운영 효율을 높이고 유지보수 비용을 절감합니다. 실시간 설비 상태 모니터링으로 고장 예방을 실현합니다.',
    points: ['IEC 61850 기반 변전 자동화', 'GIS(가스절연개폐장치) 디지털화', '원격 제어·감시 시스템 (SCADA)', '변전소 AI 예방 정비', '사이버 보안 통합 관제'],
    tag2: '국내 디지털 변전 선도 기업',
  },
  {
    num: '04',
    icon: '🌿',
    tag: 'Renewable Energy',
    title: '신재생에너지',
    desc: '태양광, 해상풍력, 수소 연료전지 등 다양한 신재생에너지원을 전력망에 안정적으로 연계하는 통합 시스템을 구축합니다.',
    points: ['해상풍력 연계 변전 시스템', '태양광 발전소 EPC', 'ESS 통합 관제 플랫폼', '수소 연료전지 계통 연계', 'RE100 솔루션 컨설팅'],
    tag2: '신재생 연계 용량 5GW+',
  },
  {
    num: '05',
    icon: '🤖',
    tag: 'AI · Data Platform',
    title: 'AI·데이터 플랫폼',
    desc: '전력 빅데이터와 머신러닝을 활용한 에너지 AI 플랫폼 "Grid AI"로 설비 고장 예측, 에너지 최적화, 수요 관리를 자동화합니다.',
    points: ['설비 이상 징후 예측 AI', '전력 수요 예측 모델', 'Digital Twin 전력망 시뮬레이션', '에너지 빅데이터 분석 플랫폼', 'API 기반 외부 연계 솔루션'],
    tag2: 'Grid AI 2026 — 특허 28건',
  },
  {
    num: '06',
    icon: '🔐',
    tag: 'Cyber Security',
    title: '사이버 보안',
    desc: '전력 SCADA·OT 시스템 특화 사이버 보안 솔루션으로 국가 핵심 에너지 인프라를 사이버 위협으로부터 보호합니다.',
    points: ['OT/IT 통합 보안 관제', 'SCADA 이상 행위 탐지', '전력 계통 사이버 위협 대응', '보안 취약점 진단·컨설팅', '국가 사이버 보안 인증 획득'],
    tag2: 'ISMS-P 인증 · 국정원 검증',
  },
]

const Business = (): ReactElement => (
  <>
    <section className="page-header-ed">
      <div className="container">
        <div className="eyebrow">Business Areas</div>
        <h1>사업영역</h1>
        <p>전력 인프라부터 AI 에너지 플랫폼까지 6개 핵심 영역에서 혁신을 이어갑니다.</p>
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
                  background: 'var(--navy-100)',
                  color: 'var(--navy-700)',
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
