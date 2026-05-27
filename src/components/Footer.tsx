import { Link } from 'react-router-dom'
import type { ReactElement } from 'react'

const Footer = (): ReactElement => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">한전KDN</div>
          <p className="footer-tagline">
            디지털 혁신, 에너지 대전환을 선도하는<br />
            글로벌 에너지ICT의 중심
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              ['주소', '전라남도 나주시 빛가람로 661'],
              ['전화', '061-931-7114'],
              ['사업자', '116-81-32242'],
              ['설립', '1992년'],
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
            <li><Link to="/about">회사소개</Link></li>
            <li><Link to="/business">솔루션·서비스</Link></li>
            <li><Link to="/news">정보공개</Link></li>
            <li><Link to="/news">입찰·고객지원</Link></li>
            <li><Link to="/contact">국민소통</Link></li>
          </ul>
        </div>

        <div>
          <h5>사업영역</h5>
          <ul>
            <li><Link to="/business">발전·급전ICT</Link></li>
            <li><Link to="/business">송변전ICT</Link></li>
            <li><Link to="/business">배전ICT</Link></li>
            <li><Link to="/business">판매ICT</Link></li>
            <li><Link to="/business">전력통신/정보보호ICT</Link></li>
            <li><Link to="/business">에너지신사업</Link></li>
          </ul>
        </div>

        <div>
          <h5>관련 사이트</h5>
          <ul>
            <li><a href="https://www.kepco.co.kr" target="_blank" rel="noopener noreferrer">한국전력공사(KEPCO)</a></li>
            <li><a href="https://www.kdn.com" target="_blank" rel="noopener noreferrer">한전KDN 공식사이트</a></li>
            <li><a href="https://www.motie.go.kr" target="_blank" rel="noopener noreferrer">산업통상자원부</a></li>
            <li><a href="https://www.energy.or.kr" target="_blank" rel="noopener noreferrer">에너지관리공단</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 1992 &ndash; {new Date().getFullYear()} 한전KDN. All rights reserved.</span>
        <span>사업자등록번호 116-81-32242</span>
      </div>
    </div>
  </footer>
)

export default Footer
