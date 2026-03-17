import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const navigate = useNavigate()

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Dynamically load Flutterwave inline script
  const loadFlutterwaveScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('flutterwave-script')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.id = 'flutterwave-script'
      script.src = 'https://checkout.flutterwave.com/v3.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Opens Flutterwave inline checkout modal
  const initPay = async (order) => {
    const scriptLoaded = await loadFlutterwaveScript()

    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway. Please try again.')
      return
    }

    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: "txref-" + order.receipt + "-" + Date.now(),
      amount: order.amount,
      currency: order.currency || 'NGN',
      payment_options: "card, banktransfer, ussd",
      redirect_url: window.location.origin + "/verify-flutterwave",
      customer: {
        email: "user@example.com",
        name: "Patient",
      },
      customizations: {
        title: "Appointment Booking",
        description: "Payment for your appointment",
        logo: window.location.origin + "/logo.png",
      },
    })
  }

  // Calls backend to get order details, then opens Flutterwave
  const appointmentFlutterwave = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-flutterwave',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {appointments.slice(0, 3).map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>Date & Time</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>

              {/* Paid button - grey, shown when payment is confirmed */}
              {!item.cancelled && item.payment && (
                <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-stone-200 cursor-default'>
                  Paid
                </button>
              )}

              {/* Pay Online button */}
              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => appointmentFlutterwave(item._id)}
                  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                >
                  Cancel Appointment
                </button>
              )}

              {item.cancelled && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                  Appointment cancelled
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments