import { createContext, useState, useCallback } from "react";
import axios from 'axios';
import {toast} from 'react-toastify';

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllDoctors = async () => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { 
                headers: { atoken: aToken }  // ✅ fixed lowercase
            })
            if (data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvialability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', {docId}, { 
                headers: { atoken: aToken }  // ✅ fixed lowercase
            })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { 
                headers: { atoken: aToken }  // ✅ already correct
            })
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])

    const value = {
        aToken, setAToken, backendUrl, doctors, getAllDoctors,
        changeAvialability, appointments, setAppointments, getAllAppointments
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider