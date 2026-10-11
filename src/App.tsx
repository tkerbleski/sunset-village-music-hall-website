import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import NewsletterPopup from './components/NewsletterPopup'
import Home from './pages/Home'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import MusicHallPage from './pages/MusicHallPage'

// The admin area only loads when someone visits /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** Scroll to top on route change, or to the hash target when there is one. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function PublicSite() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/music-hall" element={<MusicHallPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <NewsletterPopup />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  )
}
