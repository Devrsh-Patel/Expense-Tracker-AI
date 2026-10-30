import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { expenseAPI } from '../services/api'
import { toast } from 'react-toastify'

const QUESTIONS = [
  {
    id: 'income_source',
    title: 'What is your primary source of income?',
    options: ['Salary / Job', 'Business / Self-Employed', 'Freelancing', 'Student / Pocket Money', 'Investments', 'Other']
  },
  {
    id: 'family_members',
    title: 'How many members are in your family?',
    options: ['Just me (1)', '2 members', '3-4 members', '5-6 members', '7 or more']
  },
  {
    id: 'purpose',
    title: 'Why do you want to use FinTracker?',
    options: ['Track daily expenses', 'Save money and budget', 'Manage family finances', 'Business expense tracking', 'Achieve a financial goal']
  },
  {
    id: 'has_loan',
    title: 'Do you have any active loans or EMIs?',
    options: ['No loans / EMIs', 'Home Loan', 'Personal Loan', 'Car / Vehicle Loan', 'Education Loan', 'Multiple loans']
  },
  {
    id: 'biggest_expense',
    title: 'What is your biggest monthly expense?',
    options: ['Rent / Housing', 'Food and Dining', 'Transport', 'Education', 'Healthcare', 'Shopping / Entertainment']
  }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  const handleNext = async () => {
    if (!selected) { toast.warning('Please select an option'); return }

    const updated = { ...answers, [current.id]: selected }
    setAnswers(updated)

    if (isLast) {
      setLoading(true)
      try {
        await expenseAPI.onboarding(updated)
        completeOnboarding()
        toast.success('All set! Welcome to FinTracker!')
        navigate('/dashboard')
      } catch (error) {
        toast.error('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      setStep(s => s + 1)
      setSelected('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf4, #fff8f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }} className="fade-in">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>
            <span style={{ color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>Fin</span>
            <span style={{ color: '#1a73e8', fontWeight: '800' }}>Tracker</span>
          </span>
          <p style={{ color: 'var(--text-mid)', marginTop: '6px' }}>
            Hi {user?.name?.split(' ')[0]}! Let us personalize your experience
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
                {Math.round((step / QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '6px', height: '6px' }}>
              <div style={{
                background: 'var(--primary)',
                width: `${(step / QUESTIONS.length) * 100}%`,
                height: '100%',
                borderRadius: '6px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Question */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '20px' }}>
            {current.title}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {current.options.map(opt => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                style={{
                  padding: '13px 16px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  border: `2px solid ${selected === opt ? 'var(--primary)' : 'var(--border)'}`,
                  background: selected === opt ? 'rgba(45,106,79,0.07)' : 'white',
                  color: selected === opt ? 'var(--primary)' : 'var(--text-dark)',
                  fontWeight: selected === opt ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 0 && (
              <button
                onClick={() => {
                  setStep(s => s - 1)
                  setSelected(answers[QUESTIONS[step - 1].id] || '')
                }}
                style={{
                  flex: 1, padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: '10px', background: 'white',
                  color: 'var(--text-mid)', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                flex: 2, padding: '12px',
                background: loading ? '#aaa' : 'var(--primary)',
                color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : isLast ? 'Go to Dashboard' : 'Next'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}