import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Wardrobing from './pages/Wardrobing'
import FakeDamage from './pages/FakeDamage'
import ReturnRing from './pages/ReturnRing'
import FriendlyFraud from './pages/FriendlyFraud'
import ReceiptFraud from './pages/ReceiptFraud'
import INRAbuse from './pages/INRAbuse'

import Landing from './pages/Landing'
import DashboardHome from './pages/DashboardHome'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<DashboardHome />} />
        <Route path="wardrobing" element={<Wardrobing />} />
        <Route path="fake-damage" element={<FakeDamage />} />
        <Route path="return-ring" element={<ReturnRing />} />
        <Route path="friendly-fraud" element={<FriendlyFraud />} />
        <Route path="receipt-fraud" element={<ReceiptFraud />} />
        <Route path="inr-abuse" element={<INRAbuse />} />
      </Route>
      {/* Fallback for old paths */}
      <Route path="/wardrobing" element={<Navigate to="/dashboard/wardrobing" replace />} />
      <Route path="/fake-damage" element={<Navigate to="/dashboard/fake-damage" replace />} />
      <Route path="/return-ring" element={<Navigate to="/dashboard/return-ring" replace />} />
      <Route path="/friendly-fraud" element={<Navigate to="/dashboard/friendly-fraud" replace />} />
      <Route path="/receipt-fraud" element={<Navigate to="/dashboard/receipt-fraud" replace />} />
      <Route path="/inr-abuse" element={<Navigate to="/dashboard/inr-abuse" replace />} />
    </Routes>
  )
}

export default App
