import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AdminRoute from './components/AdminRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Business from './pages/Business'
import News from './pages/News'
import Contact from './pages/Contact'
import CurriculumDay25 from './pages/CurriculumDay25'
import Board from './pages/Board'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './pages/admin/AdminLayout'
import UserManagement from './pages/admin/UserManagement'
import RoleManagement from './pages/admin/RoleManagement'
import LoginLogs from './pages/admin/LoginLogs'
import ActivityLogs from './pages/admin/ActivityLogs'
import type { ReactElement } from 'react'

// 관리자 페이지 래퍼 (Navbar·Footer 숨기고 AdminLayout 사용)
const AdminPage = ({ children }: { children: ReactElement }): ReactElement => (
  <AdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </AdminRoute>
)

function App(): ReactElement {
  return (
    <Router basename="/kdn-board">
      <AuthProvider>
        <Routes>
          {/* ── 관리자 라우트 (Navbar/Footer 없음) ── */}
          <Route path="/admin/users"          element={<AdminPage><UserManagement /></AdminPage>} />
          <Route path="/admin/roles"          element={<AdminPage><RoleManagement /></AdminPage>} />
          <Route path="/admin/login-logs"     element={<AdminPage><LoginLogs /></AdminPage>} />
          <Route path="/admin/activity-logs"  element={<AdminPage><ActivityLogs /></AdminPage>} />

          {/* ── 일반 라우트 (Navbar/Footer 있음) ── */}
          <Route path="/*" element={
            <div className="App">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/"                 element={<Home />} />
                  <Route path="/about"            element={<About />} />
                  <Route path="/business"         element={<Business />} />
                  <Route path="/news"             element={<News />} />
                  <Route path="/contact"          element={<Contact />} />
                  <Route path="/curriculum/day25" element={<CurriculumDay25 />} />
                  <Route path="/board"            element={<Board />} />
                  <Route path="/login"            element={<Login />} />
                  <Route path="/register"         element={<Register />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
