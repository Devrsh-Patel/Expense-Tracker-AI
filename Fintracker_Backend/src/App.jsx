/* eslint-disable */
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, OnboardingRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'

import LandingPage       from './pages/LandingPage'
import Register          from './pages/Register'
import Login             from './pages/Login'
import ForgotPassword    from './pages/ForgotPassword'
import Onboarding        from './pages/Onboarding'
import Dashboard         from './pages/Dashboard'
import AddExpense        from './pages/AddExpense'
import ExpenseList       from './pages/ExpenseList'
import Reports           from './pages/Reports'
import AIInsights        from './pages/AIInsights'
import Profile           from './pages/Profile'
import NotFound          from './pages/NotFound'
import AdminDashboard    from './admin/AdminDashboard'
import AdminLogin        from './pages/AdminLogin'
import BudgetPlanner     from './pages/BudgetPlanner'
import FinancialGoals    from './pages/FinancialGoals'
import RecurringExpenses from './pages/RecurringExpenses'
import BillSplitter      from './pages/BillSplitter'

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<LandingPage />} />
      <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding"      element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<OnboardingRoute><MainLayout><Dashboard /></MainLayout></OnboardingRoute>} />
      <Route path="/add-expense" element={<OnboardingRoute><MainLayout><AddExpense /></MainLayout></OnboardingRoute>} />
      <Route path="/expenses" element={<OnboardingRoute><MainLayout><ExpenseList /></MainLayout></OnboardingRoute>} />
      <Route path="/reports" element={<OnboardingRoute><MainLayout><Reports /></MainLayout></OnboardingRoute>} />
      <Route path="/ai-insights" element={<OnboardingRoute><MainLayout><AIInsights /></MainLayout></OnboardingRoute>} />
      <Route path="/profile" element={<OnboardingRoute><MainLayout><Profile /></MainLayout></OnboardingRoute>} />
      <Route path="/budget" element={<OnboardingRoute><MainLayout><BudgetPlanner /></MainLayout></OnboardingRoute>} />
      <Route path="/goals" element={<OnboardingRoute><MainLayout><FinancialGoals /></MainLayout></OnboardingRoute>} />
      <Route path="/recurring" element={<OnboardingRoute><MainLayout><RecurringExpenses /></MainLayout></OnboardingRoute>} />
      <Route path="/bill-split" element={<OnboardingRoute><MainLayout><BillSplitter /></MainLayout></OnboardingRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}