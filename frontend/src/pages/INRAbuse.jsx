import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import ResultDisplay from '../components/ResultDisplay'
import { Box, HelpCircle } from 'lucide-react'

export default function INRAbuse() {
  const [formData, setFormData] = useState({
    customer_id: '',
    delivery_status: 'Delivered',
    past_inr_claims: '',
    account_age_days: '',
    high_value_order: false
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const response = await api.post('/inr-abuse', formData)
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing INR abuse.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <Box className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold tracking-wide">INR Abuse Detector</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Customer Identifier (ID/Email)</label>
            <input type="text" name="customer_id" required value={formData.customer_id} onChange={handleChange} placeholder="e.g. CUST_8821" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Past INR Claims</label>
              <input type="number" name="past_inr_claims" required min="0" value={formData.past_inr_claims} onChange={handleChange} placeholder="e.g. 2" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Account Age (Days)</label>
              <input type="number" name="account_age_days" required min="0" value={formData.account_age_days} onChange={handleChange} placeholder="e.g. 45" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="high_value_order" checked={formData.high_value_order} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">High Value Order (&gt; ₹2000)</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/80 text-background font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50">
            {loading ? 'Analyzing Claims...' : 'Check INR History'}
          </button>
        </form>
      </div>

      <div className="min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 h-full shadow-xl"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full"
                />
              </div>
              <div className="space-y-2">
                <p className="text-accent font-bold uppercase tracking-widest text-xs animate-pulse">Analyzing Claim Patterns...</p>
                <p className="text-[10px] text-gray-500 font-mono max-w-[250px] mx-auto leading-relaxed">
                  Checking for "Item Not Received" (INR) abuse patterns across customer history and account velocity.
                </p>
                <p className="text-[9px] text-accent/40 font-mono mt-4 italic">
                  Note: Initial analysis may take 30-40s as our AI core initializes.
                </p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ResultDisplay result={result} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 h-full shadow-xl"
            >
              <HelpCircle className="w-12 h-12 text-white/5" />
              <p className="text-gray-500 text-sm font-medium">Enter customer data to begin INR analysis</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
