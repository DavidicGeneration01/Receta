import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const VerifyFlutterwave = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(AppContext)

  useEffect(() => {
    const verifyPayment = async () => {
      const status = searchParams.get('status')
      const tx_ref = searchParams.get('tx_ref')
      const transaction_id = searchParams.get('transaction_id')

      if (status === 'successful' && tx_ref && transaction_id) {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/verifyFlutterwave',
            { tx_ref, transaction_id },
            { headers: { token } }
          )
          if (data.success) {
            toast.success('Payment confirmed!')
          } else {
            toast.error(data.message || 'Payment verification failed.')
          }
        } catch (error) {
          console.log(error)
          toast.error('Something went wrong during verification.')
        }
      } else {
        toast.error('Payment was not successful.')
      }

      navigate('/my-appointments')
    }

    verifyPayment()
  }, [])

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <p className='text-lg text-zinc-600'>Verifying your payment, please wait...</p>
    </div>
  )
}

export default VerifyFlutterwave