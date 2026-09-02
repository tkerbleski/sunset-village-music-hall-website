import Nav from './components/Nav'
import Hero from './components/Hero'
import Story from './components/Story'
import Businesses from './components/Businesses'
import MusicHall from './components/MusicHall'
import Spaces from './components/Spaces'
import BookingForm from './components/BookingForm'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Story />
        <Businesses />
        <MusicHall />
        <Spaces />
        <BookingForm />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
