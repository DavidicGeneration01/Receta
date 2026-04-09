import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorDashboard = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false)
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescription: [{ medicine: '', dosage: '', duration: '' }],
    notes: ''
  })

  useEffect(() => {
    if (token) {
      fetchDoctorPatients()
    }
  }, [token])

  const fetchDoctorPatients = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/patients`,
        {},
        { headers: { dtoken: token } }
      )
      if (data.success) {
        setPatients(data.patients)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientMedicalRecord = async (patientId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/patient-medical-record`,
        { userId: patientId },
        { headers: { dtoken: token } }
      )
      if (data.success) {
        setMedicalRecord(data.medicalRecord)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch medical record')
    }
  }

  const selectPatient = (patient) => {
    setSelectedPatient(patient)
    fetchPatientMedicalRecord(patient._id)
    setShowDiagnosisForm(false)
    setFormData({
      diagnosis: '',
      prescription: [{ medicine: '', dosage: '', duration: '' }],
      notes: ''
    })
  }

  const addPrescriptionField = () => {
    setFormData({
      ...formData,
      prescription: [...formData.prescription, { medicine: '', dosage: '', duration: '' }]
    })
  }

  const removePrescriptionField = (index) => {
    const updatedPrescription = formData.prescription.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      prescription: updatedPrescription
    })
  }

  const updatePrescriptionField = (index, field, value) => {
    const updatedPrescription = [...formData.prescription]
    updatedPrescription[index][field] = value
    setFormData({
      ...formData,
      prescription: updatedPrescription
    })
  }

  const submitDiagnosis = async (e) => {
    e.preventDefault()

    if (!formData.diagnosis.trim()) {
      toast.warning('Please enter a diagnosis')
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/add-diagnosis`,
        {
          userId: selectedPatient._id,
          diagnosis: formData.diagnosis,
          prescription: formData.prescription.filter(p => p.medicine.trim()),
          notes: formData.notes
        },
        { headers: { dtoken: token } }
      )

      if (data.success) {
        toast.success('Diagnosis added successfully')
        fetchPatientMedicalRecord(selectedPatient._id)
        setShowDiagnosisForm(false)
        setFormData({
          diagnosis: '',
          prescription: [{ medicine: '', dosage: '', duration: '' }],
          notes: ''
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to add diagnosis')
    } finally {
      setLoading(false)
    }
  }

  if (loading && patients.length === 0) {
    return <div className='text-center py-20'>Loading...</div>
  }

  if (!patients.length && !loading) {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='max-w-6xl mx-auto py-20 px-4'>
          <h1 className='text-4xl font-bold mb-8'>Doctor Dashboard</h1>
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <p className='text-gray-600 text-lg'>No patients yet</p>
            <p className='text-gray-500'>Your patients will appear here</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        <h1 className='text-4xl font-bold mb-8'>Doctor Dashboard</h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Patients List */}
          <div className='bg-white rounded-lg shadow overflow-hidden flex flex-col h-96 lg:h-screen'>
            <div className='border-b p-4 bg-gradient-to-r from-teal-500 to-teal-600'>
              <h2 className='text-white font-semibold'>My Patients ({patients.length})</h2>
            </div>
            <div className='overflow-y-auto flex-1'>
              {patients.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => selectPatient(patient)}
                  className={`p-4 border-b cursor-pointer transition ${
                    selectedPatient?._id === patient._id
                      ? 'bg-teal-50 border-l-4 border-teal-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden flex-shrink-0'>
                      {patient.image ? (
                        <img src={patient.image} alt={patient.name} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-white font-bold'>
                          {patient.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-800 truncate'>{patient.name}</p>
                      <p className='text-xs text-gray-500'>{patient.email}</p>
                      <p className='text-xs text-gray-400'>{patient.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Details & Diagnosis Form */}
          {selectedPatient ? (
            <div className='lg:col-span-2 space-y-6'>
              {/* Patient Info */}
              <div className='bg-white rounded-lg shadow p-6'>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full overflow-hidden'>
                    {selectedPatient.image ? (
                      <img src={selectedPatient.image} alt={selectedPatient.name} className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-white text-2xl font-bold'>
                        {selectedPatient.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800'>{selectedPatient.name}</h2>
                    <p className='text-gray-600'>{selectedPatient.email}</p>
                    <p className='text-gray-600'>{selectedPatient.phone}</p>
                    {selectedPatient.lastAppointment && (
                      <p className='text-sm text-gray-500 mt-2'>
                        Last Appointment: {new Date(selectedPatient.lastAppointment).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
                  className='w-full bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition'
                >
                  {showDiagnosisForm ? 'Cancel' : 'Add Diagnosis'}
                </button>
              </div>

              {/* Add Diagnosis Form */}
              {showDiagnosisForm && (
                <div className='bg-white rounded-lg shadow p-6'>
                  <h3 className='text-xl font-bold mb-4'>Add Diagnosis for {selectedPatient.name}</h3>
                  <form onSubmit={submitDiagnosis} className='space-y-4'>
                    {/* Diagnosis */}
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Diagnosis *</label>
                      <textarea
                        value={formData.diagnosis}
                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                        placeholder='Enter diagnosis details'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500'
                        rows='3'
                        required
                      />
                    </div>

                    {/* Prescription */}
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Prescription</label>
                      <div className='space-y-3'>
                        {formData.prescription.map((med, index) => (
                          <div key={index} className='flex gap-2'>
                            <input
                              type='text'
                              placeholder='Medicine name'
                              value={med.medicine}
                              onChange={(e) => updatePrescriptionField(index, 'medicine', e.target.value)}
                              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500'
                            />
                            <input
                              type='text'
                              placeholder='Dosage'
                              value={med.dosage}
                              onChange={(e) => updatePrescriptionField(index, 'dosage', e.target.value)}
                              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500'
                            />
                            <input
                              type='text'
                              placeholder='Duration'
                              value={med.duration}
                              onChange={(e) => updatePrescriptionField(index, 'duration', e.target.value)}
                              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500'
                            />
                            {formData.prescription.length > 1 && (
                              <button
                                type='button'
                                onClick={() => removePrescriptionField(index)}
                                className='px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition'
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type='button'
                        onClick={addPrescriptionField}
                        className='mt-2 px-4 py-2 border border-teal-500 text-teal-500 rounded-lg hover:bg-teal-50 transition'
                      >
                        + Add Medicine
                      </button>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Additional Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder='Any additional notes for the patient'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500'
                        rows='2'
                      />
                    </div>

                    <button
                      type='submit'
                      disabled={loading}
                      className='w-full bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50'
                    >
                      {loading ? 'Submitting...' : 'Submit Diagnosis'}
                    </button>
                  </form>
                </div>
              )}

              {/* Medical History */}
              {medicalRecord && (
                <div className='bg-white rounded-lg shadow p-6'>
                  <h3 className='text-xl font-bold mb-4'>Patient Medical History</h3>

                  {medicalRecord.consultationHistory && medicalRecord.consultationHistory.length > 0 && (
                    <div className='space-y-4'>
                      <div>
                        <h4 className='font-semibold text-lg mb-3 text-teal-600'>Consultation History</h4>
                        {medicalRecord.consultationHistory.map((consultation, idx) => (
                          <div key={idx} className='border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition'>
                            <div className='flex justify-between items-start mb-2'>
                              <div>
                                <p className='text-sm text-gray-600'>Date</p>
                                <p className='font-semibold'>{new Date(consultation.consultationDate).toLocaleDateString()}</p>
                              </div>
                              <span className='text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-full'>
                                {consultation.speciality}
                              </span>
                            </div>

                            {consultation.diagnosis && (
                              <div className='mb-3 p-3 bg-blue-50 rounded'>
                                <p className='text-sm font-semibold text-blue-900'>Diagnosis:</p>
                                <p className='text-sm text-blue-800'>{consultation.diagnosis}</p>
                              </div>
                            )}

                            {consultation.prescription?.length > 0 && (
                              <div className='mb-3'>
                                <p className='text-sm font-semibold mb-2'>Prescription:</p>
                                <div className='space-y-1 pl-4'>
                                  {consultation.prescription.map((med, i) => (
                                    <p key={i} className='text-sm text-gray-700'>
                                      • {med.medicine} - {med.dosage} for {med.duration}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {consultation.notes && (
                              <div className='text-sm text-gray-700'>
                                <p className='font-semibold mb-1'>Notes:</p>
                                <p>{consultation.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!medicalRecord.consultationHistory || medicalRecord.consultationHistory.length === 0) && (
                    <p className='text-gray-600 text-center py-4'>No consultation history</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='lg:col-span-2 bg-white rounded-lg shadow flex items-center justify-center h-96 lg:h-screen'>
              <p className='text-gray-500 text-center text-lg'>
                Select a patient to view their medical history and add diagnosis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
