import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Business from './pages/Business'
import News from './pages/News'
import Contact from './pages/Contact'
import CurriculumDay25 from './pages/CurriculumDay25'
import type { ReactElement } from 'react'

function App(): ReactElement {
  return (
    <Router basename="/kdn-board">
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/business" element={<Business />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/curriculum/day25" element={<CurriculumDay25 />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
