import { useState, type ReactElement, type FormEvent } from 'react'

const OFFICES = [
  { name: '본사 (나주)', addr: '전라남도 나주시 빛가람로 760', tel: '061-345-3000', fax: '061-345-3009' },
  { name: '서울 사무소', addr: '서울특별시 강남구 테헤란로 152, 12층', tel: '02-6200-1000', fax: '02-6200-1009' },
  { name: '부산 사무소', addr: '부산광역시 해운대구 센텀중앙로 55', tel: '051-720-5000', fax: '051-720-5009' },
]

const Contact = (): ReactElement => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', subject: '', body: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <section className="page-header-ed">
        <div className="container">
          <div className="eyebrow">Contact Us</div>
          <h1>문의하기</h1>
          <p>에너지 기술 솔루션, 사업 제안, 채용 문의 등 모든 문의를 환영합니다.</p>
        </div>
      </section>

      <section className="section-ed">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px', alignItems: 'start' }}>

            {/* 사무소 정보 */}
            <div>
              <div className="section-num">&mdash; Offices</div>
              <h2 className="section-title-ed" style={{ marginBottom: '32px' }}>
                <span className="accent">사무소</span> 안내
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {OFFICES.map((o, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-medium-gray)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      {o.name}
                    </div>
                    {[
                      ['주소', o.addr],
                      ['전화', o.tel],
                      ['팩스', o.fax],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: '12px', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-light)', width: '36px', flexShrink: 0 }}>{k}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    <strong style={{ color: 'var(--navy-800)' }}>이메일</strong><br />
                    일반 문의: info@kdn.com<br />
                    채용 문의: recruit@kdn.com<br />
                    기술 문의: tech@kdn.com
                  </div>
                </div>
              </div>
            </div>

            {/* 문의 폼 */}
            <div>
              <div className="section-num">&mdash; Inquiry</div>
              <h2 className="section-title-ed" style={{ marginBottom: '32px' }}>
                <span className="accent">온라인</span> 문의
              </h2>

              {sent ? (
                <div style={{
                  background: 'var(--navy-100)',
                  border: '1px solid var(--navy-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '48px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '8px' }}>
                    문의가 접수되었습니다.
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    영업일 기준 1~2일 내에 담당자가 회신드리겠습니다.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { key: 'name', label: '이름 *', type: 'text', placeholder: '홍길동', required: true },
                    { key: 'company', label: '소속 / 기관', type: 'text', placeholder: '(주)회사명', required: false },
                    { key: 'email', label: '이메일 *', type: 'email', placeholder: 'example@company.com', required: true },
                    { key: 'phone', label: '연락처', type: 'tel', placeholder: '010-0000-0000', required: false },
                    { key: 'subject', label: '문의 제목 *', type: 'text', placeholder: '문의 내용을 간략히 입력해주세요', required: true },
                  ].map(({ key, label, type, placeholder, required }) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-800)' }}>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        style={{
                          padding: '11px 14px',
                          border: '1.5px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                      />
                    </div>
                  ))}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-800)' }}>문의 내용 *</label>
                    <textarea
                      rows={6}
                      placeholder="문의하실 내용을 상세히 작성해주세요."
                      required
                      value={form.body}
                      onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                      style={{
                        padding: '11px 14px',
                        border: '1.5px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                    문의 제출하기
                    <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
