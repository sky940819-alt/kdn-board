import { Link } from 'react-router-dom'
import type { ReactElement } from 'react'

const Footer = (): ReactElement => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">KDN 한국전력기술</div>
          <p className="footer-tagline">
            스마트 에너지 기술로 대한민국 전력망을 설계하고 운영합니다.<br />
            에너지 전환 시대, KDN이 함께합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              ['주소', '전라남도 나주시 빛가람로 760'],
              ['전화', '061-345-3000'],
              ['이메일', 'info@kdn.com'],
              ['사업시간', '평일 09:00 ~ 18:00'],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: '8px' }}>{k}</span>
                {v}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5>바로가기</h5>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/about">회사소개</Link></li>
            <li><Link to="/business">사업영역</Link></li>
            <li><Link to="/news">뉴스&공지</Link></li>
            <li><Link to="/contact">문의하기</Link></li>
          </ul>
        </div>

        <div>
          <h5>사업영역</h5>
          <ul>
            <li><Link to="/business">전력 인프라</Link></li>
            <li><Link to="/business">스마트그리드</Link></li>
            <li><Link to="/business">디지털 변전</Link></li>
            <li><Link to="/business">신재생에너지</Link></li>
            <li><Link to="/business">AI·데이터</Link></li>
          </ul>
        </div>

        <div>
          <h5>관련 사이트</h5>
          <ul>
            <li><a href="https://www.kepco.co.kr" target="_blank" rel="noopener noreferrer">한국전력공사</a></li>
            <li><a href="https://www.kdn.com" target="_blank" rel="noopener noreferrer">KDN 공식사이트</a></li>
            <li><a href="https://www.motie.go.kr" target="_blank" rel="noopener noreferrer">산업통상자원부</a></li>
            <li><a href="https://www.energy.or.kr" target="_blank" rel="noopener noreferrer">에너지관리공단</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2024 &ndash; {new Date().getFullYear()} KDN 한국전력기술. All rights reserved.</span>
        <span>v.2026 · Smart Energy Technology</span>
      </div>
    </div>
  </footer>
)

export default Footer
