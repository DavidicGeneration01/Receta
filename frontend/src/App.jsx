import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import VerifyFlutterwave from './pages/VerifyFlutterwave'
import Labs from './pages/Labs'
import LabBooking from './pages/LabBooking'
import MyLabBookings from './pages/MyLabBookings'
import Pharmacies from './pages/Pharmacies'
import Pharmacy from './pages/Pharmacy'
import DoctorDashboard from './pages/DoctorDashboard'
import MyMessages from './pages/MyMessages'
import MedicalHistory from './pages/MedicalHistory'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppContextProvider from './context/AppContext'
import { ToastContainer } from 'react-toastify'


const App = () => {
  return (
    <AppContextProvider>
      <div className='mx-4 sm:mx-[10%]'>
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path='/verify-flutterwave' element={<VerifyFlutterwave />} />
          <Route path='/labs' element={<Labs />} />
          <Route path='/lab-booking' element={<LabBooking />} />
          <Route path='/my-lab-bookings' element={<MyLabBookings />} />
          <Route path='/pharmacies' element={<Pharmacies />} />
          <Route path='/pharmacy/:pharmacyId' element={<Pharmacy />} />
          <Route path='/my-messages' element={<MyMessages />} />
          <Route path='/medical-history' element={<MedicalHistory />} />
        </Routes>
        <Footer />
      </div>
    </AppContextProvider>
  )
}

export default App